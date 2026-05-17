'use client';

import { useCallback, useRef } from 'react';
import { useGameStore, type EnemyIntent, type PreRolledDrop } from '../store/gameStore';
import {
  TDB, ENM, QST, LOC, SETS, RARITY_CONFIG,
  getItemData, rollRarity, scaleStat,
  SKILL_RARITY_MULTIPLIER, getZoneMaxRarityIndex,
} from '../constants';
import type { Rarity } from '../constants';
import type { CombatFx, LogEntry, InventoryItem, EquipSlot, TempBuffs } from '../types';
import { DEFAULT_TEMP_BUFFS } from '../types';

/**
 * useCombatActions — 4-Action Turn-Based Combat System.
 * Each turn has a Planning Phase (player orders 4 skills) 
 * and an Execution Phase (8 actions execute slot by slot).
 */

// ── Helper functions (pure, no React) ──

function computeActiveSets(equipment: Record<string, EquipSlot | null>): Record<string, number> {
  const counts: Record<string, number> = {};
  const RARE_PLUS = ['raro', 'epico', 'legendario'];
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    const item = eq ? getItemData(eq.id) : null;
    if (item && item.set && eq && RARE_PLUS.includes(eq.rarity)) {
      counts[item.set] = (counts[item.set] || 0) + 1;
    }
  });
  return counts;
}

function computeAttack(equipment: Record<string, EquipSlot | null>): number {
  let bonus = 0;
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.attack || 0;
  });
  const sets = computeActiveSets(equipment);
  Object.entries(sets).forEach(([setName, count]) => {
    const setData = (SETS as any)[setName];
    if (setData) {
      if (count >= 2) bonus += setData.bonus2.stats?.attack || 0;
      if (count >= 4) bonus += setData.bonus4.stats?.attack || 0;
    }
  });
  return 8 + bonus;
}

function computeDefense(equipment: Record<string, EquipSlot | null>): number {
  let bonus = 0;
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.defense || 0;
  });
  const sets = computeActiveSets(equipment);
  Object.entries(sets).forEach(([setName, count]) => {
    const setData = (SETS as any)[setName];
    if (setData) {
      if (count >= 2) bonus += setData.bonus2.stats?.defense || 0;
      if (count >= 4) bonus += setData.bonus4.stats?.defense || 0;
    }
  });
  return 2 + bonus;
}

function computeCrit(baseCrit: number, equipment: Record<string, EquipSlot | null>): number {
  let bonus = 0;
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.crit || 0;
  });
  const sets = computeActiveSets(equipment);
  Object.entries(sets).forEach(([setName, count]) => {
    const setData = (SETS as any)[setName];
    if (setData) {
      if (count >= 2) bonus += setData.bonus2.stats?.crit || 0;
      if (count >= 4) bonus += setData.bonus4.stats?.crit || 0;
    }
  });
  return baseCrit + bonus;
}

export function computeSpeed(equipment: Record<string, EquipSlot | null>): number {
  let bonus = 0;
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.speed || 0;
  });
  const sets = computeActiveSets(equipment);
  Object.entries(sets).forEach(([setName, count]) => {
    const setData = (SETS as any)[setName];
    if (setData) {
      if (count >= 2) bonus += setData.bonus2.stats?.speed || 0;
      if (count >= 4) bonus += setData.bonus4.stats?.speed || 0;
    }
  });
  return 8 + bonus;
}

function computeMaxPieces(maxPieces: number, equipment: Record<string, EquipSlot | null>): number {
  let bonus = 0;
  (Object.values(equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)?.stats?.maxPieces) bonus += getItemData(eq.id).stats.maxPieces;
  });
  return maxPieces + bonus;
}

function findSkillSlotLocal(techName: string, equipment: Record<string, EquipSlot | null>): string | null {
  const { head, torso, arms, legs } = equipment;
  if (head && head.id) { const data = getItemData(head.id); if (data?.skillIds?.includes(techName)) return 'head'; }
  if (torso && torso.id) { const data = getItemData(torso.id); if (data?.skillIds?.includes(techName)) return 'torso'; }
  if (arms && arms.id) { const data = getItemData(arms.id); if (data?.skillIds?.includes(techName)) return 'arms'; }
  if (legs && legs.id) { const data = getItemData(legs.id); if (data?.skillIds?.includes(techName)) return 'legs'; }
  if (techName === '💀 Cabezazo Barnaby') return 'head';
  if (techName === '🛡️ Costillas Enrejadas') return 'torso';
  if (techName === '🦾 Puño Óseo') return 'arms';
  if (techName === '👻 Voluntad Post-Mortem') return 'legs';
  return null;
}

/** Get the default skill for each equipment slot (one skill per slot, 4 slots total) */
export function getPlayerSlotSkills(equipment: Record<string, EquipSlot | null>): {
  slotKey: string;
  skillId: string;
  putrefaccion: number;
  isAvailable: boolean;
}[] {
  const slots: { slotKey: string; defaultSkill: string }[] = [
    { slotKey: 'head', defaultSkill: '💀 Cabezazo Barnaby' },
    { slotKey: 'torso', defaultSkill: '🛡️ Costillas Enrejadas' },
    { slotKey: 'arms', defaultSkill: '🦾 Puño Óseo' },
    { slotKey: 'legs', defaultSkill: '👻 Voluntad Post-Mortem' },
  ];
  return slots.map(({ slotKey, defaultSkill }) => {
    const eq = equipment[slotKey];
    let skillId = defaultSkill;
    let putrefaccion = -1;
    let isAvailable = true;
    if (eq && eq.id) {
      const data = getItemData(eq.id);
      if (data?.skillIds && data.skillIds.length > 0) skillId = data.skillIds[0];
      putrefaccion = eq.putrefaccion;
      isAvailable = eq.putrefaccion > 0;
    }
    return { slotKey, skillId, putrefaccion, isAvailable };
  });
}

function getEquippedSkillsList(equipment: Record<string, EquipSlot | null>): string[] {
  const { head, torso, arms, legs } = equipment;
  const skills: string[] = [];
  if (head && head.id && getItemData(head.id)?.skillIds) skills.push(...getItemData(head.id).skillIds);
  else if (!head) skills.push('💀 Cabezazo Barnaby');
  if (torso && torso.id && getItemData(torso.id)?.skillIds) skills.push(...getItemData(torso.id).skillIds);
  else if (!torso) skills.push('🛡️ Costillas Enrejadas');
  if (arms && arms.id && getItemData(arms.id)?.skillIds) skills.push(...getItemData(arms.id).skillIds);
  else if (!arms) skills.push('🦾 Puño Óseo');
  if (legs && legs.id && getItemData(legs.id)?.skillIds) skills.push(...getItemData(legs.id).skillIds);
  else if (!legs) skills.push('👻 Voluntad Post-Mortem');
  return Array.from(new Set(skills)).filter(Boolean);
}

const DEFAULT_COMBAT_FX: CombatFx = {
  enemyBleed: 0, enemyBleedTurns: 0, enemyPoison: 0, enemyPoisonTurns: 0,
  enemyFrozen: false, enemyDebuff: false, enemyDebuffTurns: 0,
  enemyFury: false, enemyFuryTurns: 0, enemyShield: false, enemyShieldValue: 0,
  playerShield: false, playerGuard: false,
  playerPoison: false, playerPoisonTurns: 0, playerPoisonDmg: 0,
  playerBleed: false, playerBleedTurns: 0, playerBleedDmg: 0,
  playerDebuff: false, playerDebuffTurns: 0,
  playerFrozen: false, playerStunCount: 0,
};

// ── Main hook ──

export function useCombatActions() {
  const store = useGameStore;
  const addToast = useGameStore(s => s.addToast);
  const setGameState = useGameStore(s => s.setGameState);
  const addCombatLog = useGameStore(s => s.addCombatLog);
  const setEnemyHp = useGameStore(s => s.setEnemyHp);
  const setCombatFx = useGameStore(s => s.setCombatFx);
  const setMasterSkillUsed = useGameStore(s => s.setMasterSkillUsed);
  const setActiveCombatVfx = useGameStore(s => s.setActiveCombatVfx);
  const addFloatingNumber = useGameStore(s => s.addFloatingNumber);
  const removeFloatingNumber = useGameStore(s => s.removeFloatingNumber);
  const setScreenShake = useGameStore(s => s.setScreenShake);
  const setFlash = useGameStore(s => s.setFlash);
  const setVsSlam = useGameStore(s => s.setVsSlam);
  const setEnemyActions = useGameStore(s => s.setEnemyActions);
  const setPlayerActionOrder = useGameStore(s => s.setPlayerActionOrder);
  const setTurnPhase = useGameStore(s => s.setTurnPhase);
  const setCurrentActionSlot = useGameStore(s => s.setCurrentActionSlot);
  const setTurnNumber = useGameStore(s => s.setTurnNumber);
  const setTempBuffs = useGameStore(s => s.setTempBuffs);

  const playerStunCountRef = useRef(0);
  const executionTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Use refs for circular function references to avoid stale closures
  const endTurnRef = useRef<(playSound: (type: string) => void) => void>(() => {});
  const endCombatRef = useRef<(victory: boolean, playSound: (type: string) => void, callbacks: any) => void>(() => {});
  const startTurnPlanningRef = useRef<() => void>(() => {});
  const executeNextActionRef = useRef<(playSound: (type: string) => void) => void>(() => {});
  const executePlayerSkillRef = useRef<(skillId: string, playSound: (type: string) => void, onComplete: () => void) => void>(() => {});
  const executeEnemySkillRef = useRef<(intent: EnemyIntent, playSound: (type: string) => void, onComplete: () => void) => void>(() => {});

  // ─── VFX helpers ───
  const triggerCombatVfx = useCallback((type: string, target: 'player' | 'enemy' = 'enemy') => {
    const id = Math.random().toString(36).substr(2, 9);
    setActiveCombatVfx({ type, id, target });
    setTimeout(() => setActiveCombatVfx(null), 1000);
  }, [setActiveCombatVfx]);

  const triggerFloatingNumber = useCallback((val: string, type: 'damage' | 'heal' | 'crit' | 'shield') => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    const y = 20 + Math.random() * 30;
    addFloatingNumber({ id, val, type, x, y });
    setTimeout(() => removeFloatingNumber(id), 1000);
  }, [addFloatingNumber, removeFloatingNumber]);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
  }, [setScreenShake]);

  const triggerFlash = useCallback((type: 'damage' | 'crit') => {
    setFlash(type);
    setTimeout(() => setFlash(null), 150);
  }, [setFlash]);

  const updateCombatFx = useCallback((partial: Partial<CombatFx>) => {
    const current = store.getState().combatFx || DEFAULT_COMBAT_FX;
    setCombatFx({ ...current, ...partial });
  }, [store, setCombatFx]);

  // ═══════════════════════════════════════════════════════════════
  // Calculate 4 enemy actions for the planning phase
  // ═══════════════════════════════════════════════════════════════
  const calculateEnemyActionsForTurn = useCallback(
    (enemyData: any, currentEnemyHp: number, currentEnemyMaxHp: number, isMasterUsed: boolean): EnemyIntent[] => {
      const def = computeDefense(store.getState().equipment);
      const preRolledDrop = store.getState().preRolledDrop;
      const parts = enemyData.parts || [];
      let skillIds: string[] = parts.map((p: any) => p.skill);
      
      // Fill to 4 by cycling
      while (skillIds.length < 4 && skillIds.length > 0) {
        skillIds.push(skillIds[skillIds.length % parts.length]);
      }
      if (skillIds.length === 0) {
        const pattern = enemyData.intentPattern || ['attack'];
        skillIds = Array.from({ length: 4 }, (_, i) => pattern[i % pattern.length]);
      }
      skillIds = skillIds.slice(0, 4);
      
      // Master skill
      const masterSkillId = enemyData.masterSkill;
      const masterSkillRef = masterSkillId ? TDB[masterSkillId] : null;
      let useMaster = false;
      if (masterSkillRef && !isMasterUsed && currentEnemyHp <= currentEnemyMaxHp * 0.3) {
        useMaster = true;
        skillIds[0] = masterSkillId;
      }
      
      return skillIds.map((sid, idx) => {
        const skillRef = TDB[sid];
        if (skillRef) {
          const baseAtk = enemyData.attack;
          const atkScale = baseAtk / 10;
          let skillDmg = skillRef.damage > 0 ? Math.floor(skillRef.damage * atkScale) : baseAtk;
          const enemySkillRarities = enemyData._skillRarities || preRolledDrop?.skillRarities || {};
          const skillRarity = enemySkillRarities[sid];
          if (skillRarity && skillDmg > 0) skillDmg = Math.floor(skillDmg * SKILL_RARITY_MULTIPLIER[skillRarity]);
          let estimatedDmg = Math.max(1, Math.floor(skillDmg * (0.85 + Math.random() * 0.3)) - Math.floor(def * 0.5));
          estimatedDmg = Math.max(Math.floor(skillDmg * 0.3), estimatedDmg);
          let totalDmg = estimatedDmg;
          if (skillRef.multi) totalDmg = estimatedDmg + Math.floor(estimatedDmg * 0.5) * (skillRef.multi - 1);
          
          let intentCategory = 'attack';
          if (skillRef.type === 'defense') intentCategory = 'defend';
          else if (skillRef.fury) intentCategory = 'buff';
          else if (skillRef.shield && skillRef.damage === 0) intentCategory = 'defend';
          else if (skillRef.type === 'ultimate') intentCategory = 'attack';
          else if (skillRef.debuff && skillRef.damage > 0) intentCategory = 'attack';
          
          let intentText: string;
          const isMaster = sid.startsWith('🌟');
          const nameDisplay = isMaster ? `★ ${skillRef.name}` : skillRef.name;
          if (intentCategory === 'buff') intentText = `<strong>${nameDisplay}</strong>`;
          else if (intentCategory === 'defend') intentText = `<strong>${nameDisplay}</strong>`;
          else if (skillRef.multi) intentText = `${nameDisplay} <strong>${totalDmg}</strong> (${skillRef.multi}x)`;
          else if (skillRef.steal) intentText = `${nameDisplay} <strong>${estimatedDmg}</strong>+robo`;
          else if (skillRef.freeze) intentText = `${nameDisplay} <strong>${estimatedDmg}</strong>+stun`;
          else intentText = `${nameDisplay} <strong>${totalDmg}</strong>`;
          
          return {
            type: intentCategory, value: totalDmg,
            icon: isMaster ? '🌟' : skillRef.emoji,
            text: intentText, skillId: sid,
            skillData: skillRef,
            isMasterSkill: (useMaster && idx === 0) || isMaster,
          };
        }
        // Fallback
        const baseAtk = enemyData.attack;
        let estimatedDmg = Math.max(1, Math.floor(baseAtk * (0.85 + Math.random() * 0.3)) - def);
        estimatedDmg = Math.max(Math.floor(baseAtk * 0.25), estimatedDmg);
        return { type: 'attack', value: estimatedDmg, icon: '⚔️', text: `Ataque <strong>${estimatedDmg}</strong>`, skillId: sid };
      });
    },
    [store]
  );

  // ═══════════════════════════════════════════════════════════════
  // executePlayerSkill — execute a single player skill action
  // ═══════════════════════════════════════════════════════════════
  const executePlayerSkill = useCallback((
    skillId: string,
    playSound: (type: string) => void,
    onComplete: () => void
  ) => {
    const state = store.getState();
    const tech = TDB[skillId];
    if (!tech) { onComplete(); return; }

    const isPhys = tech.type === 'basic' || tech.type === 'bleed' || tech.type === 'steal';
    const cost = tech.cost || 0;
    if (state.pieces < cost) { addToast('Piezas insuficientes!', 'error'); onComplete(); return; }

    // Deduct cost
    setGameState(prev => ({ ...prev, pieces: prev.pieces - cost }));

    if (tech.name === 'Detonacion Osea') setGameState(prev => ({ ...prev, maxPieces: Math.max(50, prev.maxPieces - 20) }));
    if (tech.name === 'Barrera Costillas') setGameState(prev => ({ ...prev, maxPieces: Math.max(50, prev.maxPieces - 15) }));

    const attack = computeAttack(state.equipment);
    const crit = computeCrit(state.resources.crit, state.equipment);
    const combatFx = state.combatFx || DEFAULT_COMBAT_FX;

    let dmg = tech.damage + (isPhys ? attack : Math.floor(attack * 0.3));
    // Apply temp buffs
    const tempBuffs = state.tempBuffs;
    dmg += tempBuffs.playerAtk;

    if (combatFx.playerDebuff && combatFx.playerDebuffTurns > 0) dmg = Math.floor(dmg * 0.7);
    if (combatFx.enemyShield) {
      const reduction = combatFx.enemyShieldValue || 0.4;
      dmg = Math.floor(dmg * (1 - reduction));
      addCombatLog({ text: `¡Escudo enemigo! Daño reducido a ${dmg}`, type: 'effect' });
    }
    if (tech.fury) dmg = Math.floor(dmg * 1.5);

    const isCrit = Math.random() * 100 < (crit + tempBuffs.playerCrit) || state.storyFlags.nextCrit;
    if (isCrit) {
      dmg = Math.floor(dmg * 1.5);
      triggerFloatingNumber(`-${dmg}`, 'crit');
      addCombatLog({ text: `${tech.name}: ${dmg} CRIT!`, type: 'player' });
      triggerFlash('crit'); triggerShake(); triggerCombatVfx('crit', 'enemy');
      playSound('crit');
    } else {
      triggerFloatingNumber(`-${dmg}`, 'damage');
      addCombatLog({ text: `${tech.name}: ${dmg}`, type: 'player' });
    }

    let newEnemyHp: number;
    if (tech.multi) {
      for (let i = 1; i < tech.multi; i++) addCombatLog({ text: `Hit extra: ${Math.floor(dmg / 2)}`, type: 'player' });
      newEnemyHp = Math.max(0, state.enemyHp - (dmg + Math.floor(dmg / 2) * (tech.multi - 1)));
    } else {
      newEnemyHp = Math.max(0, state.enemyHp - dmg);
    }
    setEnemyHp(newEnemyHp);

    playSound(isPhys ? 'attack' : 'magic');

    // Putrefacción
    const skillSlot = findSkillSlotLocal(skillId, state.equipment);
    if (skillSlot) {
      setGameState(prev => {
        const newEquip = { ...prev.equipment };
        const eq = (newEquip as any)[skillSlot] as EquipSlot | null;
        if (eq) {
          const newP = Math.max(0, eq.putrefaccion - 1);
          if (newP <= 0) {
            (newEquip as any)[skillSlot] = { ...eq, putrefaccion: 0 };
            addCombatLog({ text: `⚠️ ¡${eq.id} no tiene más usos!`, type: 'effect' });
          } else {
            (newEquip as any)[skillSlot] = { ...eq, putrefaccion: newP };
          }
        }
        return { ...prev, equipment: newEquip };
      });
    }

    // Lifesteal
    if (tech.lifesteal) {
      const healAmt = Math.floor(dmg * tech.lifesteal);
      const maxP = computeMaxPieces(state.maxPieces, state.equipment);
      setGameState(prev => ({ ...prev, pieces: Math.min(maxP, prev.pieces + healAmt) }));
      addCombatLog({ text: `Robo de vida: +${healAmt} piezas`, type: 'effect' });
      playSound('lifesteal');
    }

    // Barnaby 4 set
    if (Object.entries(computeActiveSets(state.equipment)).some(([n, c]) => n === 'Barnaby' && c >= 4)) {
      setGameState(prev => ({ ...prev, pieces: Math.min(prev.maxPieces, prev.pieces + 2) }));
    }

    if (tech.selfDamage) {
      setGameState(prev => ({ ...prev, pieces: Math.max(1, prev.pieces - tech.selfDamage!) }));
      addCombatLog({ text: `Singularidad: -${tech.selfDamage} piezas`, type: 'effect' as any });
    }

    // VFX
    if (tech.type === 'bleed') triggerCombatVfx('bleed', 'enemy');
    else if (tech.type === 'defense') triggerCombatVfx('shield', 'player');
    else if (tech.type === 'ultimate' || tech.type === 'sacrifice') triggerCombatVfx('explosion', 'enemy');
    else if (tech.type === 'magic') triggerCombatVfx('magic', 'enemy');
    else if (isPhys) triggerCombatVfx('slash', 'enemy');

    if (tech.heal) {
      const maxP = computeMaxPieces(state.maxPieces, state.equipment);
      setGameState(prev => ({ ...prev, pieces: Math.min(maxP, prev.pieces + tech.heal!) }));
      triggerFloatingNumber(`+${tech.heal}`, 'heal');
      triggerCombatVfx('heal', 'player');
    }
    if (tech.freeze) { updateCombatFx({ enemyFrozen: true }); triggerCombatVfx('freeze', 'enemy'); playSound('freeze'); }
    if (tech.bleed) { updateCombatFx({ enemyBleed: tech.bleed, enemyBleedTurns: 3 }); playSound('bleed'); }
    if (tech.debuff) { updateCombatFx({ enemyDebuff: true, enemyDebuffTurns: 2 }); triggerCombatVfx('debuff', 'enemy'); playSound('debuff'); }
    if (tech.shield) updateCombatFx({ playerShield: true });

    // Reset enemy shield after player attacks
    updateCombatFx({ enemyShield: false, enemyShieldValue: 0 });
    
    // Apply temp buff if skill grants one
    if (tech.shield) {
      const newBuffs: TempBuffs = { ...store.getState().tempBuffs, playerDef: (store.getState().tempBuffs.playerDef || 0) + (tech.shield * 10) };
      setTempBuffs(newBuffs);
    }

    if (state.storyFlags.nextCrit && isCrit) {
      setGameState(prev => ({ ...prev, storyFlags: { ...prev.storyFlags, nextCrit: false } }));
    }

    if (newEnemyHp <= 0) {
      triggerCombatVfx('death', 'enemy');
    }

    onComplete();
  }, [store, addToast, setGameState, addCombatLog, setEnemyHp, updateCombatFx, setTempBuffs, triggerCombatVfx, triggerFloatingNumber, triggerShake, triggerFlash]);

  // ═══════════════════════════════════════════════════════════════
  // executeEnemySkill — execute a single enemy skill action
  // ═══════════════════════════════════════════════════════════════
  const executeEnemySkill = useCallback((
    intent: EnemyIntent,
    playSound: (type: string) => void,
    onComplete: () => void
  ) => {
    const state = store.getState();
    if (state.enemyHp <= 0) { onComplete(); return; }

    const combatFx = state.combatFx || DEFAULT_COMBAT_FX;
    const enemy = state.enemy;
    const skillData = intent.skillData;
    const skillName = skillData?.name || null;
    const skillId = intent.skillId;
    const preRolledDrop = state.preRolledDrop;
    const enemySkillRarities = enemy?._skillRarities || preRolledDrop?.skillRarities || {};
    const skillRarity = skillId ? enemySkillRarities[skillId] : undefined;
    const sMult = skillRarity ? SKILL_RARITY_MULTIPLIER[skillRarity] : 1.0;
    const tempBuffs = state.tempBuffs;

    // If enemy is frozen, skip this action
    if (combatFx.enemyFrozen) {
      addCombatLog({ text: 'Congelado, pierde esta acción.', type: 'effect' });
      updateCombatFx({ enemyFrozen: false });
      onComplete();
      return;
    }

    if (intent.type === 'buff') {
      addCombatLog({ text: `${enemy.name} usa ${skillName || 'Fortalecer'}!`, type: 'enemy' });
      playSound('buff');
      if (skillData?.fury) {
        updateCombatFx({ enemyFury: true, enemyFuryTurns: 2 });
        addCombatLog({ text: `${enemy.name} se fortalece!`, type: 'effect' });
        triggerCombatVfx('fury', 'enemy');
      }
    } else if (intent.type === 'defend') {
      addCombatLog({ text: `${enemy.name} usa ${skillName || 'Proteger'}!`, type: 'enemy' });
      playSound('shield');
      if (skillData?.shield) {
        const scaledShield = Math.min(0.8, skillData.shield * sMult);
        updateCombatFx({ enemyShield: true, enemyShieldValue: scaledShield });
        addCombatLog({ text: `${enemy.name} se proteje! (-${Math.floor(scaledShield * 100)}% daño)`, type: 'effect' });
      }
      if (skillData?.heal && skillData.heal > 0) {
        const scaledHeal = Math.max(1, Math.floor(skillData.heal * sMult));
        const newHp = Math.min(state.enemyMaxHp, state.enemyHp + scaledHeal);
        setEnemyHp(newHp);
        addCombatLog({ text: `${enemy.name} recupera ${scaledHeal} HP!`, type: 'effect' });
      }
      if (skillData?.fury) {
        updateCombatFx({ enemyFury: true, enemyFuryTurns: 2 });
        addCombatLog({ text: `${enemy.name} se fortalece!`, type: 'effect' });
        triggerCombatVfx('fury', 'enemy');
      }
    } else {
      // Attack
      let dmg = intent.value + tempBuffs.enemyAtk;
      if (combatFx.enemyDebuff && combatFx.enemyDebuffTurns > 0) dmg = Math.floor(dmg * 0.7);
      if (skillData?.armorPen) {
        if (combatFx.playerShield) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
        if (combatFx.playerGuard) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
      } else {
        if (combatFx.playerShield) dmg = Math.floor(dmg * 0.5);
        if (combatFx.playerGuard) dmg = Math.floor(dmg * 0.5);
      }
      // Temp DEF buff
      dmg = Math.max(0, dmg - tempBuffs.playerDef);
      
      if (combatFx.enemyFury) dmg = Math.floor(dmg * 1.5);
      dmg = Math.max(1, dmg);

      setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - dmg) }));
      addCombatLog({ text: `${enemy.name} usa ${skillName || 'Ataque'} por ${dmg}!`, type: 'enemy' });
      triggerFloatingNumber(`-${dmg}`, 'damage');
      triggerCombatVfx('slash', 'player');
      triggerShake();
      triggerFlash('damage');
      playSound('hit');

      // Bleed
      if (skillData?.bleed && !combatFx.playerBleed) {
        const scaledBleed = Math.max(1, Math.floor(skillData.bleed * sMult));
        addCombatLog({ text: `¡Sangrado! -${scaledBleed} piezas/turno`, type: 'effect' });
        updateCombatFx({ playerBleed: true, playerBleedTurns: 3, playerBleedDmg: scaledBleed });
        triggerCombatVfx('bleed', 'player');
      }
      if (skillData?.debuff) {
        addCombatLog({ text: '¡Desconcertado! Tus golpes son más débiles.', type: 'effect' });
        updateCombatFx({ playerDebuff: true, playerDebuffTurns: 2 });
        playSound('debuff');
      }
      if (skillData?.steal) {
        const scaledSteal = Math.max(1, Math.floor(skillData.steal * sMult));
        const stolen = Math.min(scaledSteal, state.resources.shards);
        if (stolen > 0) {
          setGameState(prev => ({ ...prev, resources: { ...prev.resources, shards: Math.max(0, prev.resources.shards - stolen) } }));
          addCombatLog({ text: `¡Robo! -${stolen} fragmentos`, type: 'effect' });
        }
      }
      if (skillData?.multi && skillData.multi > 1) {
        const extraPerHit = Math.floor(dmg * 0.5);
        const totalExtra = extraPerHit * (skillData.multi - 1);
        if (totalExtra > 0) {
          setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - totalExtra) }));
          for (let i = 1; i < skillData.multi; i++) addCombatLog({ text: `Impacto ${i + 1}: -${extraPerHit}`, type: 'effect' });
        }
      }
      if (skillData?.freeze) {
        const currentStun = playerStunCountRef.current;
        let resisted = false;
        if (currentStun >= 2) resisted = true;
        else if (currentStun === 1) resisted = Math.random() < 0.5;
        if (resisted) {
          addCombatLog({ text: '¡Barnaby resiste la parálisis!', type: 'effect' });
        } else {
          addCombatLog({ text: '¡Paralizado! Próxima acción saltada.', type: 'effect' });
          updateCombatFx({ playerFrozen: true, playerStunCount: currentStun + 1 });
        }
        playerStunCountRef.current = currentStun + 1;
        triggerCombatVfx('freeze', 'player');
        playSound('freeze');
      }
    }

    // Mark master skill as used
    if (intent.isMasterSkill) {
      setMasterSkillUsed(true);
    }

    // Reset player shield after enemy attacks
    updateCombatFx({ playerShield: false, playerGuard: false });

    onComplete();
  }, [store, addCombatLog, setEnemyHp, setGameState, updateCombatFx, setMasterSkillUsed, triggerCombatVfx, triggerFloatingNumber, triggerShake, triggerFlash]);

  // ═══════════════════════════════════════════════════════════════
  // endTurn — end of a turn
  // ═══════════════════════════════════════════════════════════════
  const endTurn = useCallback((playSound: (type: string) => void) => {
    const state = store.getState();
    
    // Clear temp buffs
    setTempBuffs({ ...DEFAULT_TEMP_BUFFS });
    
    // Process end-of-turn effects (bleed, poison ticks)
    const combatFx = state.combatFx || DEFAULT_COMBAT_FX;
    
    // Enemy bleed/poison tick
    if (combatFx.enemyBleed > 0 && combatFx.enemyBleedTurns > 0) {
      const newHp = Math.max(0, state.enemyHp - combatFx.enemyBleed);
      setEnemyHp(newHp);
      addCombatLog({ text: `Sangrado: -${combatFx.enemyBleed}`, type: 'effect' });
      const newTurns = combatFx.enemyBleedTurns - 1;
      updateCombatFx({ enemyBleedTurns: newTurns, enemyBleed: newTurns > 0 ? combatFx.enemyBleed : 0 });
    }
    if (combatFx.enemyPoison > 0 && combatFx.enemyPoisonTurns > 0) {
      const newHp = Math.max(0, state.enemyHp - combatFx.enemyPoison);
      setEnemyHp(newHp);
      addCombatLog({ text: `Veneno: -${combatFx.enemyPoison}`, type: 'effect' });
      const newTurns = combatFx.enemyPoisonTurns - 1;
      updateCombatFx({ enemyPoisonTurns: newTurns, enemyPoison: newTurns > 0 ? combatFx.enemyPoison : 0 });
    }
    
    // Player bleed/poison tick
    if (combatFx.playerBleed && combatFx.playerBleedTurns > 0) {
      setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - (combatFx.playerBleedDmg || 0)) }));
      addCombatLog({ text: `Sangrado: -${combatFx.playerBleedDmg} piezas`, type: 'effect' });
      const newTurns = combatFx.playerBleedTurns - 1;
      updateCombatFx({ playerBleedTurns: newTurns, playerBleed: newTurns > 0 });
    }
    if (combatFx.playerPoison && combatFx.playerPoisonTurns > 0) {
      setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - (combatFx.playerPoisonDmg || 0)) }));
      addCombatLog({ text: `Veneno: -${combatFx.playerPoisonDmg} piezas`, type: 'effect' });
      const newTurns = combatFx.playerPoisonTurns - 1;
      updateCombatFx({ playerPoisonTurns: newTurns, playerPoison: newTurns > 0 });
    }
    
    // Decrement debuff/fury timers
    const fxUpdate: Partial<CombatFx> = {};
    fxUpdate.enemyDebuffTurns = Math.max(0, (combatFx.enemyDebuffTurns || 0) - 1);
    fxUpdate.enemyDebuff = (combatFx.enemyDebuffTurns || 0) > 1;
    fxUpdate.enemyFuryTurns = Math.max(0, (combatFx.enemyFuryTurns || 0) - 1);
    fxUpdate.enemyFury = (combatFx.enemyFuryTurns || 0) > 1;
    fxUpdate.playerDebuffTurns = Math.max(0, (combatFx.playerDebuffTurns || 0) - 1);
    fxUpdate.playerDebuff = (combatFx.playerDebuffTurns || 0) > 1;
    updateCombatFx(fxUpdate);
    
    // Increment turn number
    const newTurnNum = state.turnNumber + 1;
    setTurnNumber(newTurnNum);
    
    // Check for death
    const currentState = store.getState();
    if (currentState.enemyHp <= 0) {
      setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
      return;
    }
    if (currentState.pieces <= 0) {
      // Death handled by death check effect
      return;
    }
    
    // Start next turn planning
    setTimeout(() => startTurnPlanningRef.current(), 400);
  }, [store, setTempBuffs, setEnemyHp, addCombatLog, setGameState, updateCombatFx, setTurnNumber]);

  // ═══════════════════════════════════════════════════════════════
  // advanceSlot — helper to advance to next slot
  // ═══════════════════════════════════════════════════════════════
  const advanceSlot = useCallback((playSound: (type: string) => void) => {
    const state = store.getState();
    const nextSlot = state.currentActionSlot + 1;
    setCurrentActionSlot(nextSlot);
    
    if (nextSlot >= 4) {
      // All slots done → end turn
      setTimeout(() => endTurnRef.current(playSound), 400);
    } else {
      // Execute next slot after delay
      executionTimerRef.current = setTimeout(() => executeNextActionRef.current(playSound), 400);
    }
  }, [store, setCurrentActionSlot]);

  // ═══════════════════════════════════════════════════════════════
  // executeNextAction — executes the next action in the 4-slot sequence
  // ═══════════════════════════════════════════════════════════════
  const executeNextAction = useCallback((playSound: (type: string) => void) => {
    const state = store.getState();
    const slot = state.currentActionSlot;
    
    if (slot >= 4) {
      endTurnRef.current(playSound);
      return;
    }
    
    // Check if combat is over
    if (state.enemyHp <= 0 || state.pieces <= 0) {
      if (state.enemyHp <= 0) {
        setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
      }
      return;
    }
    
    const playerSpeed = computeSpeed(state.equipment);
    const enemySpeed = state.enemy?.speed || 10;
    const turnNum = state.turnNumber;
    
    // Resolve who goes first this slot
    let playerFirst: boolean;
    if (playerSpeed > enemySpeed) playerFirst = true;
    else if (playerSpeed < enemySpeed) playerFirst = false;
    else playerFirst = turnNum % 2 === 0;
    // Alternate per slot: if player goes first in even slots, enemy goes first in odd slots
    const playerGoesFirst = slot % 2 === 0 ? playerFirst : !playerFirst;
    
    const enemyIntent = state.enemyActions[slot];
    const playerSkillId = state.playerActionOrder[slot] || '';
    const playerHasSkill = playerSkillId !== '' && playerSkillId !== '__skip__';
    
    // Check putrefacción for the player's skill
    let playerCanAct = playerHasSkill;
    if (playerHasSkill) {
      // Also check if player is frozen
      if (state.combatFx?.playerFrozen) {
        playerCanAct = false;
        addCombatLog({ text: 'Barnaby está paralizado, no puede actuar.', type: 'effect' });
        updateCombatFx({ playerFrozen: false });
      } else {
        const skillSlot = findSkillSlotLocal(playerSkillId, state.equipment);
        if (skillSlot) {
          const eq = (state.equipment as any)[skillSlot] as EquipSlot | null;
          if (eq && eq.putrefaccion === 0) playerCanAct = false;
        }
      }
    }
    
    // Execute first actor
    const executeFirst = () => {
      if (playerGoesFirst && playerCanAct) {
        executePlayerSkillRef.current(playerSkillId, playSound, () => {
          const s2 = store.getState();
          if (s2.enemyHp <= 0 || s2.pieces <= 0) {
            if (s2.enemyHp <= 0) setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
            return;
          }
          setTimeout(() => executeSecond(), 500);
        });
      } else if (enemyIntent) {
        executeEnemySkillRef.current(enemyIntent, playSound, () => {
          const s2 = store.getState();
          if (s2.enemyHp <= 0 || s2.pieces <= 0) {
            if (s2.enemyHp <= 0) setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
            return;
          }
          setTimeout(() => executeSecond(), 500);
        });
      } else {
        executeSecond();
      }
    };
    
    const executeSecond = () => {
      if (!playerGoesFirst && playerCanAct) {
        executePlayerSkillRef.current(playerSkillId, playSound, () => {
          const s2 = store.getState();
          if (s2.enemyHp <= 0 || s2.pieces <= 0) {
            if (s2.enemyHp <= 0) setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
            return;
          }
          advanceSlot(playSound);
        });
      } else if (playerGoesFirst && enemyIntent) {
        executeEnemySkillRef.current(enemyIntent, playSound, () => {
          const s2 = store.getState();
          if (s2.enemyHp <= 0 || s2.pieces <= 0) {
            if (s2.enemyHp <= 0) setTimeout(() => endCombatRef.current(true, playSound, { checkLoreUnlocks: () => {} }), 600);
            return;
          }
          advanceSlot(playSound);
        });
      } else {
        advanceSlot(playSound);
      }
    };
    
    executeFirst();
  }, [store, advanceSlot, addCombatLog, updateCombatFx]);

  // ═══════════════════════════════════════════════════════════════
  // startTurnPlanning — called at start of each new turn
  // ═══════════════════════════════════════════════════════════════
  const startTurnPlanning = useCallback(() => {
    const state = store.getState();
    if (!state.enemy || state.enemyHp <= 0 || state.pieces <= 0) return;
    
    const enemyActions = calculateEnemyActionsForTurn(
      state.enemy, state.enemyHp, state.enemyMaxHp, state.masterSkillUsed
    );
    setEnemyActions(enemyActions);
    
    // Start with empty slots — player will select skills manually
    setPlayerActionOrder(['', '', '', '']);
    
    setTurnPhase('planning');
    setCurrentActionSlot(0);
    setTempBuffs({ ...DEFAULT_TEMP_BUFFS });
    store.getState().setCombatMenu('main');
  }, [store, calculateEnemyActionsForTurn, setEnemyActions, setPlayerActionOrder, setTurnPhase, setCurrentActionSlot, setTempBuffs]);

  // ═══════════════════════════════════════════════════════════════
  // setSkillOrder — player places a skill in a slot
  // ═══════════════════════════════════════════════════════════════
  const setSkillOrder = useCallback((skillId: string, slotIndex: number) => {
    const state = store.getState();
    if (state.turnPhase !== 'planning') return;
    const currentOrder = [...state.playerActionOrder];
    // Pad with empty strings if needed
    while (currentOrder.length < 4) currentOrder.push('');
    currentOrder[slotIndex] = skillId;
    setPlayerActionOrder(currentOrder);
  }, [store, setPlayerActionOrder]);

  // ═══════════════════════════════════════════════════════════════
  // swapSlots — swap two slots in the player action order
  // ═══════════════════════════════════════════════════════════════
  const swapSlots = useCallback((slotA: number, slotB: number) => {
    const state = store.getState();
    if (state.turnPhase !== 'planning') return;
    const currentOrder = [...state.playerActionOrder];
    while (currentOrder.length < 4) currentOrder.push('');
    if (slotA >= 0 && slotA < 4 && slotB >= 0 && slotB < 4 && slotA !== slotB) {
      const temp = currentOrder[slotA];
      currentOrder[slotA] = currentOrder[slotB];
      currentOrder[slotB] = temp;
      setPlayerActionOrder(currentOrder);
    }
  }, [store, setPlayerActionOrder]);

  // ═══════════════════════════════════════════════════════════════
  // confirmPlayerOrder — player confirms their 4-skill order
  // ═══════════════════════════════════════════════════════════════
  const confirmPlayerOrder = useCallback((playSound: (type: string) => void) => {
    const state = store.getState();
    if (state.turnPhase !== 'planning') return;
    
    // Fill any empty slots with empty string (will be treated as skip)
    const order = [...state.playerActionOrder];
    while (order.length < 4) order.push('');
    
    setPlayerActionOrder(order);
    setTurnPhase('executing');
    setCurrentActionSlot(0);
    
    // Start execution after a short delay
    setTimeout(() => executeNextActionRef.current(playSound), 500);
  }, [store, setPlayerActionOrder, setTurnPhase, setCurrentActionSlot]);

  // ═══════════════════════════════════════════════════════════════
  // startCombatWithEnemy
  // ═══════════════════════════════════════════════════════════════
  const startCombatWithEnemy = useCallback(
    (enemyName: string, playSound: (type: string) => void, isBoss = false, overrides: any = null) => {
      const state = store.getState();
      const eI = ENM[enemyName];
      let enemyData: any;
      if (eI) {
        enemyData = { ...eI, name: enemyName, isBoss: isBoss || !!eI.isBoss };
        if (overrides) enemyData = { ...enemyData, ...overrides, name: enemyName, isBoss: true };
      } else if (overrides) {
        enemyData = { ...overrides, name: enemyName, isBoss: true, possibleLoot: [], lootChance: 0, intentPattern: overrides.intentPattern || ['attack', 'attack', 'heavy'] };
      } else {
        return;
      }
      if (enemyData.isBoss) setTimeout(() => playSound('boss'), 200);

      const kills = state.bestiary?.[enemyName]?.kills || 0;
      const bestMult = 1 + Math.min(kills * 0.1, 1.0);
      enemyData.hp = Math.floor(enemyData.hp * bestMult);
      enemyData.attack = Math.floor(enemyData.attack * bestMult);

      // Pre-roll drop
      const zoneMaxRarityIdx = getZoneMaxRarityIndex(state.currentLocation);
      let preRoll: PreRolledDrop | null = null;
      {
        const partNames: string[] = (ENM[enemyName] as any)?.parts?.map((p: any) => p.name) || [];
        if (partNames.length > 0) {
          const dropPartName = partNames[Math.floor(Math.random() * partNames.length)];
          const partData = getItemData(dropPartName);
          if (partData) {
            const itemRarity = rollRarity(zoneMaxRarityIdx);
            const listedRarity = (partData.rarity || 'normal') as Rarity;
            const skillRarities: Record<string, Rarity> = {};
            if (partData.skillIds) partData.skillIds.forEach((skId: string) => { skillRarities[skId] = rollRarity(zoneMaxRarityIdx); });
            const scaledStats: Record<string, number> = {};
            if (partData.stats) Object.entries(partData.stats).forEach(([stat, val]) => { scaledStats[stat] = scaleStat(val as number, listedRarity, itemRarity); });
            if (scaledStats.attack) enemyData.attack += scaledStats.attack;
            if (scaledStats.defense) enemyData.hp += scaledStats.defense * 3;
            if (scaledStats.speed) enemyData.speed = (enemyData.speed || 10) + scaledStats.speed;
            if (scaledStats.crit) enemyData.crit = (enemyData.crit || 0) + scaledStats.crit;
            if (partData.skillIds && enemyData.intentPattern) enemyData._skillRarities = skillRarities;
            preRoll = { itemName: dropPartName, itemRarity, skillRarities, partStats: scaledStats };
          }
        }
      }

      const playerSpeed = computeSpeed(state.equipment);
      const enemySpeed = enemyData.speed || 10;

      const logs: LogEntry[] = [{ text: `Combate contra ${enemyData.emoji} ${enemyData.name}!`, type: 'effect' }];
      if (enemyData.name === 'Serpiente') logs.push({ text: '🐍 ¡Mira una serpiente! ¿Me la podré poner como brazo?', type: 'player' });
      logs.push({ text: playerSpeed >= enemySpeed ? '⚡ Tu velocidad es mayor, actúas primero!' : '🐾 El enemigo es más rápido, actúa primero!', type: 'effect' });

      // Initialize combat state
      store.getState().startCombat(enemyData, logs, playerSpeed >= enemySpeed, { type: 'attack', value: 0, icon: '⚔️', text: '' }, preRoll);
      
      // Set up 4-action system
      const enemyActions = calculateEnemyActionsForTurn(enemyData, enemyData.hp, enemyData.hp, false);
      setEnemyActions(enemyActions);
      
      // Auto-populate player action order with default skills
      const defaultOrder = getPlayerSlotSkills(state.equipment).map(s => s.skillId);
      setPlayerActionOrder(defaultOrder);
      
      setTurnPhase('planning');
      setCurrentActionSlot(0);
      setTurnNumber(0);
      setTempBuffs({ ...DEFAULT_TEMP_BUFFS });
      playerStunCountRef.current = 0;

      playSound('vs');
      setVsSlam(true);
      setTimeout(() => setVsSlam(false), 1000);
    },
    [store, calculateEnemyActionsForTurn, setVsSlam, setEnemyActions, setPlayerActionOrder, setTurnPhase, setCurrentActionSlot, setTurnNumber, setTempBuffs]
  );

  // ═══════════════════════════════════════════════════════════════
  // endCombat (victory/defeat)
  // ═══════════════════════════════════════════════════════════════
  const endCombat = useCallback(
    (victory: boolean, playSound: (type: string) => void, callbacks: {
      checkLoreUnlocks: (trigger: string, value: string) => void;
      nextDungeonRoom?: () => void;
    }) => {
      const state = store.getState();

      // Clear any pending execution timers
      if (executionTimerRef.current) {
        clearTimeout(executionTimerRef.current);
        executionTimerRef.current = null;
      }

      if (victory && state.enemy) {
        const enemy = state.enemy;
        const reward = enemy.reward || { shards: 15 };
        const preRolledDrop = state.preRolledDrop;

        const newInventory: InventoryItem[] = [...state.inventory];

        if (preRolledDrop) {
          newInventory.push({ id: preRolledDrop.itemName, rarity: preRolledDrop.itemRarity, skillRarities: preRolledDrop.skillRarities });
          const rarityLabel = RARITY_CONFIG[preRolledDrop.itemRarity].label;
          addToast(`¡${rarityLabel} ${preRolledDrop.itemName}!`, 'success');
        }

        const bonusLootChance = (enemy.lootChance || 0.25) * 0.5;
        if (enemy.possibleLoot?.length > 0 && Math.random() < bonusLootChance) {
          const lootObj = enemy.possibleLoot[Math.floor(Math.random() * enemy.possibleLoot.length)];
          const itemName = typeof lootObj === 'string' ? lootObj : lootObj.item;
          const lootRarity = (typeof lootObj === 'object' && lootObj.rarity) ? lootObj.rarity as Rarity : 'normal';
          newInventory.push({ id: itemName, rarity: lootRarity, skillRarities: {} });
          addToast(`¡Bonus: ${itemName}!`, 'success');
        }

        const enemyName = enemy?.name || '';
        const droppedPartName = preRolledDrop?.itemName || '';

        let newQuestProgress = { ...state.questProgress };
        QST.filter((q: any) => q.type === 'kill').forEach((q: any) => {
          const key = q.id;
          const current = newQuestProgress[key] || 0;
          let increment = false;
          if (q.target === enemyName) increment = true;
          if (!increment && enemyName && enemyName.includes(q.target)) increment = true;
          if (!increment && enemyName) {
            const locData = Object.values(LOC).find((l: any) => (l.enemies as string[])?.includes(enemyName));
            if (locData && (locData as any).name === q.target) increment = true;
          }
          if (increment) newQuestProgress[key] = current + 1;
        });

        const currentZone = state.currentLocation;
        QST.filter((q: any) => q.type === 'collect' && q.target === currentZone).forEach((q: any) => {
          newQuestProgress[q.id] = (newQuestProgress[q.id] || 0) + (droppedPartName ? 1 : 0);
        });

        setGameState(prev => {
          const finalInv = [...newInventory];
          if (enemy.reward?.items) {
            enemy.reward.items.forEach((item: string) => {
              finalInv.push({ id: item, rarity: 'normal', skillRarities: {} });
              addToast(`¡Has obtenido ${item}!`, 'success');
            });
          }
          const newBestiary = { ...(prev.bestiary || {}) };
          if (enemyName) {
            const entry = newBestiary[enemyName] || { kills: 0, dropsFound: [] };
            entry.kills += 1;
            if (droppedPartName && !entry.dropsFound.includes(droppedPartName)) entry.dropsFound.push(droppedPartName);
            newBestiary[enemyName] = entry;
          }
          return {
            ...prev,
            resources: { ...prev.resources, shards: prev.resources.shards + reward.shards },
            maxPieces: prev.maxPieces, pieces: prev.pieces,
            wins: prev.wins + 1, inventory: finalInv,
            bestiary: newBestiary, questProgress: newQuestProgress,
            defeatedBosses: enemy.isBoss ? Array.from(new Set([...prev.defeatedBosses, prev.currentLocation, enemy.name])) : prev.defeatedBosses,
          };
        });

        if (enemy.isBoss) callbacks.checkLoreUnlocks('boss', enemy.name);
        if (enemy?.name === 'Serpiente') {
          setTimeout(() => addCombatLog({ text: '🐍 ¡Una cola de serpiente como piernas! Esto es... elegante.', type: 'player' }), 100);
        }
        addToast(`Victoria! +${reward.shards}💎`, 'success');
        playSound('coin');

        if (state.storyFlags.inDungeon && callbacks.nextDungeonRoom) {
          setTimeout(() => callbacks.nextDungeonRoom!(), 1000);
        }
      }

      store.getState().endCombat();
    },
    [store, addToast, setGameState, addCombatLog]
  );

  // ── Update refs for circular references ──
  executePlayerSkillRef.current = executePlayerSkill;
  executeEnemySkillRef.current = executeEnemySkill;
  endTurnRef.current = endTurn;
  endCombatRef.current = endCombat;
  startTurnPlanningRef.current = startTurnPlanning;
  executeNextActionRef.current = executeNextAction;

  // ── Legacy compatibility ──
  const handlePlayerAction = useCallback((techName: string, _playSound: (type: string) => void) => {
    const state = store.getState();
    if (state.turnPhase === 'planning') {
      const order = [...state.playerActionOrder];
      const nextSlot = order.findIndex(s => !s || s === '');
      if (nextSlot >= 0 && nextSlot < 4) {
        setSkillOrder(techName, nextSlot);
      }
    }
  }, [store, setSkillOrder]);

  const enemyTurn = useCallback((_overrideIntent?: EnemyIntent, _playSound?: (type: string) => void) => {
    // In the new system, enemy turns are handled by executeNextAction
  }, []);

  const getEquippedSkills = useCallback(() => {
    return getEquippedSkillsList(store.getState().equipment);
  }, [store]);

  const findSkillSlot = useCallback((techName: string): string | null => {
    return findSkillSlotLocal(techName, store.getState().equipment);
  }, [store]);

  return {
    startCombatWithEnemy,
    endCombat,
    startTurnPlanning,
    setSkillOrder,
    swapSlots,
    confirmPlayerOrder,
    executeNextAction,
    handlePlayerAction,
    enemyTurn,
    getEquippedSkills,
    findSkillSlot,
    calculateEnemyActionsForTurn,
    getPlayerSlotSkills,
  };
}
