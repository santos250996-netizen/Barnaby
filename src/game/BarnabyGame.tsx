'use client';
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Sword, Shield, Zap, Settings, X } from 'lucide-react';
import { TDB, LOC, ENM, QST, QB, SETS, LORE_DATA, getItemData, rollRarity, scaleStat, scaleSkillValue, scaleSkillPercent, RARITY_CONFIG, Rarity, RARITIES, SKILL_RARITY_MULTIPLIER, getZoneMaxRarityIndex } from '@/game/constants';
import { useAudio } from '@/game/useAudio';
import { usePreloadContext, usePrefetchAdjacent, preloadEnemyImages } from '@/game/hooks';
import dynamic from 'next/dynamic';

// Types
import { EquipSlot, GameState, CombatFx, LogEntry, Toast, FloatingNumber, INITIAL_STATE, InventoryItem } from '@/game/types';

// UI Components
import { StatRow } from '@/game/components/ui/StatRow';
import { EquipmentSlot } from '@/game/components/ui/EquipmentSlot';
import { FooterNavItem } from '@/game/components/ui/FooterNavItem';
import { GeometricCombatButton } from '@/game/components/ui/GeometricCombatButton';

// Combat Components
import { TurnIndicator } from '@/game/components/combat/TurnIndicator';
import { EnemyCard } from '@/game/components/combat/EnemyCard';

// Combat Hook
import { useCombatActions, getPlayerSlotSkills } from '@/game/hooks/useCombatActions';
import { useGameStore } from '@/game/store/gameStore';

// Panel Components
import { InventoryContent } from '@/game/components/panels/InventoryContent';
import { MapContent } from '@/game/components/panels/MapContent';
import { QuestsContent } from '@/game/components/panels/QuestsContent';
import { BestiaryContent } from '@/game/components/panels/BestiaryContent';
import { LoreContent } from '@/game/components/panels/LoreContent';
import { ShopContent } from '@/game/components/panels/ShopContent';
import { ForgeContent } from '@/game/components/panels/ForgeContent';
import { SkillsContent } from '@/game/components/panels/SkillsContent';
import { OptionsContent } from '@/game/components/panels/OptionsContent';

// Intro
import { IntroOverlay } from '@/game/components/IntroOverlay';
import { rollTravelEvent } from '@/game/travelEvents';

const PhaserOverlay = dynamic(() => import('@/game/PhaserOverlay'), { ssr: false });

export default function App() {
  const { initAudio, playSound } = useAudio();

  // --- Image Preloading Hooks ---
  // (hooks must be called unconditionally, before any early returns)

  // --- Game State ---
  // Read initial state from Zustand store (which handles localStorage persistence)
  // This avoids conflicts between two systems writing to the same localStorage key
  const zustandState = useGameStore.getState();
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('barnaby_save');
      if (saved) {
        let parsed = JSON.parse(saved);
        // Zustand persist wraps data in { state: {...} } — unwrap if needed
        if (parsed && typeof parsed === 'object' && parsed.state && typeof parsed.state === 'object' && !('pieces' in parsed)) {
          parsed = parsed.state;
        }
        // Migrate old inventory format (string[]) to new (InventoryItem[])
        let inv: InventoryItem[] = [];
        if (Array.isArray(parsed.inventory)) {
          inv = parsed.inventory.map((item: any) =>
            typeof item === 'string'
              ? { id: item, rarity: (getItemData(item)?.rarity || 'normal') as Rarity, skillRarities: {} }
              : item
          );
        }
        // Migrate old equipment format (no rarity) to new (with rarity)
        const eq = { ...INITIAL_STATE.equipment, ...(parsed.equipment || {}) };
        (Object.keys(eq) as (keyof typeof eq)[]).forEach(slot => {
          const e = eq[slot] as any;
          if (e && !e.rarity) {
            e.rarity = (getItemData(e.id)?.rarity || 'normal') as Rarity;
            e.skillRarities = e.skillRarities || {};
          }
        });
        // Migrate: remove calcium, add unlocked zones if missing
        const resources = { ...INITIAL_STATE.resources, ...(parsed.resources || {}) };
        delete (resources as any).calcium; // Remove old calcium
        
        const unlockedLocations = parsed.unlockedLocations || INITIAL_STATE.unlockedLocations;
        // Ensure all zones are unlocked
        const ALL_ZONES = ["🏙️ Ciudad", "🌲 Bosque", "Catacumbas", "Paramo", "Cienaga", "Volcan", "Trono"];
        ALL_ZONES.forEach(z => {
          if (!unlockedLocations.includes(z)) unlockedLocations.push(z);
        });
        
        return {
          ...INITIAL_STATE,
          ...parsed,
          inventory: inv,
          resources,
          equipment: eq,
          storyFlags: { ...INITIAL_STATE.storyFlags, ...(parsed.storyFlags || {}) },
          unlockedLocations,
        };
      }
    } catch (e) {
      // If localStorage is corrupted or empty, use defaults
    }
    return INITIAL_STATE;
  });

  // --- UI State ---
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('barnaby_started');
    }
    return true;
  });
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [isCombat, setIsCombat] = useState(false);
  const [modal, setModal] = useState<{ title: string; msg: string; onConfirm: () => void } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [flash, setFlash] = useState<'damage' | 'crit' | null>(null);
  const [npcDialog, setNpcDialog] = useState<{name: string, text: string, options: any[], info?: string} | null>(null);
  const [showNpcInfo, setShowNpcInfo] = useState(false);
  const [travelEvent, setTravelEvent] = useState<any | null>(null);
  const [activeCombatVfx, setActiveCombatVfx] = useState<{type: string, id: string, target: 'player' | 'enemy'} | null>(null);
  const [vsSlam, setVsSlam] = useState(false);

  const triggerCombatVfx = (type: string, target: 'player' | 'enemy' = 'enemy') => {
    setActiveCombatVfx({ type, id: Math.random().toString(36).substr(2, 9), target });
    setTimeout(() => setActiveCombatVfx(null), 1000);
  };
  
  // --- Combat State ---
  const [enemy, setEnemy] = useState<any>(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [enemyIntent, setEnemyIntent] = useState<{ type: string; value: number; icon: string; text: string; skillId?: string; skillData?: any; isMasterSkill?: boolean }>({ type: 'attack', value: 0, icon: '⚔️', text: '' });
  const [combatLog, setCombatLog] = useState<LogEntry[]>([]);
  const [travelTransition, setTravelTransition] = useState<string | null>(null);
  const [combatFx, setCombatFx] = useState<CombatFx>({
    enemyBleed: 0, enemyBleedTurns: 0, enemyPoison: 0, enemyPoisonTurns: 0, enemyFrozen: false, enemyDebuff: false, enemyDebuffTurns: 0, enemyFury: false, enemyFuryTurns: 0, enemyShield: false, enemyShieldValue: 0, playerShield: false, playerGuard: false, playerPoison: false, playerPoisonTurns: 0, playerPoisonDmg: 0, playerBleed: false, playerBleedTurns: 0, playerBleedDmg: 0, playerDebuff: false, playerDebuffTurns: 0, playerFrozen: false, playerStunCount: 0
  });
  const [enemyTurnCount, setEnemyTurnCount] = useState(0);
  const [combatMenu, setCombatMenu] = useState<'main' | 'skills' | 'items'>('main');
  const [firstAttackDone, setFirstAttackDone] = useState(false);
  const [masterSkillUsed, setMasterSkillUsed] = useState(false);

  // ── 4-Action Combat Hook ──
  const combatActions = useCombatActions();

  // ── Zustand selectors for 4-action combat state ──
  const storeEnemyActions = useGameStore(s => s.enemyActions);
  const storePlayerActionOrder = useGameStore(s => s.playerActionOrder);
  const storeTurnPhase = useGameStore(s => s.turnPhase);
  const storeCurrentActionSlot = useGameStore(s => s.currentActionSlot);
  const storeTurnNumber = useGameStore(s => s.turnNumber);
  const storeIsCombat = useGameStore(s => s.isCombat);
  const storeEnemyHp = useGameStore(s => s.enemyHp);
  const storeEnemyMaxHp = useGameStore(s => s.enemyMaxHp);

  // Refs for async callbacks (setTimeout) to avoid stale closures
  const enemyTurnCountRef = useRef(0);
  const playerStunCountRef = useRef(0);

  // Pre-rolled drop: determined at combat start, enemy benefits from its stats
  const [preRolledDrop, setPreRolledDrop] = useState<{ itemName: string; itemRarity: Rarity; skillRarities: Record<string, Rarity>; partStats: Record<string, number> } | null>(null);

  const storyWindowRef = useRef<HTMLDivElement>(null);

  // --- Image preloading: preload current context + prefetch adjacent zones ---
  usePreloadContext(gameState.currentLocation, isCombat, gameState.equipment);
  usePrefetchAdjacent(gameState.currentLocation);

  // --- Toast system (needed by other callbacks) ---
  const showToast = useCallback((msg: string, type?: 'success' | 'error' | 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  // --- Travel with transition + event system ---
  // --- Lore unlock system ---
  const checkLoreUnlocks = useCallback((trigger: string, value: string) => {
    setGameState(prev => {
      const currentUnlocked = prev.unlockedLore || [];
      const newUnlocks: string[] = [];
      LORE_DATA.forEach((entry: any) => {
        if (currentUnlocked.includes(entry.id)) return;
        const cond = entry.unlockCondition;
        if (cond === 'start') { newUnlocks.push(entry.id); return; }
        if (cond === `location:${value}`) { newUnlocks.push(entry.id); return; }
        if (cond === `npc:${value}`) { newUnlocks.push(entry.id); return; }
        if (cond === `boss:${value}`) { newUnlocks.push(entry.id); return; }
      });
      if (newUnlocks.length > 0) {
        // Show toast for first unlock
        const firstEntry = LORE_DATA.find((e: any) => e.id === newUnlocks[0]);
        if (firstEntry) {
          showToast(`📜 Lore desbloqueado: ${firstEntry.title}`, "info");
        }
        return { ...prev, unlockedLore: [...currentUnlocked, ...newUnlocks] };
      }
      return prev;
    });
  }, [LORE_DATA, showToast]);

  const travelTo = useCallback((loc: string) => {
    const locName = LOC[loc]?.name || loc;
    setTravelTransition(locName);
    setActivePanel(null);
    playSound('walk');
    setTimeout(() => {
      setGameState(prev => ({ ...prev, currentLocation: loc }));
      setTravelTransition(null);

      // Unlock lore by location
      checkLoreUnlocks('location', loc);

      // Roll for travel event (30% chance)
      const event = rollTravelEvent(loc);
      if (event) {
        setTravelEvent(event);
        playSound('click');
      }
    }, 800);
  }, [playSound, setGameState, checkLoreUnlocks]);

  // --- Helpers ---
  const getActiveSets = useCallback(() => {
    const counts: Record<string, number> = {};
    const RARE_PLUS = ['raro', 'epico', 'legendario'];
    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      const item = eq ? getItemData(eq.id) : null;
      // Set bonuses only activate if the part is rare or higher rarity
      if (item && item.set && eq && RARE_PLUS.includes(eq.rarity)) {
        counts[item.set] = (counts[item.set] || 0) + 1;
      }
    });
    return counts;
  }, [gameState.equipment]);

  const getMaxPieces = useCallback(() => {
    let bonus = 0;
    const sets = getActiveSets();

    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      if (eq && getItemData(eq.id)?.stats?.maxPieces) bonus += getItemData(eq.id).stats.maxPieces;
    });
    return gameState.maxPieces + bonus;
  }, [gameState.maxPieces, getActiveSets, gameState.equipment]);

  const getAttack = useCallback(() => {
    let bonus = 0;
    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.attack || 0;
    });
    
    // Set Bonuses
    const sets = getActiveSets();
    Object.entries(sets).forEach(([setName, count]) => {
      const setData = (SETS as any)[setName];
      if (setData) {
        if ((count as number) >= 2) bonus += setData.bonus2.stats?.attack || 0;
        if ((count as number) >= 4) bonus += setData.bonus4.stats?.attack || 0;
      }
    });

    return 8 + bonus;
  }, [gameState.equipment, getActiveSets]);

  const getDefense = useCallback(() => {
    let bonus = 0;
    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.defense || 0;
    });

    // Set Bonuses
    const sets = getActiveSets();
    Object.entries(sets).forEach(([setName, count]) => {
      const setData = (SETS as any)[setName];
      if (setData) {
        if ((count as number) >= 2) bonus += setData.bonus2.stats?.defense || 0;
        if ((count as number) >= 4) bonus += setData.bonus4.stats?.defense || 0;
      }
    });

    return 2 + bonus;
  }, [gameState.equipment, getActiveSets]);

  const getCrit = useCallback(() => {
    let bonus = 0;
    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.crit || 0;
    });

    // Set Bonuses
    const sets = getActiveSets();
    Object.entries(sets).forEach(([setName, count]) => {
      const setData = (SETS as any)[setName];
      if (setData) {
        if ((count as number) >= 2) bonus += setData.bonus2.stats?.crit || 0;
        if ((count as number) >= 4) bonus += setData.bonus4.stats?.crit || 0;
      }
    });

    return gameState.resources.crit + bonus;
  }, [gameState.resources.crit, gameState.equipment, getActiveSets]);

  const getSpeed = useCallback(() => {
    let bonus = 0;
    (Object.values(gameState.equipment) as (EquipSlot | null)[]).forEach(eq => {
      if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.speed || 0;
    });

    const sets = getActiveSets();
    Object.entries(sets).forEach(([setName, count]) => {
      const setData = (SETS as any)[setName];
      if (setData) {
        if ((count as number) >= 2) bonus += setData.bonus2.stats?.speed || 0;
        if ((count as number) >= 4) bonus += setData.bonus4.stats?.speed || 0;
      }
    });

    return 8 + bonus;
  }, [gameState.equipment, getActiveSets]);



  const triggerFloatingNumber = useCallback((val: string, type: 'damage' | 'heal' | 'crit' | 'shield') => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    const y = 20 + Math.random() * 30;
    setFloatingNumbers(prev => [...prev, { id, val, type, x, y }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== id));
    }, 1000);
  }, []);

  const addLog = useCallback((text: string, type?: LogEntry['type']) => {
    setCombatLog(prev => [...prev, { text, type }]);
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
  }, []);

  const triggerFlash = useCallback((type: 'damage' | 'crit') => {
    setFlash(type);
    setTimeout(() => setFlash(null), 150);
  }, []);

  const getEquippedSkills = useCallback(() => {
    const { head, torso, arms, legs } = gameState.equipment;
    const skills: string[] = [];

    if (head && head.id && getItemData(head.id)?.skillIds) skills.push(...getItemData(head.id).skillIds);
    else if (!head) skills.push("💀 Cabezazo Barnaby");

    if (torso && torso.id && getItemData(torso.id)?.skillIds) skills.push(...getItemData(torso.id).skillIds);
    else if (!torso) skills.push("🛡️ Costillas Enrejadas");

    if (arms && arms.id && getItemData(arms.id)?.skillIds) skills.push(...getItemData(arms.id).skillIds);
    else if (!arms) skills.push("🦾 Puño Óseo");

    if (legs && legs.id && getItemData(legs.id)?.skillIds) skills.push(...getItemData(legs.id).skillIds);
    else if (!legs) skills.push("👻 Voluntad Post-Mortem");

    return Array.from(new Set(skills)).filter(Boolean);
  }, [gameState.equipment]);

  // Track who goes first for first attack bonus
  const playerFirstRef = useRef(false);
  // Signal that enemy should act first at combat start (avoids stale closure)
  const enemyFirstRef = useRef(false);

  // --- Find which equipment slot provides a given skill ---
  const findSkillSlot = useCallback((techName: string): string | null => {
    const { head, torso, arms, legs } = gameState.equipment;
    
    if (head && head.id) {
      const data = getItemData(head.id);
      if (data?.skillIds?.includes(techName)) return 'head';
    }
    if (torso && torso.id) {
      const data = getItemData(torso.id);
      if (data?.skillIds?.includes(techName)) return 'torso';
    }
    if (arms && arms.id) {
      const data = getItemData(arms.id);
      if (data?.skillIds?.includes(techName)) return 'arms';
    }
    if (legs && legs.id) {
      const data = getItemData(legs.id);
      if (data?.skillIds?.includes(techName)) return 'legs';
    }
    
    // Innate skills (no item equipped)
    if (techName === "💀 Cabezazo Barnaby") return 'head';
    if (techName === "🛡️ Costillas Enrejadas") return 'torso';
    if (techName === "🦾 Puño Óseo") return 'arms';
    if (techName === "👻 Voluntad Post-Mortem") return 'legs';
    
    return null;
  }, [gameState.equipment]);

  // --- Equip consumable to a slot ---
  const equipConsumable = useCallback((slotIndex: 0 | 1, itemId: string) => {
    setGameState(prev => {
      const slots = [...(prev.consumableSlots || [null, null])] as [string | null, string | null];
      slots[slotIndex] = itemId;
      return { ...prev, consumableSlots: slots };
    });
  }, [setGameState]);

  // --- NPC Info texts ---
  const NPC_INFO: Record<string, string> = {
    "Herrero": "⚒️ Herrería\n\nAquí puedes fusionar 3 piezas idénticas para mejorar su rareza, y reparar piezas cuyo putrefacción se ha agotado. La fusión y la reparación cuestan fragmentos 💎.",
    "Tabernero": "🍻 Taberna\n\nDescansa para recuperar toda tu vida. Cuesta 20💎 por descanso. También reabastece la tienda.",
    "Morgana": "🔮 Morgana\n\nMorgana ofrece misiones y conoce los secretos de la nigromancia. Completa sus misiones para desbloquear nuevas zonas y obtener recompensas.",
    "Mercader": "💰 Comerciante\n\nCompra pociones y materiales. El inventario se reabastece al descansar en la taberna.",
    "Viajero": "🗺️ Viajero\n\nEl viajero conoce todos los caminos. Úsalo para moverte entre zonas del mapa. Cada zona tiene enemigos y jefes diferentes.",
  };

  // --- persistence ---
  // Sync local gameState to Zustand store (which handles localStorage persistence)
  // We no longer write directly to localStorage to avoid format conflicts with Zustand persist
  useEffect(() => {
    if (!showIntro) {
      try {
        // Update Zustand store with game state changes
        const storeState = useGameStore.getState();
        storeState.setGameState(() => gameState);
      } catch (e) {
        // Silently fail — Zustand persist will handle the next update
      }
    }
  }, [gameState, showIntro]);

  // --- Death Check ---
  useEffect(() => {
    if (gameState.pieces <= 0 && !showIntro && !modal) {
      playSound('death');
      setModal({
        title: "💀 Barnaby se ha desmoronado",
        msg: "Tus huesos no han podido aguantar más el castigo. Has perdido todas tus piezas...",
        onConfirm: () => {
          localStorage.removeItem('barnaby_save');
          location.reload();
        }
      });
      playSound('hit');
    }
  }, [gameState.pieces, showIntro, modal, playSound]);

  useEffect(() => {
    if (storyWindowRef.current) {
      storyWindowRef.current.scrollTop = storyWindowRef.current.scrollHeight;
    }
  }, [isCombat, gameState.currentLocation]);

  // Enemy acts first at combat start when they have higher speed
  // DISABLED: Old 1-action-per-turn flow. Now using 4-action turn system via useCombatActions.
  // useEffect(() => {
  //   if (enemyFirstRef.current && isCombat && !isPlayerTurn && enemy && enemyHp > 0) {
  //     enemyFirstRef.current = false;
  //     setTimeout(() => enemyTurn(), 1000);
  //   }
  // }, [isCombat, isPlayerTurn, enemy, enemyHp]);

  // --- Game Actions ---
  const startGame = () => {
    initAudio();
    setShowIntro(false);
    localStorage.setItem('barnaby_started', 'true');
    playSound('click');
  };

  const getPotionHeal = () => 30;

  const usePotion = () => {
    const maxP = getMaxPieces();
    if (gameState.resources.potions <= 0 || gameState.pieces >= maxP) {
      if (gameState.pieces >= maxP) showToast("Piezas al máximo", "info");
      return;
    }
    const heal = getPotionHeal();
    setGameState(prev => {
      const potionQuest = prev.activeQuests.find((q: any) => q.type === 'potion');
      return {
        ...prev,
        resources: { ...prev.resources, potions: prev.resources.potions - 1 },
        pieces: Math.min(maxP, prev.pieces + heal),
        questProgress: potionQuest ? { ...(prev.questProgress || {}), [potionQuest.id]: (prev.questProgress?.[potionQuest.id] || 0) + 1 } : prev.questProgress
      };
    });
    showToast(`Poción: +${heal} piezas`, "success");
    playSound('potion');
  };

  // Repair uses shards
  // Repair uses shards, handled in ForgeContent

  // Use a consumable from a specific slot (works in and out of combat)
  const useConsumableFromSlot = (slotIndex: 0 | 1) => {
    const slotItem = gameState.consumableSlots?.[slotIndex];
    if (!slotItem) return;
    if (slotItem === 'potion') {
      usePotion();
    }
    // Future: add more consumable types here
  };

  const restAction = () => {
    if (gameState.resources.shards < 20) {
      showToast("Necesitas 20💎", "error");
      return;
    }
    const maxP = getMaxPieces();
    setGameState(prev => ({
      ...prev,
      resources: { ...prev.resources, shards: prev.resources.shards - 20 },
      pieces: maxP,
    }));
    showToast("Descanso: Vida completa", "success");
    playSound('rest');
  };

  // --- Travel Event Handler ---
  const applyTravelEventEffect = (effect: any) => {
    if (!effect) { setTravelEvent(null); return; }
    setGameState(prev => {
      const maxP = getMaxPieces();
      const newPieces = effect.pieces
        ? Math.max(1, Math.min(maxP, prev.pieces + effect.pieces))
        : prev.pieces;
      const newShards = effect.shards
        ? Math.max(0, prev.resources.shards + effect.shards)
        : prev.resources.shards;
      const newPotions = effect.potions
        ? Math.max(0, prev.resources.potions + effect.potions)
        : prev.resources.potions;
      return {
        ...prev,
        pieces: newPieces,
        resources: { ...prev.resources, shards: newShards, potions: newPotions },
      };
    });
    // Show feedback toasts
    if (effect.shards && effect.shards > 0) showToast(`+${effect.shards}💎`, "success");
    if (effect.shards && effect.shards < 0) showToast(`${effect.shards}💎`, "error");
    if (effect.pieces && effect.pieces > 0) showToast(`+${effect.pieces} piezas`, "success");
    if (effect.pieces && effect.pieces < 0) showToast(`${effect.pieces} piezas`, "error");
    if (effect.potions && effect.potions > 0) showToast(`+${effect.potions} pociones`, "success");
    playSound('coin');
    setTravelEvent(null);
  };

  // --- Combat Logic ---
  const calculateEnemyIntent = (enemyData: any, turn: number, currentEnemyHp?: number, currentEnemyMaxHp?: number, isMasterUsed?: boolean) => {
    const pattern = enemyData.intentPattern || ["attack"];
    const masterSkillId = enemyData.masterSkill;
    const masterSkillRef = masterSkillId ? TDB[masterSkillId] : null;

    // Master skill triggers when enemy HP ≤ 30% and hasn't been used yet
    let useMasterSkill = false;
    if (masterSkillRef && !isMasterUsed && currentEnemyHp !== undefined && currentEnemyMaxHp !== undefined) {
      useMasterSkill = currentEnemyHp <= currentEnemyMaxHp * 0.3;
    }

    let intentType: string;
    if (useMasterSkill && masterSkillId) {
      intentType = masterSkillId;
    } else if (Math.random() < 0.2) {
      intentType = pattern[Math.floor(Math.random() * pattern.length)];
    } else {
      intentType = pattern[turn % pattern.length];
    }

    // Check if intentType is a skill reference (exists in TDB)
    const skillRef = TDB[intentType as string];
    if (skillRef) {
      const baseAtk = enemyData.attack;
      const def = getDefense();
      // Enemy damage = skill base * enemy attack scaling factor
      // Uses FULL attack stat (with level + bestiary scaling) so difficulty scales properly
      const atkScale = baseAtk / 10;
      let skillDmg = skillRef.damage > 0 ? Math.floor(skillRef.damage * atkScale) : baseAtk;

      // Apply SKILL RARITY scaling if this skill is on the pre-rolled drop piece
      // Skills scale ATTRIBUTES (damage, heal, shield%) not EFFECTS (bleed, freeze, fury)
      const enemySkillRarities = enemyData._skillRarities || preRolledDrop?.skillRarities || {};
      const skillRarity = enemySkillRarities[intentType as string];
      if (skillRarity && skillDmg > 0) {
        const skillMult = SKILL_RARITY_MULTIPLIER[skillRarity];
        skillDmg = Math.floor(skillDmg * skillMult);
      }

      let estimatedDmg = Math.max(1, Math.floor(skillDmg * (0.85 + Math.random() * 0.3)) - Math.floor(def * 0.5));
      estimatedDmg = Math.max(Math.floor(skillDmg * 0.3), estimatedDmg);

      // Multi-hit skills: total damage = first hit + reduced subsequent hits
      let totalDmg = estimatedDmg;
      if (skillRef.multi) {
        totalDmg = estimatedDmg + Math.floor(estimatedDmg * 0.5) * (skillRef.multi - 1);
      }

      // Determine intent type from skill properties
      let intentCategory = "attack";
      if (skillRef.type === "defense") intentCategory = "defend";
      else if (skillRef.fury) intentCategory = "buff";
      else if (skillRef.shield && skillRef.damage === 0) intentCategory = "defend";
      else if (skillRef.type === "ultimate") intentCategory = "attack";
      // Debuff skills (e.g. Golpe Bajo) show as attack with special text
      else if (skillRef.debuff && skillRef.damage > 0) intentCategory = "attack";

      // Build intent text
      let intentText: string;
      const isMasterSkill = intentType.startsWith("🌟");
      const nameDisplay = isMasterSkill ? `★ ${skillRef.name}` : skillRef.name;

      if (intentCategory === "buff") {
        intentText = `<strong>${nameDisplay}</strong>`;
      } else if (intentCategory === "defend") {
        intentText = `<strong>${nameDisplay}</strong>`;
      } else if (skillRef.multi) {
        intentText = `${nameDisplay} <strong>${totalDmg}</strong> (${skillRef.multi}x)`;
      } else if (skillRef.steal) {
        intentText = `${nameDisplay} <strong>${estimatedDmg}</strong>+robo`;
      } else if (skillRef.freeze) {
        intentText = `${nameDisplay} <strong>${estimatedDmg}</strong>+stun`;
      } else {
        intentText = `${nameDisplay} <strong>${totalDmg}</strong>`;
      }

      return {
        type: intentCategory,
        value: totalDmg,
        icon: isMasterSkill ? "🌟" : skillRef.emoji,
        text: intentText,
        skillId: intentType as string,
        skillData: skillRef,
        isMasterSkill: !!isMasterSkill
      };
    }

    // Fallback: legacy pattern types (attack, heavy, buff, defend)
    const baseAtk = enemyData.attack;
    const def = getDefense();
    let estimatedDmg = Math.max(1, Math.floor(baseAtk * (0.85 + Math.random() * 0.3)) - def);
    estimatedDmg = Math.max(Math.floor(baseAtk * 0.25), estimatedDmg);

    switch (intentType) {
      case "attack": return { type: "attack", value: estimatedDmg, icon: "⚔️", text: `Ataque <strong>${estimatedDmg}</strong>` };
      case "heavy": 
        const hd = Math.floor(estimatedDmg * 1.5);
        return { type: "attack", value: hd, icon: "💥", text: `Fuerte <strong>${hd}</strong>` };
      case "buff": return { type: "buff", value: 0, icon: "💪", text: `<strong>Se fortalece</strong>` };
      case "defend": return { type: "defend", value: 0, icon: "🛡️", text: `<strong>Se prepara</strong>` };
      default: return { type: "attack", value: estimatedDmg, icon: "⚔️", text: `Ataque <strong>${estimatedDmg}</strong>` };
    }
  };

  const startCombat = (enemyName: string, isBoss = false, overrides: any = null) => {
    // Preload enemy images immediately for instant combat transition
    preloadEnemyImages(enemyName);

    const eI = ENM[enemyName];
    let enemyData: any;
    if (eI) {
      enemyData = { ...eI, name: enemyName, isBoss: isBoss || !!eI.isBoss };
      // Apply overrides (e.g. dungeon boss scaling)
      if (overrides) {
        enemyData = { ...enemyData, ...overrides, name: enemyName, isBoss: true };
      }
    } else if (overrides) {
      // Fallback: enemy not in ENM but overrides provided (e.g. quest bosses from QB, fallback bosses)
      enemyData = { ...overrides, name: enemyName, isBoss: true, possibleLoot: [], lootChance: 0, intentPattern: overrides.intentPattern || ["attack", "attack", "heavy"] };
    } else {
      return; // Unknown enemy with no data
    }
    if (enemyData.isBoss) {
      setTimeout(() => playSound('boss'), 200);
    }

    // Bestiary scaling: +10% per kill, cumulative, capped at +100% (10 kills)
    const kills = gameState.bestiary?.[enemyName]?.kills || 0;
    const bestMult = 1 + Math.min(kills * 0.1, 1.0);
    enemyData.hp = Math.floor(enemyData.hp * bestMult);
    enemyData.attack = Math.floor(enemyData.attack * bestMult);

    // ═══ PRE-ROLL DROP ═══
    // Determine which part drops, its rarity, and each skill's rarity BEFORE combat
    // Zone unlocks max possible rarity tier (all zones = legendario now)
    // Bosses use the same system — their parts are in ENM too
    const zoneName = gameState.currentLocation;
    const zoneMaxRarityIdx = getZoneMaxRarityIndex(zoneName);
    let preRoll: { itemName: string; itemRarity: Rarity; skillRarities: Record<string, Rarity>; partStats: Record<string, number> } | null = null;
    {
      const partNames: string[] = (ENM[enemyName] as any)?.parts?.map((p: any) => p.name) || [];
      if (partNames.length > 0) {
        // Roll which part drops
        const dropPartName = partNames[Math.floor(Math.random() * partNames.length)];
        const partData = getItemData(dropPartName);
        if (partData) {
          // Roll item rarity (zone max cap + enemy level weights)
          const itemRarity = rollRarity(zoneMaxRarityIdx);
          const listedRarity = (partData.rarity || 'normal') as Rarity;

          // Roll skill rarities INDEPENDENTLY from item rarity
          // Each skill on the piece gets its own rarity roll
          const skillRarities: Record<string, Rarity> = {};
          if (partData.skillIds) {
            partData.skillIds.forEach((skId: string) => {
              skillRarities[skId] = rollRarity(zoneMaxRarityIdx);
            });
          }

          // Scale part stats by drop rarity vs listed rarity
          const scaledStats: Record<string, number> = {};
          if (partData.stats) {
            Object.entries(partData.stats).forEach(([stat, val]) => {
              scaledStats[stat] = scaleStat(val as number, listedRarity, itemRarity);
            });
          }

          // Apply scaled item stats to enemy (attack→ATK, defense→HP, speed→speed, crit→crit%)
          if (scaledStats.attack)  enemyData.attack += scaledStats.attack;
          if (scaledStats.defense) enemyData.hp += scaledStats.defense * 3; // defense → +3 HP per point
          if (scaledStats.speed)   enemyData.speed = (enemyData.speed || 10) + scaledStats.speed;
          if (scaledStats.crit)    enemyData.crit = (enemyData.crit || 0) + scaledStats.crit;

          // Apply SKILL RARITY scaling to enemy's skills
          // When the enemy uses a skill that's on the pre-rolled piece,
          // its damage/heal/shield attributes are scaled by the skill's rarity multiplier
          // Effects (bleed, freeze, fury) remain unchanged
          if (partData.skillIds && enemyData.intentPattern) {
            const scaledPattern = [...enemyData.intentPattern];
            // Store skill rarities on enemy so calculateEnemyIntent can apply them
            enemyData._skillRarities = skillRarities;
          }

          preRoll = { itemName: dropPartName, itemRarity, skillRarities, partStats: scaledStats };
        }
      }
    }
    setPreRolledDrop(preRoll);

    const playerSpeed = getSpeed();
    const enemySpeed = enemyData.speed || 10;
    const playerFirst = playerSpeed >= enemySpeed;

    const logs: LogEntry[] = [{ text: `Combate contra ${enemyData.emoji} ${enemyData.name}!`, type: 'effect' }];
    if (enemyData.name === "Serpiente") {
      logs.push({ text: "🐍 ¡Mira una serpiente! ¿Me la podré poner como brazo?", type: 'player' });
    }
    logs.push({ text: playerFirst ? "⚡ Tu velocidad es mayor, atacas primero!" : "🐾 El enemigo es más rápido, ataca primero!", type: 'effect' });
    const speedDiff = Math.abs(playerSpeed - enemySpeed);
    if (speedDiff > 0) {
      logs.push({ text: `⚡ Primer ataque: +${speedDiff} daño bonus!`, type: 'effect' });
    }

    setEnemy(enemyData);
    setEnemyHp(enemyData.hp);
    setEnemyMaxHp(enemyData.hp);
    setIsCombat(true);
    setIsPlayerTurn(playerFirst);
    setCombatLog(logs);
    setCombatFx({ enemyBleed: 0, enemyBleedTurns: 0, enemyPoison: 0, enemyPoisonTurns: 0, enemyFrozen: false, enemyDebuff: false, enemyDebuffTurns: 0, enemyFury: false, enemyFuryTurns: 0, enemyShield: false, enemyShieldValue: 0, playerShield: false, playerGuard: false, playerPoison: false, playerPoisonTurns: 0, playerPoisonDmg: 0, playerBleed: false, playerBleedTurns: 0, playerBleedDmg: 0, playerDebuff: false, playerDebuffTurns: 0, playerFrozen: false, playerStunCount: 0 });
    setEnemyTurnCount(0);
    enemyTurnCountRef.current = 0;
    playerStunCountRef.current = 0;
    setFirstAttackDone(false);
    setMasterSkillUsed(false);
    playerFirstRef.current = playerFirst;
    setEnemyIntent(calculateEnemyIntent(enemyData, 0, enemyData.hp, enemyData.hp, false));
    playSound('vs');
    setVsSlam(true);
    setTimeout(() => setVsSlam(false), 1000);

    // ── Set up 4-action system in zustand store ──
    // Initialize store combat state
    const storeState = useGameStore.getState();
    storeState.startCombat(enemyData, logs, playerFirst, { type: 'attack', value: 0, icon: '⚔️', text: '' }, preRoll);
    
    // Calculate enemy's 4 actions for the planning phase
    const enemyActions = combatActions.calculateEnemyActionsForTurn(enemyData, enemyData.hp, enemyData.hp, false);
    storeState.setEnemyActions(enemyActions);
    
    // Start with empty slots — player will select skills manually
    storeState.setPlayerActionOrder(['', '', '', '']);
    
    storeState.setTurnPhase('planning');
    storeState.setCurrentActionSlot(0);
    storeState.setTurnNumber(0);
    storeState.setTempBuffs({ playerAtk: 0, playerDef: 0, playerCrit: 0, enemyAtk: 0, enemyDef: 0 });
    storeState.setCombatMenu('main');
  };

  const endCombat = (victory: boolean) => {
    if (victory && enemy) {
      const reward = enemy.reward || { shards: 15 };

      const newInventory: InventoryItem[] = [...gameState.inventory];

      // D1b: Pre-rolled drop is GUARANTEED + possibleLoot as bonus (low chance)
      if (preRolledDrop) {
        const invItem: InventoryItem = {
          id: preRolledDrop.itemName,
          rarity: preRolledDrop.itemRarity,
          skillRarities: preRolledDrop.skillRarities,
        };
        newInventory.push(invItem);
        const rarityLabel = RARITY_CONFIG[preRolledDrop.itemRarity].label;
        showToast(`¡${rarityLabel} ${preRolledDrop.itemName}!`, "success");
      }

      // possibleLoot bonus: reduced chance (50% of original) for extra drop
      const bonusLootChance = (enemy.lootChance || 0.25) * 0.5;
      if (enemy.possibleLoot?.length > 0 && Math.random() < bonusLootChance) {
        const lootObj = enemy.possibleLoot[Math.floor(Math.random() * enemy.possibleLoot.length)];
        const itemName = typeof lootObj === 'string' ? lootObj : lootObj.item;
        const lootRarity = (typeof lootObj === 'object' && lootObj.rarity) ? lootObj.rarity as Rarity : 'normal';
        newInventory.push({ id: itemName, rarity: lootRarity, skillRarities: {} });
        showToast(`¡Bonus: ${itemName}!`, "success");
      }

      const enemyName = enemy?.name || '';

      // Pre-rolled part name for bestiary tracking
      const droppedPartName = preRolledDrop?.itemName || '';

      // Quest kill tracking
      let newQuestProgress = { ...gameState.questProgress };
      QST.filter((q: any) => q.type === 'kill').forEach((q: any) => {
        const key = q.id;
        const current = newQuestProgress[key] || 0;
        let increment = false;
        if (q.target === enemyName) increment = true;
        // Substring match: "Trasgo" matches "Trasgo Tontin" and "Trasgo Lanzahuesos"
        if (!increment && enemyName && enemyName.includes(q.target)) increment = true;
        if (!increment && enemyName) {
          const locData = Object.values(LOC).find((l: any) => (l.enemies as string[])?.includes(enemyName));
          if (locData && (locData as any).name === q.target) increment = true;
        }
        if (increment) newQuestProgress[key] = current + 1;
      });

      // Quest collect tracking: increment for each part dropped in zone
      const currentZone = gameState.currentLocation;
      QST.filter((q: any) => q.type === 'collect' && q.target === currentZone).forEach((q: any) => {
        newQuestProgress[q.id] = (newQuestProgress[q.id] || 0) + (droppedPartName ? 1 : 0);
      });

      setGameState(prev => {
        const finalInv = [...newInventory];
        if (enemy.reward?.items) {
          enemy.reward.items.forEach((item: string) => {
            finalInv.push({ id: item, rarity: 'normal', skillRarities: {} });
            showToast(`¡Has obtenido ${item}!`, "success");
          });
        }

        // Bestiary
        const newBestiary = { ...(prev.bestiary || {}) };
        if (enemyName) {
          const entry = newBestiary[enemyName] || { kills: 0, dropsFound: [] };
          entry.kills += 1;
          if (droppedPartName && !entry.dropsFound.includes(droppedPartName)) {
            entry.dropsFound.push(droppedPartName);
          }
          newBestiary[enemyName] = entry;
        }

        // No combat-end putrefaccion degradation — skills only degrade per use

        return {
          ...prev,
          resources: { 
            ...prev.resources, 
            shards: prev.resources.shards + reward.shards, 
          },
          wins: prev.wins + 1,
          inventory: finalInv,
          bestiary: newBestiary,
          questProgress: newQuestProgress,
          defeatedBosses: enemy.isBoss 
            ? Array.from(new Set([...prev.defeatedBosses, prev.currentLocation, enemy.name])) 
            : prev.defeatedBosses
        };
      });

      // Unlock lore by boss defeat
      if (enemy.isBoss) {
        checkLoreUnlocks('boss', enemy.name);
      }

      if (enemy?.name === "Serpiente") {
        setTimeout(() => addLog("🐍 ¡Una cola de serpiente como piernas! Esto es... elegante.", "player"), 100);
      }

      showToast(`Victoria! +${reward.shards}💎`, "success");
      playSound('coin');
      
      if (gameState.storyFlags.inDungeon) {
        setTimeout(() => nextDungeonRoom(), 1000);
      }
    }

    setIsCombat(false);
    setCombatMenu('main');
    setEnemy(null);
    enemyFirstRef.current = false;

    // Also clean up zustand store combat state
    useGameStore.getState().endCombat();
  };

  const enemyTurn = (overrideIntent?: { type: string; value: number; icon: string; text: string; skillId?: string; skillData?: any; isMasterSkill?: boolean }) => {
    if (enemyHp <= 0) return;

    // Use ref to avoid stale closure in recursive calls (freeze loop)
    enemyTurnCountRef.current += 1;
    setEnemyTurnCount(enemyTurnCountRef.current);

    // Use override intent if provided (for freeze follow-up turns)
    const activeIntent = overrideIntent || enemyIntent;

    // Process status effects on enemy
    let currentEnemyBleed = combatFx.enemyBleed;
    let currentEnemyBleedTurns = combatFx.enemyBleedTurns;
    let currentEnemyPoison = combatFx.enemyPoison;
    let currentEnemyPoisonTurns = combatFx.enemyPoisonTurns;
    let currentEnemyFrozen = combatFx.enemyFrozen;
    let currentEnemyHp = enemyHp;

    if (currentEnemyBleed > 0 && currentEnemyBleedTurns > 0) {
      currentEnemyHp -= currentEnemyBleed;
      setEnemyHp(currentEnemyHp);
      addLog(`Sangrado: -${currentEnemyBleed}`, "effect");
      triggerCombatVfx('bleed', 'enemy');
      playSound('bleed');
      currentEnemyBleedTurns--;
    }

    if (currentEnemyPoison > 0 && currentEnemyPoisonTurns > 0) {
      currentEnemyHp -= currentEnemyPoison;
      setEnemyHp(currentEnemyHp);
      addLog(`Veneno: -${currentEnemyPoison}`, "effect");
      triggerCombatVfx('poison', 'enemy');
      playSound('poison');
      currentEnemyPoisonTurns--;
    }

    if (currentEnemyHp <= 0) {
      setTimeout(() => endCombat(true), 800);
      return;
    }

    if (currentEnemyFrozen) {
      addLog("Congelado, pierde turno.", "effect");
      setCombatFx(prev => ({ ...prev, enemyFrozen: false, enemyBleedTurns: currentEnemyBleedTurns, enemyPoisonTurns: currentEnemyPoisonTurns }));
      setIsPlayerTurn(true);
      setEnemyIntent(calculateEnemyIntent(enemy, enemyTurnCountRef.current, enemyHp, enemyMaxHp, masterSkillUsed));
      return;
    }

    // Process player poison
    let currentPoison = combatFx.playerPoison;
    let currentPoisonTurns = combatFx.playerPoisonTurns;
    let currentPoisonDmg = combatFx.playerPoisonDmg;
    if (currentPoison && currentPoisonTurns > 0) {
      addLog(`Veneno: -${currentPoisonDmg} piezas`, "effect");
      triggerFloatingNumber(`-${currentPoisonDmg}`, "damage");
      triggerCombatVfx('poison', 'player');
      playSound('poison');
      setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - currentPoisonDmg) }));
      currentPoisonTurns--;
      if (currentPoisonTurns <= 0) currentPoison = false;
    }

    // Process player bleed
    let currentBleed = combatFx.playerBleed;
    let currentBleedTurns = combatFx.playerBleedTurns;
    let currentBleedDmg = combatFx.playerBleedDmg;
    if (currentBleed && currentBleedTurns > 0) {
      addLog(`Sangrado: -${currentBleedDmg} piezas`, "effect");
      triggerFloatingNumber(`-${currentBleedDmg}`, "damage");
      triggerCombatVfx('bleed', 'player');
      playSound('bleed');
      setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - currentBleedDmg) }));
      currentBleedTurns--;
      if (currentBleedTurns <= 0) currentBleed = false;
    }



    setTimeout(() => {
      let dmg = activeIntent.value;
      const skillData = activeIntent.skillData;
      const skillName = skillData?.name || null;
      const skillId = activeIntent.skillId;
      // Get skill rarity multiplier for pre-rolled skill (attributes scale, effects don't)
      const enemySkillRarities = enemy?._skillRarities || preRolledDrop?.skillRarities || {};
      const skillRarity = skillId ? enemySkillRarities[skillId] : undefined;
      const sMult = skillRarity ? SKILL_RARITY_MULTIPLIER[skillRarity] : 1.0;

      // Enemy buff (fury/evasion) — no damage
      if (activeIntent.type === "buff") {
        addLog(`${enemy.name} usa ${skillName || 'Fortalecer'}!`, "enemy");
        playSound('buff');
        // Fury is an EFFECT — not scaled by skill rarity
        if (skillData?.fury) {
          setCombatFx(prev => ({ ...prev, enemyFury: true, enemyFuryTurns: 2 }));
          addLog(`${enemy.name} se fortalece!`, "effect");
          triggerCombatVfx('fury', 'enemy');
        }
      } else if (activeIntent.type === "defend") {
        addLog(`${enemy.name} usa ${skillName || 'Proteger'}!`, "enemy");
        playSound('shield');
        // Shield is an ATTRIBUTE — scaled by skill rarity
        if (skillData?.shield) {
          const scaledShield = Math.min(0.8, skillData.shield * sMult);
          setCombatFx(prev => ({ ...prev, enemyShield: true, enemyShieldValue: scaledShield }));
          addLog(`${enemy.name} se proteje! (-${Math.floor(scaledShield * 100)}% daño)`, "effect");
        }
        // Heal is an ATTRIBUTE — scaled by skill rarity
        if (skillData?.heal && skillData.heal > 0) {
          const scaledHeal = Math.max(1, Math.floor(skillData.heal * sMult));
          setEnemyHp(prev => Math.min(enemyMaxHp, prev + scaledHeal));
          addLog(`${enemy.name} recupera ${scaledHeal} HP!`, "effect");
        }
        // Fury is an EFFECT — not scaled by skill rarity
        if (skillData?.fury) {
          setCombatFx(prev => ({ ...prev, enemyFury: true, enemyFuryTurns: 2 }));
          addLog(`${enemy.name} se fortalece!`, "effect");
          triggerCombatVfx('fury', 'enemy');
        }
      } else {
        // Attack-type intent — calculate damage with skill modifiers
        if (combatFx.enemyDebuff && combatFx.enemyDebuffTurns > 0) {
          dmg = Math.floor(dmg * 0.7);
        }

        // Armor penetration (e.g. Puñalada Trampa)
        if (skillData?.armorPen) {
          const penFactor = 1 - skillData.armorPen;
          if (combatFx.playerShield) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
          if (combatFx.playerGuard) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
        } else {
          if (combatFx.playerShield) dmg = Math.floor(dmg * 0.5);
          if (combatFx.playerGuard) dmg = Math.floor(dmg * 0.5);
        }

        // Enemy fury buff increases damage
        if (combatFx.enemyFury) {
          dmg = Math.floor(dmg * 1.5);
        }

        dmg = Math.max(1, dmg);

        // First attack bonus: if enemy goes first and this is their first attack
        if (!firstAttackDone && !playerFirstRef.current) {
          const eSpeed = enemy?.speed || 10;
          const pSpeed = getSpeed();
          const speedDiff = Math.max(0, eSpeed - pSpeed);
          if (speedDiff > 0) {
            dmg += speedDiff;
            addLog(`⚡ Bonus velocidad: +${speedDiff} daño!`, "effect");
          }
          setFirstAttackDone(true);
        }

        setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - dmg) }));
        addLog(`${enemy.name} usa ${skillName || 'Ataque'} por ${dmg}!`, "enemy");
        triggerFloatingNumber(`-${dmg}`, "damage");
        triggerCombatVfx('slash', 'player');
        triggerShake();
        triggerFlash('damage');
        playSound('hit');

        // Apply bleed from enemy skill (e.g. Mordisco Venenoso, Sangre Tóxica)
        // Bleed is an ATTRIBUTE — scaled by skill rarity
        if (skillData?.bleed && !combatFx.playerBleed) {
          const scaledBleed = Math.max(1, Math.floor(skillData.bleed * sMult));
          addLog(`¡Sangrado! -${scaledBleed} piezas/turno`, "effect");
          currentBleed = true;
          currentBleedTurns = 3;
          currentBleedDmg = scaledBleed;
          triggerCombatVfx('bleed', 'player');
        }

        // Apply debuff from enemy skill (e.g. Golpe Bajo, Trampa Sucia)
        if (skillData?.debuff) {
          addLog(`¡Desconcertado! Tus golpes son más débiles.`, "effect");
          playSound('debuff');
        }

        // Steal from enemy skill (e.g. Trampa Sucia) — steal is an ATTRIBUTE, scaled
        if (skillData?.steal) {
          const scaledSteal = Math.max(1, Math.floor(skillData.steal * sMult));
          const stolen = Math.min(scaledSteal, gameState.resources.shards);
          if (stolen > 0) {
            setGameState(prev => ({ ...prev, resources: { ...prev.resources, shards: Math.max(0, prev.resources.shards - stolen) } }));
            addLog(`¡Robo! -${stolen} fragmentos`, "effect");
          }
        }

        // Multi-hit from enemy skill (e.g. Horda Trasga, Lluvia de Huesos)
        if (skillData?.multi && skillData.multi > 1) {
          const hits = skillData.multi;
          const extraDmgPerHit = Math.floor(dmg * 0.5);
          const totalExtra = extraDmgPerHit * (hits - 1);
          if (totalExtra > 0) {
            setGameState(prev => ({ ...prev, pieces: Math.max(0, prev.pieces - totalExtra) }));
            for (let i = 1; i < hits; i++) {
              addLog(`Impacto ${i + 1}: -${extraDmgPerHit}`, "effect");
            }
            triggerFloatingNumber(`-${dmg + totalExtra}`, "damage");
          }
        }

        // Freeze/stun from enemy skill (e.g. Decreto Real, Mirada Dominante, Paso Sísmico)
        // Stun resistance: progressive — use ref to avoid stale closure in recursive calls
        if (skillData?.freeze) {
          const currentStunCount = playerStunCountRef.current;
          let resisted = false;
          if (currentStunCount >= 2) {
            resisted = true; // 100% resist after 2 stuns
          } else if (currentStunCount === 1) {
            resisted = Math.random() < 0.5; // 50% resist after 1 stun
          }
          // currentStunCount === 0: no resist (100% stun)
          
          if (resisted) {
            addLog(`¡Barnaby resiste la parálisis!`, "effect");
            playSound('freeze');
            triggerCombatVfx('freeze', 'player');
          } else {
            addLog(`¡Paralizado! Pierdes tu próximo turno.`, "effect");
            playSound('freeze');
            triggerCombatVfx('freeze', 'player');
          }
        }
      }

      // Bleed/poison from enemy skill now flow through their own vars

      // Check if master skill was used
      const wasMasterSkill = activeIntent.isMasterSkill;
      if (wasMasterSkill) {
        setMasterSkillUsed(true);
      }

      // Determine if player gets frozen (with stun resistance check)
      // Use ref to avoid stale closure in recursive enemyTurn calls
      const freezeSkill = skillData?.freeze;
      const currentStunCount = playerStunCountRef.current;
      let playerGetsFrozen = false;
      if (freezeSkill) {
        let resisted = false;
        if (currentStunCount >= 2) {
          resisted = true;
        } else if (currentStunCount === 1) {
          resisted = Math.random() < 0.5;
        }
        playerGetsFrozen = !resisted;
      }

      setCombatFx(prev => ({
        ...prev,
        playerShield: false,
        playerGuard: false,
        enemyBleedTurns: currentEnemyBleedTurns,
        enemyPoisonTurns: currentEnemyPoisonTurns,
        enemyDebuffTurns: Math.max(0, prev.enemyDebuffTurns - 1),
        enemyFuryTurns: Math.max(0, (prev.enemyFuryTurns || 0) - 1),
        enemyFury: (prev.enemyFuryTurns || 0) > 1 ? prev.enemyFury : false,
        playerPoison: currentPoison,
        playerPoisonTurns: currentPoisonTurns,
        playerPoisonDmg: currentPoisonDmg,
        playerBleed: currentBleed,
        playerBleedTurns: currentBleedTurns,
        playerBleedDmg: currentBleedDmg,
        // If enemy skill has debuff, apply player debuff
        ...(skillData?.debuff ? { playerDebuff: true, playerDebuffTurns: 2 } : {}),
        // If enemy skill has freeze and not resisted, skip player's next turn
        ...(playerGetsFrozen ? { playerFrozen: true, playerStunCount: (prev.playerStunCount || 0) + 1 } : {}),
        // Always increment stun count if freeze was attempted (even if resisted)
        ...(!playerGetsFrozen && freezeSkill ? { playerStunCount: (prev.playerStunCount || 0) + 1 } : {})
      }));
      // Sync stun count ref immediately so recursive calls see the updated value
      playerStunCountRef.current = (playerStunCountRef.current || 0) + (freezeSkill ? 1 : 0);

      // If player is frozen (stunned), skip their turn and enemy gets another turn
      if (playerGetsFrozen) {
        setTimeout(() => {
          addLog("Barnaby está paralizado, no puede actuar.", "effect");
          setCombatFx(prev => ({ ...prev, playerFrozen: false }));
          // Enemy gets another turn since player is stunned
          // Use ref to get the correct turn count (avoid stale closure)
          const nextIntent = calculateEnemyIntent(enemy, enemyTurnCountRef.current, enemyHp, enemyMaxHp, masterSkillUsed);
          setEnemyIntent(nextIntent);
          setTimeout(() => enemyTurn(nextIntent), 800);
        }, 400);
        return;
      }

      // Simple alternation: player's turn next
      setIsPlayerTurn(true);
      setEnemyIntent(calculateEnemyIntent(enemy, enemyTurnCountRef.current, enemyHp, enemyMaxHp, masterSkillUsed));
      
    }, 800);
  };

  const handleAction = useCallback((techName: string) => {
    // ── 4-Action Turn System ──
    // During planning phase: each skill click adds to the action order
    // After all available skills selected, auto-confirm and execute the turn
    const storeState = useGameStore.getState();
    const phase = storeState.turnPhase;

    if (phase === 'executing') return; // Can't act during execution

    const currentOrder = [...storeState.playerActionOrder];
    // Find next empty slot
    const nextSlot = currentOrder.findIndex((s, i) => !s || s === '' || i >= currentOrder.length);
    const insertAt = nextSlot >= 0 ? nextSlot : currentOrder.length;

    if (insertAt >= 4) return; // All 4 slots filled

    // Add skill to the order
    const newOrder = [...currentOrder];
    while (newOrder.length < 4) newOrder.push('');
    newOrder[insertAt] = techName;
    storeState.setPlayerActionOrder(newOrder);

    // Count available (non-worn-out) skills
    const availableSkills = getEquippedSkills().filter(sk => {
      const slot = findSkillSlot(sk);
      const eq = slot ? (gameState.equipment as any)[slot] as EquipSlot | null : null;
      return !eq || eq.putrefaccion !== 0;
    });
    const availableCount = availableSkills.length;

    // Count filled slots after this selection
    const filledSlots = newOrder.filter(s => s && s !== '').length;

    // Auto-confirm when all available skills are selected or all 4 slots filled
    if (filledSlots >= availableCount || filledSlots >= 4) {
      // Auto-confirm after a brief delay so the player sees the golden glow
      setTimeout(() => {
        combatActions.confirmPlayerOrder(playSound);
      }, 500);
    }

    playSound('click');
    // Stay in skills menu so player can see golden glow on selected skills
    return;

    // ── Legacy 1-action combat code below (unused, kept for reference) ──
    /* eslint-disable no-unreachable */
    if (!isPlayerTurn) return;
    
    const tech = TDB[techName];
    if (!tech) return;

    const isPhys = tech.type === 'basic' || tech.type === 'bleed' || tech.type === 'steal';
    let cost = tech.cost || 0;


    if (gameState.pieces < cost) {
      showToast("Piezas insuficientes!", "error");
      return;
    }

    setIsPlayerTurn(false);
    setGameState(prev => ({ ...prev, pieces: prev.pieces - cost }));
    
    if (tech.name === "Detonacion Osea") {
      setGameState(prev => ({ ...prev, maxPieces: Math.max(50, prev.maxPieces - 20) }));
    }
    if (tech.name === "Barrera Costillas") {
      setGameState(prev => ({ ...prev, maxPieces: Math.max(50, prev.maxPieces - 15) }));
    }

    let dmg = tech.damage + (isPhys ? getAttack() : Math.floor(getAttack() * 0.3));

    // Player debuff from enemy (e.g. Golpe Bajo)
    if (combatFx.playerDebuff && combatFx.playerDebuffTurns > 0) {
      dmg = Math.floor(dmg * 0.7);
    }

    // Enemy shield reduces player damage (e.g. Piel Brutal, Retirada Táctica)
    if (combatFx.enemyShield) {
      const reduction = combatFx.enemyShieldValue || 0.4;
      dmg = Math.floor(dmg * (1 - reduction));
      addLog(`¡Escudo enemigo! Daño reducido a ${dmg}`, "effect");
    }

    // Fury effect (if active or from tech)
    const hpPercent = gameState.pieces / Math.max(1, getMaxPieces()) * 100;
    if (tech.fury) {
      dmg = Math.floor(dmg * 1.5);
    }

    const critChance = getCrit();
    const isCrit = Math.random() * 100 < critChance || gameState.storyFlags.nextCrit;
    
    if (isCrit) {
      dmg = Math.floor(dmg * 1.5);
      triggerFloatingNumber(`-${dmg}`, "crit");
      addLog(`${tech.name}: ${dmg} CRIT!`, "player");
      triggerFlash('crit');
      triggerShake();
      triggerCombatVfx('crit', 'enemy');
      playSound('crit');
    } else {
      triggerFloatingNumber(`-${dmg}`, "damage");
      addLog(`${tech.name}: ${dmg}`, "player");
    }

    // First attack bonus: if player goes first and this is their first attack
    if (!firstAttackDone && playerFirstRef.current) {
      const pSpeed = getSpeed();
      const eSpeed = enemy?.speed || 10;
      const speedDiff = Math.max(0, pSpeed - eSpeed);
      if (speedDiff > 0) {
        dmg += speedDiff;
        addLog(`⚡ Bonus velocidad: +${speedDiff} daño!`, "player");
      }
      setFirstAttackDone(true);
    }

    if (tech.multi) {
      // Simulate multiple hits in log
      for (let i = 1; i < tech.multi; i++) {
        addLog(`Hit extra: ${Math.floor(dmg/2)}`, "player");
      }
      setEnemyHp(prev => Math.max(0, prev - (dmg + Math.floor(dmg/2) * (tech.multi! - 1))));
    } else {
      setEnemyHp(prev => Math.max(0, prev - dmg));
    }

    playSound(isPhys ? 'attack' : 'magic');

    // Putrefaccion degradation per skill use — only degrade the specific slot providing this skill
    const skillSlot = findSkillSlot(techName);
    if (skillSlot) {
      setGameState(prev => {
        const newEquip = { ...prev.equipment };
        const eq = (newEquip as any)[skillSlot] as EquipSlot | null;
        if (eq) {
          const newP = Math.max(0, eq.putrefaccion - 1);
          if (newP <= 0) {
            // Don't remove, just mark as worn out
            (newEquip as any)[skillSlot] = { ...eq, putrefaccion: 0 };
            addLog(`⚠️ ¡${eq.id} no tiene más usos! Ve a reparar.`, "effect");
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
      const maxP = getMaxPieces();
      setGameState(prev => ({ ...prev, pieces: Math.min(maxP, prev.pieces + healAmt) }));
      addLog(`Robo de vida: +${healAmt} piezas`, "effect");
      playSound('lifesteal');
    }

    // Set Effect: Originality (Barnaby 4 set)
    if (Object.entries(getActiveSets()).some(([name, count]) => name === 'Barnaby' && (count as number) >= 4)) {
      setGameState(prev => ({ ...prev, pieces: Math.min(prev.maxPieces, prev.pieces + 2) }));
    }

    // Set Effect: Ráfaga (Goblin 4 set) - gain 3 pieces per turn when dodging (handled here as bonus)
    if (Object.entries(getActiveSets()).some(([name, count]) => name === 'Goblin' && (count as number) >= 4)) {
      // Ráfaga effect
    }

    // Self Damage
    if (tech.selfDamage) {
      setGameState(prev => ({ ...prev, pieces: Math.max(1, prev.pieces - tech.selfDamage!) }));
      addLog(`Singularidad: -${tech.selfDamage} piezas`, "danger");
    }

    // Trigger VFX based on tech type
    if (tech.type === 'bleed') triggerCombatVfx('bleed', 'enemy');
    else if (tech.type === 'defense') triggerCombatVfx('shield', 'player');
    else if (tech.type === 'ultimate' || tech.type === 'sacrifice') triggerCombatVfx('explosion', 'enemy');
    else if (tech.type === 'magic') triggerCombatVfx('magic', 'enemy');
    else if (isPhys) triggerCombatVfx('slash', 'enemy');

    if (tech.heal) {
      const maxP = getMaxPieces();
      setGameState(prev => ({ ...prev, pieces: Math.min(maxP, prev.pieces + tech.heal!) }));
      triggerFloatingNumber(`+${tech.heal}`, "heal");
      triggerCombatVfx('heal', 'player');
    }

    if (tech.freeze) {
      setCombatFx(prev => ({ ...prev, enemyFrozen: true }));
      triggerCombatVfx('freeze', 'enemy');
      playSound('freeze');
    }
    if (tech.bleed) { setCombatFx(prev => ({ ...prev, enemyBleed: tech.bleed!, enemyBleedTurns: 3 })); playSound('bleed'); }
    if (tech.debuff) {
      setCombatFx(prev => ({ ...prev, enemyDebuff: true, enemyDebuffTurns: 2 }));
      triggerCombatVfx('debuff', 'enemy');
      playSound('debuff');
    }
    if (tech.shield) setCombatFx(prev => ({ ...prev, playerShield: true }));

    // Decrement player debuff from enemy skills, reset enemy shield after player attacks
    setCombatFx(prev => ({
      ...prev,
      playerDebuffTurns: Math.max(0, (prev.playerDebuffTurns || 0) - 1),
      playerDebuff: (prev.playerDebuffTurns || 0) > 1 ? prev.playerDebuff : false,
      enemyShield: false,
      enemyShieldValue: 0,
    }));

    if (enemyHp <= dmg) {
      triggerCombatVfx('death', 'enemy');
      setTimeout(() => endCombat(true), 800);
    } else {
      // Simple alternation: enemy turn next
      // Use ref to avoid stale closure for turn count
      const nextTurn = enemyTurnCountRef.current + 1;
      const nextIntent = calculateEnemyIntent(enemy, nextTurn, enemyHp - dmg, enemyMaxHp, masterSkillUsed);
      setEnemyIntent(nextIntent);
      setTimeout(() => enemyTurn(nextIntent), 800);
    }
  }, [isPlayerTurn, gameState.pieces, gameState.maxPieces, gameState.equipment, enemyHp, getAttack, getCrit, getMaxPieces, getActiveSets, playSound, addLog, triggerFloatingNumber, masterSkillUsed]);

  const enterDungeon = () => {
    const loc = LOC[gameState.currentLocation];
    if (!loc || loc.isTown) return;
    const isForest = gameState.currentLocation === "🌲 Bosque";

    const roomsCount = 5 + Math.floor(Math.random() * 4);
    const rooms = [];
    for (let i = 0; i < roomsCount; i++) {
       const rng = Math.random();
       if (isForest) {
         if (rng < 0.75) rooms.push({ type: 'combat' });
         else rooms.push({ type: 'treasure' });
       } else {
         if (rng < 0.6) rooms.push({ type: 'combat' });
         else if (rng < 0.8) rooms.push({ type: 'rest' });
         else rooms.push({ type: 'treasure' });
       }
    }
    rooms.push({ type: 'boss' });

    const reward = isForest
      ? { shards: 180 }
      : { shards: 140 };

    setGameState(prev => ({
      ...prev,
      storyFlags: { ...prev.storyFlags, inDungeon: true },
      dungeon: {
        rooms,
        currentRoom: 0,
        depth: roomsCount + 1,
        reward
      }
    }));
    showToast(isForest ? "🔥 ¡Mazmorra del Bosque! Sin refugio, solo lucha y tesoro." : "Entrando en Mazmorra...", "info");
    playSound('dungeon');
  };

  const nextDungeonRoom = () => {
    if (!gameState.dungeon) return;
    
    if (gameState.dungeon.currentRoom >= gameState.dungeon.rooms.length - 1) {
      setGameState(prev => ({
        ...prev,
        storyFlags: { ...prev.storyFlags, inDungeon: false },
        dungeon: null,
        resources: { 
          ...prev.resources, 
          shards: prev.resources.shards + (gameState.dungeon?.reward.shards || 0)
        }
      }));
      showToast("¡Mazmorra Completada!", "success");
      playSound('victory');
      return;
    }

    setGameState(prev => ({
      ...prev,
      dungeon: prev.dungeon ? { ...prev.dungeon, currentRoom: prev.dungeon.currentRoom + 1 } : null
    }));
  };

  const deliverQuest = (questId: string) => {
    const quest = QST.find(q => q.id === questId);
    if (!quest) return;

    setGameState(prev => {
      const active = prev.activeQuests.filter(q => q.id !== questId);
      const completed = [...prev.completedQuests, questId];
      
      let newShards = prev.resources.shards + (quest.reward.shards || 0);

      let finalInventory = [...prev.inventory];
      if (quest.reward.item) {
        finalInventory.push({ id: quest.reward.item, rarity: 'normal', skillRarities: {} });
      }
      let newPotions = prev.resources.potions + (quest.reward.potions || 0);
      
      const newPieces = Math.min(prev.maxPieces, prev.pieces + (quest.reward.integrity || 0));

      return {
        ...prev,
        activeQuests: active,
        completedQuests: completed,
        resources: { ...prev.resources, shards: newShards, potions: newPotions },
        inventory: finalInventory,
        pieces: newPieces,
      };
    });

    showToast(`¡Misión Entregada: ${quest.name}!`, "success");
    playSound('quest');
  };

  const handleNpcClick = (npcName: string) => {
    talkToNpc(npcName);
  };

  const talkToNpc = (npcName: string) => {
    let text = "";
    let options: any[] = [{ label: "Adiós", action: () => setNpcDialog(null) }];

    const activeQuest = gameState.activeQuests.find(q => q.giver === npcName);
    const availableQuest = QST.find(q => q.giver === npcName && !gameState.activeQuests.find(aq => aq.id === q.id) && !gameState.completedQuests.includes(q.id) && (!q.reqQuest || gameState.completedQuests.includes(q.reqQuest)));

    if (npcName === "Morgana") {
      text = "Barnaby... tus piezas suenan como música de ultratumba. ¿Buscas algo en particular?";
    } else if (npcName === "Mercader") {
      text = "Huesos, cristales, fragmentos... todo tiene un precio aquí.";
      options.unshift({ label: "Ver Tienda", action: () => { setNpcDialog(null); setActivePanel('shop'); } });
    } else if (npcName === "Herrero") {
      text = "¡Clang, clang! Mis martillos no descansan, igual que tus huesos. ¿Necesitas forjar algo?";
      options.unshift({ label: "Abrir Forja", action: () => { setNpcDialog(null); setActivePanel('forge'); } });
    } else if (npcName === "Tabernero") {
      text = "¡Eh, esqueleto! En mi taberna no juzgamos... mucho. ¿Quieres descansar? 20💎 por una cama y comida.";
      options.unshift({ label: "Descansar (20💎)", action: () => { setNpcDialog(null); restAction(); } });
    } else if (npcName === "Viajero") {
      text = "Los caminos son largos y peligrosos, pero yo conozco todos los atajos. ¿A dónde quieres ir?";
      options.unshift({ label: "Ver Mapa", action: () => { setNpcDialog(null); setActivePanel('map'); } });
    } else if (npcName === "Rattlebones") {
      const rattleQuestDone = gameState.completedQuests.includes("rattle_5_baile");
      if (rattleQuestDone) {
        text = "¡Barnaby! Cada vez que nos cruzamos, mis huesos vibran. ¿Listo para otro baile? Mis partes son tu recompensa... si puedes ganarlas.";
        options.unshift({ label: "💃 Desafiar", action: () => { setNpcDialog(null); startCombat("🕺 Rattlebones", true); } });
      } else {
        text = "¡Hey Barnaby! Siento el ritmo en tus costillas. ¿Te unes al baile?";
      }
    } else {
      text = `Hola, viajero. No solemos ver a muchos de tu... tipo por aquí.`;
    }

    if (activeQuest) {
      // Check if requirement met
      let met = false;
      if (activeQuest.boss) {
        if (gameState.defeatedBosses.includes(activeQuest.boss)) met = true;
      } else if (activeQuest.type === 'kill') {
        const progress = gameState.questProgress?.[activeQuest.id] || 0;
        if (progress >= activeQuest.count) met = true;
      } else if (activeQuest.type === 'boss') {
        if (gameState.defeatedBosses.includes(activeQuest.target)) met = true;
      } else if (activeQuest.type === 'collect') {
        const progress = gameState.questProgress?.[activeQuest.id] || 0;
        if (progress >= activeQuest.count) met = true;
      } else if (activeQuest.type === 'potion') {
        const progress = gameState.questProgress?.[activeQuest.id] || 0;
        if (progress >= activeQuest.count) met = true;
      } else if (activeQuest.type === 'equip_set') {
        const sets = getActiveSets();
        const anySetReady = Object.values(sets).some((c: any) => (c as number) >= activeQuest.count);
        if (anySetReady) met = true;
      } else if (activeQuest.type === 'talk') {
        met = true; // talk quests are completed by speaking to the NPC
      }

      if (met) {
        text += `\n\n[Misión: ${activeQuest.name}]\n¡Has cumplido lo que te pedí!`;
        options.unshift({ label: `Entregar: ${activeQuest.name}`, action: () => {
          deliverQuest(activeQuest.id);
          setNpcDialog(null);
        }});
      } else {
        text += `\n\n[Misión Activa: ${activeQuest.name}]\n¿Cómo va el progreso? Recuérdalo: ${activeQuest.req}`;
      }
    } else if (availableQuest) {
      options.unshift({ label: `Misión: ${availableQuest.name}`, action: () => {
        setGameState(prev => ({ ...prev, activeQuests: [...prev.activeQuests, availableQuest] }));
        showToast("Misión aceptada", "info");
        setNpcDialog(null);
      }});
    }

    setNpcDialog({ name: npcName, text, options, info: NPC_INFO[npcName] });
    setShowNpcInfo(false);
    playSound('click');

    // Unlock lore by NPC interaction
    checkLoreUnlocks('npc', npcName);
  };

  return (
    <div className={`relative w-full h-[100dvh] bg-bg-deep flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-mono grain ${screenShake ? 'animate-shake' : ''}`}>
      {/* Visual Enhancers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-30" />

        
        {/* Animated Fog */}
        <div className="absolute bottom-0 left-0 w-[200%] h-1/2 bg-gradient-to-t from-bg-deep to-transparent opacity-40 blur-3xl animate-[driftFog_60s_linear_infinite]" />
        <div className="absolute bottom-0 left-0 w-[200%] h-1/3 bg-gradient-to-t from-bg-deep to-transparent opacity-30 blur-2xl animate-[driftFog_45s_linear_infinite_reverse]" />
        
        {/* Floating Bone Dust Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bottom-[-10%] w-0.5 h-0.5 bg-text-primary/20 rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `floatParticles ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[2000] pointer-events-none ${flash === 'crit' ? 'bg-white' : 'bg-red-600'}`}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIntro ? (
          <IntroOverlay onStart={startGame} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[680px] relative z-10 overflow-hidden flex flex-col border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] border-b-8 border-r-8"
          >
            {/* Dynamic Zone Background */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={isCombat ? 'combat' : gameState.storyFlags.inDungeon ? 'dungeon' : gameState.currentLocation}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute inset-0 ${isCombat ? 'zone-bg-combat' : gameState.storyFlags.inDungeon ? 'zone-bg-dungeon' : gameState.currentLocation === '🏙️ Ciudad' ? 'zone-bg-city' : gameState.currentLocation === '🌲 Bosque' ? 'zone-bg-forest' : 'zone-bg-default'}`}
              />
            </AnimatePresence>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />

            {/* Phaser 3 Overlay: Atmospheric particle effects */}
            <PhaserOverlay
              zone={isCombat ? 'combat' : gameState.storyFlags.inDungeon ? 'dungeon' : gameState.currentLocation === '🏙️ Ciudad' ? 'city' : gameState.currentLocation === '🌲 Bosque' ? 'forest' : 'default'}
              combatVfx={activeCombatVfx}
              transitionFlash={!!travelTransition}
              shakeIntensity={screenShake ? 1 : 0}
            />

            {/* Travel Transition Overlay */}
            <AnimatePresence>
              {travelTransition && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-[200] bg-black flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-3xl mb-3 block">🦴</span>
                      <span className="text-accent font-display text-lg font-black uppercase tracking-widest">Caminando...</span>
                      <p className="text-text-muted text-xs mt-2 font-mono italic">{travelTransition}</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent/70 z-50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent/70 z-50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/70 z-50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent/70 z-50" />
            
            {/* Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0">
              <Skull size={400} />
            </div>
            {/* Header */}
            <header className={`relative z-50 flex items-center justify-between px-3 sm:px-6 border-b-2 border-[#d4943a] shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-all duration-300 ${isCombat ? 'h-10' : 'h-14'}`} style={{ backgroundColor: '#1a1428' }}>
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Profile Icon - Animated glow */}
                <div className="relative group flex-shrink-0">
                  <button 
                    onClick={() => { playSound('page'); !isCombat && setActivePanel('lore'); }} 
                    className={`border-2 overflow-hidden hover:border-[#d4943a] transition-all hover:scale-105 active:scale-95 ${isCombat ? 'w-7 h-7 rounded-full border-[#d4943a]/50' : 'w-9 h-9 sm:w-11 sm:h-11 rounded-full border-[#d4943a]/70'} ${gameState.pieces / Math.max(1, getMaxPieces()) < 0.3 ? 'shadow-[0_0_12px_rgba(220,38,38,0.6)] animate-pulse border-red-500/60' : 'shadow-[0_0_10px_rgba(212,148,58,0.3)]'}`}
                  >
                    <img src="/game/ui/profile-skeleton.png" alt="Barnaby" className="w-full h-full object-cover" />
                  </button>
                  {/* Parchment tooltip - appears BELOW the profile icon, on top of main */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-[#d4c4a0] border border-[#8a7a60] text-[#5a4020] text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-[9999]">
                    Lore
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-transparent border-b-[#8a7a60]" />
                  </div>
                </div>
                {!isCombat && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] sm:text-[10px] text-[#d4c4a0] uppercase tracking-widest font-bold">
                        <span className="sm:hidden">Vida</span>
                        <span className="hidden sm:inline">Integridad Ósea</span>
                      </span>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#d4c4a0] border border-[#8a7a60] rounded-sm">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#5a4020]">⚡ Esqueleto</span>
                      </div>
                    </div>
                    <div className="w-16 sm:w-40 h-2 sm:h-2.5 bg-[#0e0c14] border border-[#8a7a60]/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${gameState.pieces / Math.max(1, getMaxPieces()) * 100}%` }}
                        className={`h-full ${gameState.pieces / Math.max(1, getMaxPieces()) < 0.3 ? 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-400'}`} 
                      />
                    </div>
                    {/* No XP bar — level/XP system removed */}
                  </div>
                )}
                {/* Compact combat indicator — always visible during combat */}
                {isCombat && (
                  <div className="flex items-center gap-1.5">
                  </div>
                )}
              </div>
              {!isCombat && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#0e0c14]/80 px-3 py-1 rounded border border-[#d4943a]/50">
                    {gameState.currentLocation === "🏙️ Ciudad" && <img src="/game/ui/icon-ciudad.png" alt="" className="w-3.5 h-3.5" />}
                    {gameState.currentLocation === "🌲 Bosque" && <img src="/game/ui/icon-bosque.png" alt="" className="w-3.5 h-3.5" />}
                    <span className="text-[#d4c4a0] font-display italic text-xs sm:text-sm">{LOC[gameState.currentLocation]?.name || gameState.currentLocation}</span>
                  </div>

                </div>
              )}

              {/* Right: Resources */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 bg-[#0e0c14]/80 px-2 py-1 rounded border border-[#d4943a]/50">
                  <span className="text-[10px]">💎</span>
                  <span className="text-[#d4c4a0] font-bold text-[10px] sm:text-xs font-mono">{gameState.resources.shards.toLocaleString()}</span>
                </div>
                <button onClick={() => setActivePanel('options')} className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0e0c14]/80 border border-[#d4943a]/50 flex items-center justify-center rounded cursor-pointer hover:border-[#d4943a] transition-colors">
                  <Settings size={14} className="text-[#d4943a]" />
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className={`relative z-[2] flex-1 ${isCombat ? 'overflow-hidden' : 'overflow-y-auto'} p-2 sm:p-4 custom-scrollbar`}>
              <div className={`flex flex-col ${isCombat ? 'h-full' : 'gap-4'}`}>
                {isCombat ? (
                  <div className="flex flex-col gap-2 h-full">
                    {/* Turn Indicator */}
                    <TurnIndicator isPlayerTurn={storeTurnPhase === 'planning'} />

                    {/* VS Slam Overlay */}
                    <AnimatePresence>
                      {vsSlam && (
                        <motion.div
                          initial={{ scale: 3, opacity: 0, y: -100, rotate: -10 }}
                          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.5, type: 'spring', damping: 12, stiffness: 200 }}
                          className="absolute inset-0 z-[5000] flex items-center justify-center bg-black/80 pointer-events-none"
                        >
                          <img src="/game/ui/vs-icon.png" alt="VS" className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-[0_0_30px_rgba(212,148,58,0.8)]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enemy Card - Full Main (shared component, no duplication) */}
                    <div className="flex-1 relative overflow-hidden" style={{ minHeight: '300px' }}>
                      <EnemyCard
                        enemy={enemy}
                        enemyHp={storeEnemyHp > 0 ? storeEnemyHp : enemyHp}
                        enemyMaxHp={storeEnemyMaxHp > 0 ? storeEnemyMaxHp : enemyMaxHp}
                        enemyActions={storeEnemyActions || []}
                        turnPhase={storeTurnPhase || 'planning'}
                        currentActionSlot={storeCurrentActionSlot || 0}
                        combatMenu={combatMenu}
                        setCombatMenu={setCombatMenu}
                        equippedSkills={getEquippedSkills()}
                        findSkillSlot={findSkillSlot}
                        equipment={gameState.equipment}
                        consumableSlots={gameState.consumableSlots || ['potion', null]}
                        potionCount={gameState.resources.potions}
                        onAction={handleAction}
                        onUseConsumable={useConsumableFromSlot}
                        onFlee={() => endCombat(false)}
                        onConfirmOrder={() => combatActions.confirmPlayerOrder(playSound)}
                        playerActionOrder={storePlayerActionOrder || ['', '', '', '']}
                      />
                    </div>

                    {/* Player HP Bar - Under enemy card */}
                    <div className="px-1 sm:px-2 py-2">
                      <div className="flex items-center gap-2 relative">
                        <span className="text-[9px] sm:text-[10px] text-[#d4943a] font-display font-black uppercase tracking-tight whitespace-nowrap">💀 Barnaby</span>
                        <div className="flex-1 relative">
                          <div className="h-2 sm:h-2.5 bg-black/60 border border-[#d4943a]/30 p-[1px] relative overflow-hidden">
                            <motion.div initial={false} animate={{ width: `${gameState.pieces / Math.max(1, getMaxPieces()) * 100}%` }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }} className="absolute inset-y-0 left-0 bg-white/30 z-10" />
                            <motion.div initial={false} animate={{ width: `${gameState.pieces / Math.max(1, getMaxPieces()) * 100}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="h-full bg-gradient-to-r from-green-600 to-green-400 relative z-20 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                            {/* Player Frozen pulsing overlay */}
                            {combatFx.playerFrozen && (
                              <motion.div 
                                className="absolute inset-0 bg-cyan-500/20 z-40 pointer-events-none"
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              />
                            )}
                          </div>
                        </div>
                        <span className="text-[7px] sm:text-[9px] font-black text-white/80 font-mono uppercase tracking-tighter whitespace-nowrap">{gameState.pieces}/{getMaxPieces()}</span>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                      <div className="flex-1 parchment-bg rounded-none border-4 border-[#8a7a60] relative overflow-hidden">
                        {LOC[gameState.currentLocation]?.isTown ? (
                          /* City: image IS the parchment content, NPCs over it */
                          <div className="relative w-full" style={{ minHeight: '100%' }}>
                            <img 
                              src={LOC[gameState.currentLocation]?.bgImage || '/game/locations/ciudad-bg.png'} 
                              alt="Ciudad" 
                              className="w-full h-full object-cover min-h-[400px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0c14]/15 via-transparent to-[#0e0c14]/30" />
                            
                            {/* NPCs spread across the image with parchment tooltips */}
                            {(() => {
                              const locData = LOC[gameState.currentLocation];
                              if (!locData?.npcs) return null;
                              const positions = locData.npcPositions || {};
                              const icons = locData.npcIcons || {};
                              return locData.npcs.map((npcName: string) => {
                                const pos = positions[npcName] || { top: '50%', left: '50%' };
                                const iconSrc = icons[npcName];
                                const style: React.CSSProperties = {};
                                if (pos.top) style.top = pos.top;
                                if (pos.bottom) style.bottom = pos.bottom;
                                if (pos.left) style.left = pos.left;
                                if (pos.right) style.right = pos.right;
                                
                                return (
                                  <div
                                    key={npcName}
                                    className="absolute group -translate-x-1/2 -translate-y-1/2"
                                    style={style}
                                  >
                                    <button
                                      onClick={() => handleNpcClick(npcName)}
                                      className="transition-all hover:scale-125 active:scale-95"
                                    >
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#8a7a60]/60 overflow-hidden shadow-[0_0_12px_rgba(138,122,96,0.4)] group-hover:border-[#8a7a60] group-hover:shadow-[0_0_20px_rgba(138,122,96,0.7)] transition-all bg-[#1a1428]/50">
                                        {iconSrc ? (
                                          <img src={iconSrc} alt={npcName} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                        )}
                                      </div>
                                    </button>
                                    {/* Parchment-style tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-[#d4c4a0] border border-[#8a7a60] text-[#5a4020] text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-50">
                                      {npcName}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        ) : LOC[gameState.currentLocation]?.bgImage && !gameState.storyFlags.inDungeon ? (
                          /* Forest/Zone with background image + interactive elements */
                          <div className="relative w-full" style={{ minHeight: '100%' }}>
                            <img 
                              src={LOC[gameState.currentLocation]?.bgImage} 
                              alt={LOC[gameState.currentLocation]?.name} 
                              className="w-full h-full object-cover min-h-[400px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0c14]/20 via-transparent to-[#0e0c14]/40" />
                            {/* Animated fog layer */}
                            <div className="absolute bottom-0 left-0 w-[200%] h-1/3 bg-gradient-to-t from-[#0a1408]/60 to-transparent opacity-40 blur-md animate-[driftFog_40s_linear_infinite] pointer-events-none" />
                            
                            {/* Interactive elements positioned on the image */}
                            {(() => {
                              const locData = LOC[gameState.currentLocation];
                              const positions = locData?.interactPositions || {};
                              const icons = locData?.interactIcons || {};
                              
                              // NPC elements (Rattlebones etc.)
                              const npcElements = (locData?.npcs || []).map((npcName: string) => {
                                const pos = positions[npcName] || { top: '50%', left: '50%' };
                                const iconSrc = icons[npcName];
                                const style: React.CSSProperties = {};
                                if (pos.top) style.top = pos.top;
                                if (pos.bottom) style.bottom = pos.bottom;
                                if (pos.left) style.left = pos.left;
                                if (pos.right) style.right = pos.right;
                                return (
                                  <div key={npcName} className="absolute group -translate-x-1/2 -translate-y-1/2" style={style}>
                                    <button onClick={() => handleNpcClick(npcName)} className="transition-all hover:scale-125 active:scale-95">
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#8a7a60]/60 overflow-hidden shadow-[0_0_12px_rgba(138,122,96,0.4)] group-hover:border-[#8a7a60] group-hover:shadow-[0_0_20px_rgba(138,122,96,0.7)] transition-all bg-[#1a1428]/50">
                                        {iconSrc ? <img src={iconSrc} alt={npcName} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                                      </div>
                                    </button>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-[#d4c4a0] border border-[#8a7a60] text-[#5a4020] text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-50">
                                      {npcName}
                                    </div>
                                  </div>
                                );
                              });

                              // Action elements
                              const actionElements: { key: string; label: string; action: () => void; show?: boolean }[] = [
                                { key: 'explorar', label: 'Explorar', action: () => { const e = locData.enemies[Math.floor(Math.random() * locData.enemies.length)]; startCombat(e); } },
                                { key: 'jefe', label: locData.boss || 'Jefe', action: () => { if (locData.boss) startCombat(locData.boss, true); }, show: !!locData.boss },
                                { key: 'mazmorra', label: 'Mazmorra', action: enterDungeon },
                                { key: 'viajar', label: 'Viajar', action: () => setActivePanel('map') },
                              ];

                              const actionBtns = actionElements.filter(a => a.show !== false).map(a => {
                                const pos = positions[a.key] || { top: '50%', left: '50%' };
                                const iconSrc = icons[a.key];
                                const style: React.CSSProperties = {};
                                if (pos.top) style.top = pos.top;
                                if (pos.bottom) style.bottom = pos.bottom;
                                if (pos.left) style.left = pos.left;
                                if (pos.right) style.right = pos.right;
                                return (
                                  <div key={a.key} className="absolute group -translate-x-1/2 -translate-y-1/2" style={style}>
                                    <button onClick={a.action} className="transition-all hover:scale-125 active:scale-95">
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#8a7a60]/60 overflow-hidden shadow-[0_0_12px_rgba(138,122,96,0.4)] group-hover:border-[#8a7a60] group-hover:shadow-[0_0_20px_rgba(138,122,96,0.7)] transition-all bg-[#1a1428]/50">
                                        {iconSrc ? <img src={iconSrc} alt={a.label} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-2xl">⚡</div>}
                                      </div>
                                    </button>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-[#d4c4a0] border border-[#8a7a60] text-[#5a4020] text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-50">
                                      {a.label}
                                    </div>
                                  </div>
                                );
                              });

                              return [...npcElements, ...actionBtns];
                            })()}
                          </div>
                        ) : (
                          /* Dungeon: parchment with text content */
                          <div className="relative flex flex-col h-full">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>
                            <div className="relative z-10 font-display text-lg leading-relaxed story-container overflow-y-auto pr-4 custom-scrollbar flex-1 p-8" ref={storyWindowRef}>
                              <h2 className="font-black text-2xl mb-4 text-[#5a4020] uppercase tracking-tighter border-b border-[#8a7a60] pb-2">
                                {gameState.storyFlags.inDungeon ? `🏰 Mazmorra: Sala ${gameState.dungeon?.currentRoom! + 1}/${gameState.dungeon?.depth}` : gameState.currentLocation}
                              </h2>
                              {gameState.storyFlags.inDungeon ? (
                                <div className="space-y-4">
                                   <p className="text-[#5a4020]">Estás en lo profundo de una estructura antigua. El aire es pesado y frío.</p>
                                   <div className="bg-black/5 p-4 border border-[#8a7a60]/30 italic text-sm text-[#5a4020]">
                                      {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'combat' && "⚠️ Escuchas ruidos metálicos más adelante... prepárate para luchar."}
                                      {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'rest' && "🕯️ Encuentras una zona tranquila con una hoguera tenue. Puedes descansar."}
                                      {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'treasure' && "✨ ¡Un cofre medio enterrado brilla entre los escombros!"}
                                      {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'boss' && "🔥 Una presencia abrumadora bloquea la salida principal. El jefe final te espera."}
                                   </div>
                                </div>
                              ) : (
                                <>
                                  <p className="mb-4">{LOC[gameState.currentLocation]?.description}</p>
                                  <p className="italic text-[#5a4020] border-l-4 border-[#8a7a60] pl-4 my-6 py-1 bg-black/5">"{LOC[gameState.currentLocation]?.comedyLine}"</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {!LOC[gameState.currentLocation]?.isTown && (LOC[gameState.currentLocation]?.bgImage ? gameState.storyFlags.inDungeon : true) && (
                      <div className="h-48 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {gameState.storyFlags.inDungeon ? (
                          <>
                            {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'combat' && (
                              <GeometricCombatButton onClick={() => {
                                const l = LOC[gameState.currentLocation];
                                const e = l.enemies[Math.floor(Math.random() * l.enemies.length)];
                                startCombat(e);
                              }} icon="⚔️" label="Luchar" cost="SALA COMBATE" variant="danger" />
                            )}
                            {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'rest' && (
                              <GeometricCombatButton onClick={() => {
                                setGameState(prev => ({ ...prev, pieces: Math.min(prev.maxPieces, prev.pieces + Math.floor(prev.maxPieces * 0.3)) }));
                                showToast("Descanso: +30% piezas", "success");
                                playSound('heal');
                                nextDungeonRoom();
                              }} icon="🕯️" label="Descansar" cost="RECUPERACIÓN" variant="blue" />
                            )}
                            {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'treasure' && (
                              <GeometricCombatButton onClick={() => {
                                const shards = 40 + Math.floor(Math.random() * 60);
                                setGameState(prev => ({ ...prev, resources: { ...prev.resources, shards: prev.resources.shards + shards }}));
                                showToast(`¡Tesoro: +${shards}💎!`, "success");
                                playSound('click');
                                nextDungeonRoom();
                              }} icon="💎" label="Saquear" cost="TESORO" variant="primary" />
                            )}
                            {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'boss' && (
                              <GeometricCombatButton onClick={() => {
                                const loc = LOC[gameState.currentLocation];
                                if (loc.boss) {
                                  const bossEnm = ENM[loc.boss];
                                  const isForestDungeon = gameState.currentLocation === "🌲 Bosque";
                                  const overrides = isForestDungeon
                                    ? { hp: Math.floor((bossEnm?.hp || 150) * 2), attack: Math.floor((bossEnm?.attack || 14) * 2), dungeonBoss: true }
                                    : null;
                                  startCombat(loc.boss, true, overrides);
                                } else {
                                  startCombat("Guardián de Mazmorra", true, { hp: 200, attack: 20, reward: { shards: 150 } });
                                }
                              }} icon="👹" label="JEFE FINAL" cost="ÚLTIMA SALA" variant="danger" />
                            )}
                            
                            {/* Evadir: not available in forest dungeon */}
                            {gameState.dungeon?.rooms[gameState.dungeon.currentRoom].type === 'combat' && gameState.currentLocation !== "🌲 Bosque" && (
                               <GeometricCombatButton onClick={nextDungeonRoom} icon="🏃" label="Evadir" cost="SIGUIENTE SALA" variant="blue" />
                            )}
                          </>
                        ) : (
                          <>
                            <GeometricCombatButton 
                              onClick={() => {
                                const l = LOC[gameState.currentLocation];
                                const e = l.enemies[Math.floor(Math.random() * l.enemies.length)];
                                startCombat(e);
                              }} 
                              icon="🔍" 
                              label="Explorar" 
                              cost="LUCHA" 
                              variant="primary" 
                            />
                            <GeometricCombatButton onClick={enterDungeon} icon="🏰" label="Mazmorra" cost="AVENTURA" variant="danger" />
                            {LOC[gameState.currentLocation]?.boss && (
                              <GeometricCombatButton 
                                onClick={() => startCombat(LOC[gameState.currentLocation].boss, true)} 
                                icon="💀" 
                                label="JEFE" 
                                cost={LOC[gameState.currentLocation].boss} 
                                variant="danger" 
                              />
                            )}
                            {gameState.activeQuests.filter(q => q.location === gameState.currentLocation && q.boss && !gameState.defeatedBosses.includes(q.boss)).map(q => (
                              <GeometricCombatButton 
                                key={q.id}
                                onClick={() => startCombat(q.boss, true, (QB as any)[q.boss])} 
                                icon="💀" 
                                label="Misi." 
                                cost={q.boss} 
                                variant="danger" 
                              />
                            ))}
                            <GeometricCombatButton onClick={() => travelTo("🏙️ Ciudad")} icon="🏘️" label="Ciudad" cost="VOLVER" variant="primary" />
                          </>
                        )}
                      </div>
                      )}
                    </div>

                    <aside className="hidden lg:flex w-72 flex-col gap-4 overflow-hidden">
                      <div className="bg-bg-card border-2 border-border rounded-none p-5 shadow-2xl flex flex-col overflow-hidden">
                        <h3 className="text-accent font-display text-lg mb-4 border-b border-border pb-2 uppercase tracking-tighter">Estado Óseo</h3>
                        <div className="space-y-4">
                          <StatRow label="Ataque" value={`+${getAttack()}`} tooltip={`Base 8 + Equipo`} />
                          <StatRow label="Defensa" value={`+${getDefense()}`} tooltip={`Base 2 + Equipo`} />
                          <StatRow label="Crítico" value={`${getCrit()}%`} tooltip="Base 5% + Equipo" />
                        </div>

                        <div className="mt-8 flex-1">
                          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">Equipo Activo</h4>
                          <div className="grid grid-cols-2 gap-2">
                             <EquipmentSlot item={gameState.equipment.head} title="Cabeza" />
                             <EquipmentSlot item={gameState.equipment.torso} title="Torso" />
                             <EquipmentSlot item={gameState.equipment.arms} title="Brazos" />
                             <EquipmentSlot item={gameState.equipment.legs} title="Piernas" />
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}
              </div>
            </main>

            <footer className="relative z-[2] h-14 flex border-t-2 border-[#8a7a60]" style={{ backgroundColor: '#1a1408', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 5h1v1H1V5zm2-2h1v1H3V3zm2-2h1v1H5V1z\' fill=\'%23000000\' fill-opacity=\'0.15\'/%3E%3C/svg%3E")', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)' }}>
               <div className="flex-1 flex">
                  <FooterNavItem label="Inventario" iconSrc="/game/ui/icon-inventario.png" onClick={() => { playSound('page'); !isCombat && setActivePanel('inventory'); }} />
                  <FooterNavItem label="Skills" iconSrc="/game/ui/icon-skills.png" onClick={() => { playSound('page'); setActivePanel('skills'); }} />
                  <FooterNavItem label="Bestiario" iconSrc="/game/ui/icon-bestiario.png" onClick={() => { playSound('page'); setActivePanel('bestiary'); }} />
                  <FooterNavItem label="Misiones" iconSrc="/game/ui/icon-misiones.png" onClick={() => { playSound('page'); setActivePanel('quests'); }} />
               </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePanel(null)} className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ y: -600 }} animate={{ y: 0 }} exit={{ y: -600 }} className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] parchment-panel border-x-4 border-b-4 border-[#8a7a60] z-[101] shadow-2xl">
              <div className="bg-[#b8a888] p-4 flex justify-between items-center border-b-2 border-[#8a7a60]">
                <h3 className="font-display text-[#5a3a10] font-black uppercase text-lg">{activePanel}</h3>
                <button onClick={() => setActivePanel(null)} className="p-1 hover:bg-red-900/30 rounded-none text-[#5a3a10] hover:text-red-800 border border-transparent hover:border-red-800/50 transition-all"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {activePanel === 'inventory' && <InventoryContent state={gameState} getMaxPieces={getMaxPieces} getAttack={getAttack} getDefense={getDefense} getCrit={getCrit} onUse={(id: string) => {
                  if (id === 'potion') usePotion();
                }} onEquipConsumable={(slotIndex: 0 | 1, itemId: string) => equipConsumable(slotIndex, itemId)} onEquip={(invItem: InventoryItem) => {
                  const data = getItemData(invItem.id);
                  if (!data) return;
                  const s = data.slot;
                  setGameState(prev => {
                    const newInv = [...prev.inventory];
                    const prevEq = (prev.equipment as any)[s] as EquipSlot | null;
                    // Unequip previous: put it back in inventory
                    if (prevEq) newInv.push({ id: prevEq.id, rarity: prevEq.rarity, skillRarities: prevEq.skillRarities || {} });
                    // Remove equipped item from inventory
                    const invIdx = newInv.findIndex(i => i.id === invItem.id && i.rarity === invItem.rarity);
                    if (invIdx >= 0) newInv.splice(invIdx, 1);
                    return { ...prev, equipment: { ...prev.equipment, [s]: { id: invItem.id, putrefaccion: data.maxPutrefaccion || 20, rarity: invItem.rarity, skillRarities: invItem.skillRarities || {} } }, inventory: newInv };
                  });
                  playSound('equip');
                }} onUnequip={(slot: string) => {
                  setGameState(prev => {
                    const eq = (prev.equipment as any)[slot] as EquipSlot | null;
                    if (!eq) return prev;
                    const newInv = [...prev.inventory, { id: eq.id, rarity: eq.rarity, skillRarities: eq.skillRarities || {} }];
                    return { ...prev, equipment: { ...prev.equipment, [slot]: null }, inventory: newInv };
                  });
                  playSound('click');
                }} />}
                {activePanel === 'quests' && <QuestsContent state={gameState} />}
                {activePanel === 'skills' && <SkillsContent state={gameState} onUpgrade={(skillId: string) => {
                  // Skill tree upgrade handler (tree removed, placeholder)
                }} />}
                {activePanel === 'bestiary' && <BestiaryContent state={gameState} setGameState={setGameState} showToast={showToast} />}
                {activePanel === 'lore' && <LoreContent state={gameState} />}
                {activePanel === 'shop' && <ShopContent state={gameState} setGameState={setGameState} playSound={playSound} />}
                {activePanel === 'forge' && <ForgeContent state={gameState} setGameState={setGameState} playSound={playSound} showToast={showToast} />}
                {activePanel === 'options' && <OptionsContent onReset={() => { 
                  localStorage.removeItem('barnaby_save'); 
                  localStorage.removeItem('barnaby_started');
                  location.reload(); 
                }} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] flex flex-col-reverse gap-2 w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`px-4 py-3 parchment-panel border-2 border-[#8a7a60] border-l-4 shadow-2xl text-[10px] font-black uppercase tracking-widest ${t.type === 'success' ? 'border-l-green-700' : t.type === 'error' ? 'border-l-red-700' : 'border-l-blue-700'}`}>
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {floatingNumbers.map(f => (
        <motion.div key={f.id} initial={{ opacity: 1, y: 0, x: `${f.x}%`, top: `${f.y}%` }} animate={{ opacity: 0, y: -120 }} className={`absolute z-[1000] font-black font-display pointer-events-none ${f.type === 'damage' ? 'text-danger text-3xl' : f.type === 'heal' ? 'text-green-400 text-2xl' : f.type === 'crit' ? 'text-accent text-4xl' : 'text-blue-400 text-2xl'}`}>
          {f.val}
        </motion.div>
      ))}

      <AnimatePresence>
        {npcDialog && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNpcDialog(null)} className="absolute inset-0 bg-black/90" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-[400px] parchment-bg border-b-8 border-r-8 border-[#8a7a60] p-8 shadow-2xl">
                <div className="absolute top-2 right-4 text-[#5a4020]/20 font-display font-black text-4xl">"</div>
                {/* Info button */}
                {npcDialog.info && (
                  <button 
                    onClick={() => setShowNpcInfo(prev => !prev)}
                    className="absolute top-3 left-3 w-8 h-8 bg-[#5a4020]/10 hover:bg-[#5a4020]/20 border border-[#8a7a60]/40 rounded-full flex items-center justify-center text-[#5a4020] text-sm font-black z-10 transition-colors"
                  >
                    ℹ️
                  </button>
                )}
                <h3 className="text-[#5a4020] font-display font-black text-xl mb-4 uppercase border-b-2 border-[#8a7a60]/30 pb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#5a4020] rounded-full" />
                  {npcDialog.name}
                </h3>
                <div className="relative">
                  <p className="text-[#5a4020] italic mb-4 font-serif text-lg leading-relaxed whitespace-pre-wrap relative z-10">{npcDialog.text}</p>
                </div>
                {/* NPC Info Panel */}
                <AnimatePresence>
                  {showNpcInfo && npcDialog.info && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="bg-[#5a4020]/10 border border-[#8a7a60]/30 p-4">
                        <p className="text-[#5a4020] text-sm leading-relaxed whitespace-pre-wrap">{npcDialog.info}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="grid grid-cols-1 gap-3">
                  {npcDialog.options.map((opt: any, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={opt.action}
                      className="w-full py-4 bg-[#5a4020] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-colors border border-black/10 shadow-lg active:translate-y-1 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ TRAVEL EVENT MODAL ═══ */}
      <AnimatePresence>
        {travelEvent && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTravelEvent(null)} className="absolute inset-0 bg-black/90" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-[420px] parchment-bg border-b-8 border-r-8 border-[#8a7a60] p-6 shadow-2xl">
              <div className="absolute top-1 left-3 text-[#5a4020]/15 font-display font-black text-5xl">⚔</div>
              <h3 className="text-[#5a4020] font-display font-black text-xl mb-2 uppercase border-b-2 border-[#8a7a60]/30 pb-2 flex items-center gap-2">
                {travelEvent.title}
              </h3>
              <div className="mb-6">
                <p className="text-[#5a4020] italic text-sm leading-relaxed">{travelEvent.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {travelEvent.options.map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNpcDialog({
                        name: travelEvent.title,
                        text: opt.outcome.text,
                        options: [{ label: 'Continuar', action: () => { setNpcDialog(null); applyTravelEventEffect(opt.outcome.effect); } }],
                      });
                      setTravelEvent(null);
                    }}
                    className="w-full py-3 px-4 bg-[#5a4020] text-white font-black text-[9px] uppercase tracking-[0.15em] hover:bg-black transition-colors border border-black/10 shadow-lg active:translate-y-0.5 text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel === 'map' && (
          <MapContent state={gameState} onTravel={travelTo} onClose={() => setActivePanel(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/95" 
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }} 
              animate={{ scale: 1, opacity: 1, rotate: 0 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="relative w-full max-w-[400px] bg-bg-main border-x-2 border-accent p-10 shadow-glow text-center border-b-8 border-accent"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-6 bg-bg-main border-2 border-accent rounded-full shadow-glow">
                <Skull size={48} className="text-danger animate-pulse" />
              </div>
              <h2 className="text-3xl font-display font-black text-accent mt-6 mb-6 uppercase tracking-tighter shadow-text">{modal.title}</h2>
              <p className="text-text-secondary text-sm mb-10 leading-[1.8] italic font-mono px-4">{modal.msg}</p>
              <button 
                onClick={modal.onConfirm}
                className="w-full py-5 bg-accent text-bg-deep font-black text-xl uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-glow"
              >
                Aceptar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
