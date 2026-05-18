/**
 * Pure TypeScript combat engine — no React, no hooks, no side effects.
 * All functions take state as input and return plain objects describing
 * state changes. The React component calls these and applies the results.
 */

import {
  TDB, ENM, getItemData, rollRarity, scaleStat,
  RARITY_CONFIG, SKILL_RARITY_MULTIPLIER, getZoneMaxRarityIndex,
  QST, LOC,
} from '../data';
import {
  Rarity, Technique, EnemyData,
} from '../data/types';
import {
  GameState, CombatFx, LogEntry, InventoryItem, EquipSlot,
} from '../types';

// ═══════════════════════════════════════════
// ENEMY INTENT TYPE
// ═══════════════════════════════════════════

export interface EnemyIntent {
  type: string;
  value: number;
  icon: string;
  text: string;
  skillId?: string;
  skillData?: Technique;
  isMasterSkill?: boolean;
}

// ═══════════════════════════════════════════
// PRE-ROLLED DROP TYPE
// ═══════════════════════════════════════════

export interface PreRolledDrop {
  itemName: string;
  itemRarity: Rarity;
  skillRarities: Record<string, Rarity>;
  partStats: Record<string, number>;
}

// ═══════════════════════════════════════════
// COMBAT STATE (react-side state snapshot)
// ═══════════════════════════════════════════

export interface CombatState {
  enemy: any;            // the scaled enemy data object
  enemyHp: number;
  enemyMaxHp: number;
  enemyIntent: EnemyIntent;
  isPlayerTurn: boolean;
  combatFx: CombatFx;
  enemyTurnCount: number;
  firstAttackDone: boolean;
  masterSkillUsed: boolean;
  preRolledDrop: PreRolledDrop | null;
  combatLog: LogEntry[];
  playerStunCount: number; // tracks cumulative stun count for resistance
}

// ═══════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════

export interface StartCombatResult {
  enemy: any;
  enemyHp: number;
  enemyMaxHp: number;
  enemyIntent: EnemyIntent;
  isPlayerTurn: boolean;
  combatLog: LogEntry[];
  combatFx: CombatFx;
  preRolledDrop: PreRolledDrop | null;
  playerFirst: boolean;
}

export interface ExecutePlayerActionResult {
  newEnemyHp: number;
  damage: number;
  isCrit: boolean;
  combatLog: LogEntry[];
  combatFx: Partial<CombatFx>;
  newGameState: Partial<GameState>;
  enemyDefeated: boolean;
  nextEnemyIntent: EnemyIntent | null;
  /** VFX hints for the UI layer */
  vfx: PlayerActionVfx[];
}

export interface PlayerActionVfx {
  type: string;
  target: 'player' | 'enemy';
}

export interface ExecuteEnemyTurnResult {
  newEnemyHp: number;
  newPlayerHp: number;
  damage: number;
  combatLog: LogEntry[];
  combatFx: Partial<CombatFx>;
  newGameState: Partial<GameState>;
  /** if true, enemy died from bleed/poison tick */
  enemyDied: boolean;
  /** if true, player is frozen → enemy gets another turn */
  playerFrozen: boolean;
  /** if playerFrozen, this is the next intent for the follow-up turn */
  nextIntent: EnemyIntent | null;
  /** the intent for the normal next enemy turn (when player unfreezes) */
  futureIntent: EnemyIntent | null;
  /** VFX hints for the UI layer */
  vfx: EnemyTurnVfx[];
}

export interface EnemyTurnVfx {
  type: string;
  target: 'player' | 'enemy';
}

export interface CalculateCombatRewardsResult {
  shards: number;
  lootItems: InventoryItem[];
  bonusLootItems: InventoryItem[];
  newInventory: InventoryItem[];
  newBestiary: Record<string, { kills: number; dropsFound: string[] }>;
  newQuestProgress: Record<string, number>;
  newDefeatedBosses: string[];
  newResources: Partial<GameState['resources']>;
  newWins: number;
}

// ═══════════════════════════════════════════
// STAT CALCULATION FUNCTIONS (pure)
// ═══════════════════════════════════════════

export function getActiveSets(equipment: Record<string, EquipSlot | null>): Record<string, number> {
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

export function getMaxPieces(state: GameState): number {
  let bonus = 0;
  const sets = getActiveSets(state.equipment);

  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)?.stats?.maxPieces) bonus += getItemData(eq.id).stats.maxPieces;
  });
  return state.maxPieces + bonus;
}

export function getAttack(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.attack || 0;
  });
  return 3 + bonus;
}

export function getDefense(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.defense || 0;
  });
  return 3 + bonus;
}

export function getMagic(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.magic || 0;
  });
  return 3 + bonus;
}

export function getMagicRes(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.magicRes || 0;
  });
  return 3 + bonus;
}

export function getCrit(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.crit || 0;
  });
  return state.resources.crit + bonus;
}

export function getSpeed(state: GameState): number {
  let bonus = 0;
  (Object.values(state.equipment) as (EquipSlot | null)[]).forEach(eq => {
    if (eq && getItemData(eq.id)) bonus += getItemData(eq.id).stats?.speed || 0;
  });
  return 3 + bonus;
}

export function getEquippedSkills(equipment: Record<string, EquipSlot | null>): string[] {
  const { head, torso, arms, legs } = equipment;
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
}

export function findSkillSlot(equipment: Record<string, EquipSlot | null>, skillId: string): string | null {
  const { head, torso, arms, legs } = equipment;

  if (head && head.id) {
    const data = getItemData(head.id);
    if (data?.skillIds?.includes(skillId)) return 'head';
  }
  if (torso && torso.id) {
    const data = getItemData(torso.id);
    if (data?.skillIds?.includes(skillId)) return 'torso';
  }
  if (arms && arms.id) {
    const data = getItemData(arms.id);
    if (data?.skillIds?.includes(skillId)) return 'arms';
  }
  if (legs && legs.id) {
    const data = getItemData(legs.id);
    if (data?.skillIds?.includes(skillId)) return 'legs';
  }

  // Innate skills (no item equipped)
  if (skillId === "💀 Cabezazo Barnaby") return 'head';
  if (skillId === "🛡️ Costillas Enrejadas") return 'torso';
  if (skillId === "🦾 Puño Óseo") return 'arms';
  if (skillId === "👻 Voluntad Post-Mortem") return 'legs';

  return null;
}

// ═══════════════════════════════════════════
// ENEMY INTENT CALCULATION (pure)
// ═══════════════════════════════════════════

export function calculateEnemyIntent(
  enemyData: any,
  turn: number,
  defense: number,
  currentEnemyHp?: number,
  currentEnemyMaxHp?: number,
  isMasterUsed?: boolean,
  preRolledDrop?: PreRolledDrop | null,
): EnemyIntent {
  const pattern = enemyData.intentPattern || ["attack"];
  const masterSkillId = enemyData.masterSkill;
  const masterSkillRef = masterSkillId ? TDB[masterSkillId] : null;

  // Master skill triggers when enemy HP <= 30% and hasn't been used yet
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

    let estimatedDmg = Math.max(1, Math.floor(skillDmg * (0.85 + Math.random() * 0.3)) - Math.floor(defense * 0.5));
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
      isMasterSkill: !!isMasterSkill,
    };
  }

  // Fallback: legacy pattern types (attack, heavy, buff, defend)
  const baseAtk = enemyData.attack;
  let estimatedDmg = Math.max(1, Math.floor(baseAtk * (0.85 + Math.random() * 0.3)) - defense);
  estimatedDmg = Math.max(Math.floor(baseAtk * 0.25), estimatedDmg);

  switch (intentType) {
    case "attack": return { type: "attack", value: estimatedDmg, icon: "⚔️", text: `Ataque <strong>${estimatedDmg}</strong>` };
    case "heavy": {
      const hd = Math.floor(estimatedDmg * 1.5);
      return { type: "attack", value: hd, icon: "💥", text: `Fuerte <strong>${hd}</strong>` };
    }
    case "buff": return { type: "buff", value: 0, icon: "💪", text: `<strong>Se fortalece</strong>` };
    case "defend": return { type: "defend", value: 0, icon: "🛡️", text: `<strong>Se prepara</strong>` };
    default: return { type: "attack", value: estimatedDmg, icon: "⚔️", text: `Ataque <strong>${estimatedDmg}</strong>` };
  }
}

// ═══════════════════════════════════════════
// START COMBAT (pure)
// ═══════════════════════════════════════════

export function startCombat(args: {
  enemyName: string;
  isBoss?: boolean;
  overrides?: any;
  gameState: GameState;
}): StartCombatResult | null {
  const { enemyName, isBoss = false, overrides = null, gameState } = args;

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
    return null; // Unknown enemy with no data
  }

  // Bestiary scaling: +10% per kill, cumulative, capped at +100% (10 kills)
  const kills = gameState.bestiary?.[enemyName]?.kills || 0;
  const bestMult = 1 + Math.min(kills * 0.1, 1.0);

  // ═══ COMBAT BALANCE SCALING ═══
  // These multipliers ensure fights last 5-8 turns, making buffs/debuffs/strategy matter
  const BALANCE_HP_MULT = enemyData.isBoss ? 2.0 : 2.2;
  const BALANCE_ATK_MULT = enemyData.isBoss ? 1.4 : 1.5;
  const BALANCE_DEF_MULT = 1.3;

  enemyData.hp = Math.floor(enemyData.hp * bestMult * BALANCE_HP_MULT);
  enemyData.attack = Math.floor(enemyData.attack * bestMult * BALANCE_ATK_MULT);
  enemyData.defense = Math.floor((enemyData.defense || 0) * bestMult * BALANCE_DEF_MULT);

  // ═══ PRE-ROLL DROP ═══
  const zoneName = gameState.currentLocation;
  const zoneMaxRarityIdx = getZoneMaxRarityIndex(zoneName);

  // Pre-roll: combatRarity for enemy stats + skills DURING combat (independent of drop)
  const partNames: string[] = (ENM[enemyName] as any)?.parts?.map((p: any) => p.name) || [];
  const combatRarity = rollRarity(zoneMaxRarityIdx);

  // Apply ALL enemy parts' stats scaled by combatRarity
  for (const partName of partNames) {
    const partData = getItemData(partName);
    if (partData && partData.stats) {
      const listedRarity = (partData.rarity || 'comun') as Rarity;
      for (const [stat, val] of Object.entries(partData.stats)) {
        const scaled = scaleStat(val as number, listedRarity, combatRarity);
        if (stat === 'attack') enemyData.attack = (enemyData.attack || 0) + scaled;
        else if (stat === 'defense') enemyData.defense = (enemyData.defense || 0) + scaled;
        else if (stat === 'magic') enemyData.magic = (enemyData.magic || 0) + scaled;
        else if (stat === 'magicRes') enemyData.magicRes = (enemyData.magicRes || 0) + scaled;
        else if (stat === 'speed') enemyData.speed = (enemyData.speed || 0) + scaled;
        else if (stat === 'crit') enemyData.crit = (enemyData.crit || 0) + scaled;
      }
    }
  }

  // Apply combatRarity to ALL enemy skills (combat only)
  const combatSkillRarities: Record<string, Rarity> = {};
  for (const partName of partNames) {
    const partData = getItemData(partName);
    if (partData?.skillIds) {
      partData.skillIds.forEach((skId: string) => { combatSkillRarities[skId] = combatRarity; });
    }
  }
  if (Object.keys(combatSkillRarities).length > 0) enemyData._skillRarities = combatSkillRarities;

  // Pre-roll drop: SEPARATE rolls for part rarity and skill rarity
  let preRoll: PreRolledDrop | null = null;
  if (partNames.length > 0) {
    const dropPartName = partNames[Math.floor(Math.random() * partNames.length)];
    const dropPartRarity = rollRarity(zoneMaxRarityIdx);
    const dropSkillRarity = rollRarity(zoneMaxRarityIdx);
    // Build skill rarities for the drop using dropSkillRarity
    const dropSkillRarities: Record<string, Rarity> = {};
    const dropPartData = getItemData(dropPartName);
    if (dropPartData?.skillIds) {
      dropPartData.skillIds.forEach((skId: string) => { dropSkillRarities[skId] = dropSkillRarity; });
    }
    preRoll = { itemName: dropPartName, itemRarity: dropPartRarity, skillRarities: dropSkillRarities, partStats: {} };
  }

  const playerSpeed = getSpeed(gameState);
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

  const defense = getDefense(gameState);
  const enemyIntent = calculateEnemyIntent(enemyData, 0, defense, enemyData.hp, enemyData.hp, false, preRoll);

  return {
    enemy: enemyData,
    enemyHp: enemyData.hp,
    enemyMaxHp: enemyData.hp,
    enemyIntent,
    isPlayerTurn: playerFirst,
    combatLog: logs,
    combatFx: {
      enemyBleed: 0, enemyBleedTurns: 0, enemyPoison: 0, enemyPoisonTurns: 0,
      enemyFrozen: false, enemyDebuff: false, enemyDebuffTurns: 0,
      enemyFury: false, enemyFuryTurns: 0, enemyShield: false, enemyShieldValue: 0,
      playerShield: false, playerGuard: false,
      playerPoison: false, playerPoisonTurns: 0, playerPoisonDmg: 0,
      playerBleed: false, playerBleedTurns: 0, playerBleedDmg: 0,
      playerDebuff: false, playerDebuffTurns: 0,
      playerFrozen: false, playerStunCount: 0,
    },
    preRolledDrop: preRoll,
    playerFirst,
  };
}

// ═══════════════════════════════════════════
// EXECUTE PLAYER ACTION (pure)
// ═══════════════════════════════════════════

export function executePlayerAction(args: {
  skillId: string;
  gameState: GameState;
  combatState: CombatState;
}): ExecutePlayerActionResult {
  const { skillId, gameState, combatState } = args;

  const tech = TDB[skillId];
  if (!tech) {
    return {
      newEnemyHp: combatState.enemyHp,
      damage: 0,
      isCrit: false,
      combatLog: [],
      combatFx: {},
      newGameState: {},
      enemyDefeated: false,
      nextEnemyIntent: null,
      vfx: [],
    };
  }

  const isPhys = tech.type === 'basic' || tech.type === 'bleed' || tech.type === 'steal';
  const cost = tech.cost || 0;

  const log: LogEntry[] = [];
  const vfx: PlayerActionVfx[] = [];
  const fxUpdates: Partial<CombatFx> = {};
  const gsUpdates: Partial<GameState> = {};

  // Deduct cost
  const piecesAfterCost = gameState.pieces - cost;

  // Detonacion Osea / Barrera Costillas: reduce maxPieces
  let maxPiecesOverride: number | undefined;
  if (tech.name === "Detonacion Osea") {
    maxPiecesOverride = Math.max(50, gameState.maxPieces - 20);
  }
  if (tech.name === "Barrera Costillas") {
    maxPiecesOverride = Math.max(50, gameState.maxPieces - 15);
  }

  let dmg = tech.damage + (isPhys ? getAttack(gameState) : Math.floor(getAttack(gameState) * 0.3));

  // ═══ ENEMY DEFENSE REDUCTION ═══
  // Enemy defense now reduces incoming player damage
  const enemyDef = combatState.enemy?.defense || 0;
  if (enemyDef > 0) {
    const defReduction = Math.floor(enemyDef * 0.6);
    if (defReduction > 0) {
      dmg = Math.max(1, dmg - defReduction);
    }
  }

  // Player debuff from enemy (e.g. Golpe Bajo) — 50% reduction (stronger, more punishing)
  if (combatState.combatFx.playerDebuff && combatState.combatFx.playerDebuffTurns > 0) {
    dmg = Math.floor(dmg * 0.5);
  }

  // Enemy is debuffed → player deals 30% MORE damage (strategic value for debuff skills)
  if (combatState.combatFx.enemyDebuff && combatState.combatFx.enemyDebuffTurns > 0) {
    dmg = Math.floor(dmg * 1.3);
  }

  // Enemy shield reduces player damage (e.g. Piel Brutal, Retirada Táctica)
  if (combatState.combatFx.enemyShield) {
    const reduction = combatState.combatFx.enemyShieldValue || 0.4;
    dmg = Math.floor(dmg * (1 - reduction));
    log.push({ text: `¡Escudo enemigo! Daño reducido a ${dmg}`, type: 'effect' });
  }

  // Fury effect (if active or from tech) — +60% damage (stronger buff to reward strategy)
  if (tech.fury) {
    dmg = Math.floor(dmg * 1.6);
  }

  const critChance = getCrit(gameState);
  const isCrit = Math.random() * 100 < critChance || gameState.storyFlags.nextCrit;

  if (isCrit) {
    dmg = Math.floor(dmg * 1.5);
    log.push({ text: `${tech.name}: ${dmg} CRIT!`, type: 'player' });
    vfx.push({ type: 'crit', target: 'enemy' });
    vfx.push({ type: 'shake', target: 'player' });
    vfx.push({ type: 'flash-crit', target: 'player' });
  } else {
    log.push({ text: `${tech.name}: ${dmg}`, type: 'player' });
  }

  // First attack bonus: if player goes first and this is their first attack
  if (!combatState.firstAttackDone && combatState.isPlayerTurn) {
    const pSpeed = getSpeed(gameState);
    const eSpeed = combatState.enemy?.speed || 10;
    const speedDiff = Math.max(0, pSpeed - eSpeed);
    if (speedDiff > 0) {
      dmg += speedDiff;
      log.push({ text: `⚡ Bonus velocidad: +${speedDiff} daño!`, type: 'player' });
    }
  }

  // Calculate new enemy HP
  let newEnemyHp = combatState.enemyHp;
  if (tech.multi) {
    for (let i = 1; i < tech.multi; i++) {
      log.push({ text: `Hit extra: ${Math.floor(dmg / 2)}`, type: 'player' });
    }
    newEnemyHp = Math.max(0, combatState.enemyHp - (dmg + Math.floor(dmg / 2) * (tech.multi - 1)));
  } else {
    newEnemyHp = Math.max(0, combatState.enemyHp - dmg);
  }

  // Putrefaccion degradation per skill use — only degrade the specific slot providing this skill
  const skillSlot = findSkillSlot(gameState.equipment, skillId);
  const newEquipment = { ...gameState.equipment };
  if (skillSlot) {
    const eq = (newEquipment as any)[skillSlot] as EquipSlot | null;
    if (eq) {
      const newP = Math.max(0, eq.putrefaccion - 1);
      if (newP <= 0) {
        (newEquipment as any)[skillSlot] = { ...eq, putrefaccion: 0 };
        log.push({ text: `⚠️ ¡${eq.id} no tiene más usos! Ve a reparar.`, type: 'effect' });
      } else {
        (newEquipment as any)[skillSlot] = { ...eq, putrefaccion: newP };
      }
    }
  }

  // Lifesteal
  let piecesAfterAction = piecesAfterCost;
  const maxP = maxPiecesOverride ?? getMaxPieces(gameState);
  if (tech.lifesteal) {
    const healAmt = Math.floor(dmg * tech.lifesteal);
    piecesAfterAction = Math.min(maxP, piecesAfterAction + healAmt);
    log.push({ text: `Robo de vida: +${healAmt} piezas`, type: 'effect' });
    vfx.push({ type: 'lifesteal', target: 'player' });
  }

  // Set Effect: Originality (Barnaby 4 set)
  const activeSets = getActiveSets(gameState.equipment);
  if (Object.entries(activeSets).some(([name, count]) => name === 'Barnaby' && count >= 4)) {
    piecesAfterAction = Math.min(maxP, piecesAfterAction + 2);
  }

  // Set Effect: Ráfaga (Goblin 4 set) — placeholder, no active effect here
  // (handled in the component as bonus)

  // Self Damage
  if (tech.selfDamage) {
    piecesAfterAction = Math.max(1, piecesAfterAction - tech.selfDamage);
    log.push({ text: `Singularidad: -${tech.selfDamage} piezas`, type: 'effect' as any });
  }

  // Trigger VFX based on tech type
  if (tech.type === 'bleed') vfx.push({ type: 'bleed', target: 'enemy' });
  else if (tech.type === 'defense') vfx.push({ type: 'shield', target: 'player' });
  else if (tech.type === 'ultimate' || tech.type === 'sacrifice') vfx.push({ type: 'explosion', target: 'enemy' });
  else if (tech.type === 'magic') vfx.push({ type: 'magic', target: 'enemy' });
  else if (isPhys) vfx.push({ type: 'slash', target: 'enemy' });

  // Heal
  if (tech.heal) {
    piecesAfterAction = Math.min(maxP, piecesAfterAction + tech.heal);
    vfx.push({ type: 'heal', target: 'player' });
  }

  // Freeze
  if (tech.freeze) {
    fxUpdates.enemyFrozen = true;
    vfx.push({ type: 'freeze', target: 'enemy' });
  }

  // Bleed — 4 turns (longer DOT for strategic value)
  if (tech.bleed) {
    fxUpdates.enemyBleed = tech.bleed;
    fxUpdates.enemyBleedTurns = 4;
    vfx.push({ type: 'bleed-audio', target: 'enemy' });
  }

  // Debuff — 3 turns (longer duration for strategic value)
  if (tech.debuff) {
    fxUpdates.enemyDebuff = true;
    fxUpdates.enemyDebuffTurns = 3;
    vfx.push({ type: 'debuff', target: 'enemy' });
  }

  // Shield
  if (tech.shield) {
    fxUpdates.playerShield = true;
  }

  // Decrement player debuff from enemy skills, reset enemy shield after player attacks
  const currentPlayerDebuffTurns = combatState.combatFx.playerDebuffTurns || 0;
  fxUpdates.playerDebuffTurns = Math.max(0, currentPlayerDebuffTurns - 1);
  fxUpdates.playerDebuff = currentPlayerDebuffTurns > 1 ? combatState.combatFx.playerDebuff : false;
  fxUpdates.enemyShield = false;
  fxUpdates.enemyShieldValue = 0;

  // Build game state updates
  gsUpdates.pieces = piecesAfterAction;
  gsUpdates.equipment = newEquipment;
  if (maxPiecesOverride !== undefined) {
    gsUpdates.maxPieces = maxPiecesOverride;
  }
  if (gameState.storyFlags.nextCrit && isCrit) {
    gsUpdates.storyFlags = { ...gameState.storyFlags, nextCrit: false };
  }

  const enemyDefeated = newEnemyHp <= 0;
  let nextEnemyIntent: EnemyIntent | null = null;

  if (enemyDefeated) {
    vfx.push({ type: 'death', target: 'enemy' });
  } else {
    // Calculate next enemy intent
    const defense = getDefense(gameState);
    const nextTurn = combatState.enemyTurnCount + 1;
    nextEnemyIntent = calculateEnemyIntent(
      combatState.enemy,
      nextTurn,
      defense,
      newEnemyHp,
      combatState.enemyMaxHp,
      combatState.masterSkillUsed,
      combatState.preRolledDrop,
    );
  }

  return {
    newEnemyHp,
    damage: dmg,
    isCrit,
    combatLog: log,
    combatFx: fxUpdates,
    newGameState: gsUpdates,
    enemyDefeated,
    nextEnemyIntent,
    vfx,
  };
}

// ═══════════════════════════════════════════
// EXECUTE ENEMY TURN (pure)
// ═══════════════════════════════════════════

export function executeEnemyTurn(args: {
  gameState: GameState;
  combatState: CombatState;
  overrideIntent?: EnemyIntent | null;
}): ExecuteEnemyTurnResult {
  const { gameState, combatState, overrideIntent } = args;

  const log: LogEntry[] = [];
  const vfx: EnemyTurnVfx[] = [];
  const fxUpdates: Partial<CombatFx> = {};
  const gsUpdates: Partial<GameState> = {};

  if (combatState.enemyHp <= 0) {
    return {
      newEnemyHp: combatState.enemyHp,
      newPlayerHp: gameState.pieces,
      damage: 0,
      combatLog: [],
      combatFx: {},
      newGameState: {},
      enemyDied: false,
      playerFrozen: false,
      nextIntent: null,
      futureIntent: null,
      vfx: [],
    };
  }

  // Increment turn count
  const newTurnCount = combatState.enemyTurnCount + 1;

  // Use override intent if provided (for freeze follow-up turns)
  const activeIntent = overrideIntent || combatState.enemyIntent;

  // Process status effects on enemy
  let currentEnemyBleed = combatState.combatFx.enemyBleed;
  let currentEnemyBleedTurns = combatState.combatFx.enemyBleedTurns;
  let currentEnemyPoison = combatState.combatFx.enemyPoison;
  let currentEnemyPoisonTurns = combatState.combatFx.enemyPoisonTurns;
  let currentEnemyFrozen = combatState.combatFx.enemyFrozen;
  let currentEnemyHp = combatState.enemyHp;

  if (currentEnemyBleed > 0 && currentEnemyBleedTurns > 0) {
    currentEnemyHp -= currentEnemyBleed;
    log.push({ text: `Sangrado: -${currentEnemyBleed}`, type: 'effect' });
    vfx.push({ type: 'bleed', target: 'enemy' });
    currentEnemyBleedTurns--;
  }

  if (currentEnemyPoison > 0 && currentEnemyPoisonTurns > 0) {
    currentEnemyHp -= currentEnemyPoison;
    log.push({ text: `Veneno: -${currentEnemyPoison}`, type: 'effect' });
    vfx.push({ type: 'poison', target: 'enemy' });
    currentEnemyPoisonTurns--;
  }

  // Enemy died from status effects
  if (currentEnemyHp <= 0) {
    return {
      newEnemyHp: currentEnemyHp,
      newPlayerHp: gameState.pieces,
      damage: 0,
      combatLog: log,
      combatFx: {
        ...fxUpdates,
        enemyBleedTurns: currentEnemyBleedTurns,
        enemyPoisonTurns: currentEnemyPoisonTurns,
      },
      newGameState: gsUpdates,
      enemyDied: true,
      playerFrozen: false,
      nextIntent: null,
      futureIntent: null,
      vfx,
    };
  }

  // Enemy is frozen — skips turn
  if (currentEnemyFrozen) {
    log.push({ text: "Congelado, pierde turno.", type: 'effect' });
    const defense = getDefense(gameState);
    const futureIntent = calculateEnemyIntent(
      combatState.enemy,
      newTurnCount,
      defense,
      currentEnemyHp,
      combatState.enemyMaxHp,
      combatState.masterSkillUsed,
      combatState.preRolledDrop,
    );
    return {
      newEnemyHp: currentEnemyHp,
      newPlayerHp: gameState.pieces,
      damage: 0,
      combatLog: log,
      combatFx: {
        ...fxUpdates,
        enemyFrozen: false,
        enemyBleedTurns: currentEnemyBleedTurns,
        enemyPoisonTurns: currentEnemyPoisonTurns,
      },
      newGameState: gsUpdates,
      enemyDied: false,
      playerFrozen: false,
      nextIntent: null,
      futureIntent,
      vfx,
    };
  }

  // Process player poison
  let currentPoison = combatState.combatFx.playerPoison;
  let currentPoisonTurns = combatState.combatFx.playerPoisonTurns;
  let currentPoisonDmg = combatState.combatFx.playerPoisonDmg;
  let newPlayerHp = gameState.pieces;

  if (currentPoison && currentPoisonTurns > 0) {
    log.push({ text: `Veneno: -${currentPoisonDmg} piezas`, type: 'effect' });
    vfx.push({ type: 'poison', target: 'player' });
    newPlayerHp = Math.max(0, newPlayerHp - currentPoisonDmg);
    currentPoisonTurns--;
    if (currentPoisonTurns <= 0) currentPoison = false;
  }

  // Process player bleed
  let currentBleed = combatState.combatFx.playerBleed;
  let currentBleedTurns = combatState.combatFx.playerBleedTurns;
  let currentBleedDmg = combatState.combatFx.playerBleedDmg;

  if (currentBleed && currentBleedTurns > 0) {
    log.push({ text: `Sangrado: -${currentBleedDmg} piezas`, type: 'effect' });
    vfx.push({ type: 'bleed', target: 'player' });
    newPlayerHp = Math.max(0, newPlayerHp - currentBleedDmg);
    currentBleedTurns--;
    if (currentBleedTurns <= 0) currentBleed = false;
  }

  // ─── Enemy action ───
  let dmg = activeIntent.value;
  const skillData = activeIntent.skillData;
  const skillName = skillData?.name || null;
  const skillId = activeIntent.skillId;
  // Get skill rarity multiplier for pre-rolled skill (attributes scale, effects don't)
  const enemySkillRarities = combatState.enemy?._skillRarities || combatState.preRolledDrop?.skillRarities || {};
  const skillRarity = skillId ? enemySkillRarities[skillId] : undefined;
  const sMult = skillRarity ? SKILL_RARITY_MULTIPLIER[skillRarity] : 1.0;

  // Determine if master skill was used
  const wasMasterSkill = activeIntent.isMasterSkill;
  const newMasterSkillUsed = wasMasterSkill ? true : combatState.masterSkillUsed;

  if (activeIntent.type === "buff") {
    // Enemy buff (fury/evasion) — no damage
    log.push({ text: `${combatState.enemy.name} usa ${skillName || 'Fortalecer'}!`, type: 'enemy' });
    vfx.push({ type: 'buff', target: 'enemy' });
    // Fury is an EFFECT — not scaled by skill rarity
    if (skillData?.fury) {
      fxUpdates.enemyFury = true;
      fxUpdates.enemyFuryTurns = 3;
      log.push({ text: `${combatState.enemy.name} se fortalece!`, type: 'effect' });
      vfx.push({ type: 'fury', target: 'enemy' });
    }
  } else if (activeIntent.type === "defend") {
    log.push({ text: `${combatState.enemy.name} usa ${skillName || 'Proteger'}!`, type: 'enemy' });
    vfx.push({ type: 'shield', target: 'enemy' });
    // Shield is an ATTRIBUTE — scaled by skill rarity
    if (skillData?.shield) {
      const scaledShield = Math.min(0.8, skillData.shield * sMult);
      fxUpdates.enemyShield = true;
      fxUpdates.enemyShieldValue = scaledShield;
      log.push({ text: `${combatState.enemy.name} se proteje! (-${Math.floor(scaledShield * 100)}% daño)`, type: 'effect' });
    }
    // Heal is an ATTRIBUTE — scaled by skill rarity
    if (skillData?.heal && skillData.heal > 0) {
      const scaledHeal = Math.max(1, Math.floor(skillData.heal * sMult));
      currentEnemyHp = Math.min(combatState.enemyMaxHp, currentEnemyHp + scaledHeal);
      log.push({ text: `${combatState.enemy.name} recupera ${scaledHeal} HP!`, type: 'effect' });
    }
    // Fury is an EFFECT — not scaled by skill rarity
    if (skillData?.fury) {
      fxUpdates.enemyFury = true;
      fxUpdates.enemyFuryTurns = 3;
      log.push({ text: `${combatState.enemy.name} se fortalece!`, type: 'effect' });
      vfx.push({ type: 'fury', target: 'enemy' });
    }
  } else {
    // Attack-type intent — calculate damage with skill modifiers
    // Enemy debuffed → 50% less damage (stronger debuff effect)
    if (combatState.combatFx.enemyDebuff && combatState.combatFx.enemyDebuffTurns > 0) {
      dmg = Math.floor(dmg * 0.5);
    }

    // Armor penetration (e.g. Puñalada Trampa)
    if (skillData?.armorPen) {
      if (combatState.combatFx.playerShield) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
      if (combatState.combatFx.playerGuard) dmg = Math.floor(dmg * (0.5 + skillData.armorPen * 0.5));
    } else {
      if (combatState.combatFx.playerShield) dmg = Math.floor(dmg * 0.5);
      if (combatState.combatFx.playerGuard) dmg = Math.floor(dmg * 0.5);
    }

    // Enemy fury buff increases damage
    if (combatState.combatFx.enemyFury) {
      dmg = Math.floor(dmg * 1.5);
    }

    dmg = Math.max(1, dmg);

    // First attack bonus: if enemy goes first and this is their first attack
    if (!combatState.firstAttackDone) {
      const eSpeed = combatState.enemy?.speed || 10;
      const pSpeed = getSpeed(gameState);
      const speedDiff = Math.max(0, eSpeed - pSpeed);
      if (speedDiff > 0) {
        dmg += speedDiff;
        log.push({ text: `⚡ Bonus velocidad: +${speedDiff} daño!`, type: 'effect' });
      }
    }

    newPlayerHp = Math.max(0, newPlayerHp - dmg);
    log.push({ text: `${combatState.enemy.name} usa ${skillName || 'Ataque'} por ${dmg}!`, type: 'enemy' });
    vfx.push({ type: 'slash', target: 'player' });
    vfx.push({ type: 'shake', target: 'player' });
    vfx.push({ type: 'flash-damage', target: 'player' });

    // Apply bleed from enemy skill
    // Bleed is an ATTRIBUTE — scaled by skill rarity
    if (skillData?.bleed && !combatState.combatFx.playerBleed) {
      const scaledBleed = Math.max(1, Math.floor(skillData.bleed * sMult));
      log.push({ text: `¡Sangrado! -${scaledBleed} piezas/turno`, type: 'effect' });
      currentBleed = true;
      currentBleedTurns = 4;
      currentBleedDmg = scaledBleed;
      vfx.push({ type: 'bleed', target: 'player' });
    }

    // Apply debuff from enemy skill (e.g. Golpe Bajo, Trampa Sucia)
    if (skillData?.debuff) {
      log.push({ text: `¡Desconcertado! Tus golpes son más débiles.`, type: 'effect' });
      vfx.push({ type: 'debuff', target: 'player' });
    }

    // Steal from enemy skill — steal is an ATTRIBUTE, scaled
    if (skillData?.steal) {
      const scaledSteal = Math.max(1, Math.floor(skillData.steal * sMult));
      const stolen = Math.min(scaledSteal, gameState.resources.shards);
      if (stolen > 0) {
        newPlayerHp = newPlayerHp; // no change to hp from steal
        gsUpdates.resources = { ...gameState.resources, shards: Math.max(0, gameState.resources.shards - stolen) };
        log.push({ text: `¡Robo! -${stolen} fragmentos`, type: 'effect' });
      }
    }

    // Multi-hit from enemy skill
    if (skillData?.multi && skillData.multi > 1) {
      const hits = skillData.multi;
      const extraDmgPerHit = Math.floor(dmg * 0.5);
      const totalExtra = extraDmgPerHit * (hits - 1);
      if (totalExtra > 0) {
        newPlayerHp = Math.max(0, newPlayerHp - totalExtra);
        for (let i = 1; i < hits; i++) {
          log.push({ text: `Impacto ${i + 1}: -${extraDmgPerHit}`, type: 'effect' });
        }
      }
    }

    // Freeze/stun from enemy skill
    // Stun resistance: progressive
    if (skillData?.freeze) {
      const currentStunCount = combatState.playerStunCount;
      let resisted = false;
      if (currentStunCount >= 2) {
        resisted = true; // 100% resist after 2 stuns
      } else if (currentStunCount === 1) {
        resisted = Math.random() < 0.5; // 50% resist after 1 stun
      }
      // currentStunCount === 0: no resist (100% stun)

      if (resisted) {
        log.push({ text: `¡Barnaby resiste la parálisis!`, type: 'effect' });
        vfx.push({ type: 'freeze', target: 'player' });
      } else {
        log.push({ text: `¡Paralizado! Pierdes tu próximo turno.`, type: 'effect' });
        vfx.push({ type: 'freeze', target: 'player' });
      }
    }
  }

  // Build updated combat Fx
  // Determine if player gets frozen (with stun resistance check)
  const freezeSkill = skillData?.freeze;
  const currentStunCount = combatState.playerStunCount;
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

  // New stun count: always increment if freeze was attempted (even if resisted)
  const newStunCount = combatState.playerStunCount + (freezeSkill ? 1 : 0);

  fxUpdates.playerShield = false;
  fxUpdates.playerGuard = false;
  fxUpdates.enemyBleedTurns = currentEnemyBleedTurns;
  fxUpdates.enemyPoisonTurns = currentEnemyPoisonTurns;
  fxUpdates.enemyDebuffTurns = Math.max(0, (combatState.combatFx.enemyDebuffTurns || 0) - 1);
  fxUpdates.enemyFuryTurns = Math.max(0, (combatState.combatFx.enemyFuryTurns || 0) - 1);
  fxUpdates.enemyFury = (combatState.combatFx.enemyFuryTurns || 0) > 1 ? combatState.combatFx.enemyFury : false;
  fxUpdates.playerPoison = currentPoison;
  fxUpdates.playerPoisonTurns = currentPoisonTurns;
  fxUpdates.playerPoisonDmg = currentPoisonDmg;
  fxUpdates.playerBleed = currentBleed;
  fxUpdates.playerBleedTurns = currentBleedTurns;
  fxUpdates.playerBleedDmg = currentBleedDmg;

  // If enemy skill has debuff, apply player debuff — 3 turns
  if (skillData?.debuff) {
    fxUpdates.playerDebuff = true;
    fxUpdates.playerDebuffTurns = 3;
  }

  // If enemy skill has freeze and not resisted, skip player's next turn
  if (playerGetsFrozen) {
    fxUpdates.playerFrozen = true;
    fxUpdates.playerStunCount = newStunCount;
  } else {
    fxUpdates.playerStunCount = newStunCount;
  }

  // Game state update for stolen shards
  if (!gsUpdates.resources) {
    gsUpdates.resources = undefined;
  }
  gsUpdates.pieces = newPlayerHp;

  // If player is frozen (stunned), calculate next intent for the extra enemy turn
  let nextIntent: EnemyIntent | null = null;
  let futureIntent: EnemyIntent | null = null;
  const defense = getDefense(gameState);

  if (playerGetsFrozen) {
    // Enemy gets another turn since player is stunned
    nextIntent = calculateEnemyIntent(
      combatState.enemy,
      newTurnCount,
      defense,
      currentEnemyHp,
      combatState.enemyMaxHp,
      newMasterSkillUsed,
      combatState.preRolledDrop,
    );
  } else {
    // Simple alternation: player's turn next, calculate intent for next enemy turn
    futureIntent = calculateEnemyIntent(
      combatState.enemy,
      newTurnCount,
      defense,
      currentEnemyHp,
      combatState.enemyMaxHp,
      newMasterSkillUsed,
      combatState.preRolledDrop,
    );
  }

  return {
    newEnemyHp: currentEnemyHp,
    newPlayerHp,
    damage: dmg,
    combatLog: log,
    combatFx: fxUpdates,
    newGameState: gsUpdates,
    enemyDied: false,
    playerFrozen: playerGetsFrozen,
    nextIntent,
    futureIntent,
    vfx,
  };
}

// ═══════════════════════════════════════════
// CHECK LEVEL UP (pure)
// ═══════════════════════════════════════════

export function checkLevelUp(args: {
  level: number;
  exp: number;
  expToLevel: number;
  completedQuests: string[];
}): CheckLevelUpResult {
  const { level, exp, expToLevel, completedQuests } = args;

  let newLevel = level;
  let newExp = exp;
  let newExpToLevel = expToLevel;
  let newMaxPieces = 0; // bonus
  let newCrit = 0; // bonus
  let newPieces = 0; // bonus
  let leveledUp = false;
  let levelUpBlocked = false;

  if (newExp >= newExpToLevel) {
    newLevel++;
    if (newLevel > 5 && !completedQuests?.includes('forest_5_rey')) {
      newLevel = 5;
      newExp = 0;
      levelUpBlocked = true;
    } else {
      newExp -= newExpToLevel;
      newExpToLevel = Math.floor(100 * Math.pow(1.3, newLevel - 1));
      newMaxPieces += 8;
      newCrit += 1;
      leveledUp = true;
    }
  }

  return {
    leveledUp,
    levelUpBlocked,
    newLevel,
    newExp,
    newExpToLevel,
    newMaxPieces,
    newCrit,
    newPieces,
  };
}

// ═══════════════════════════════════════════
// CALCULATE COMBAT REWARDS (pure)
// ═══════════════════════════════════════════

export function calculateCombatRewards(args: {
  enemy: any;
  gameState: GameState;
  preRolledDrop: PreRolledDrop | null;
}): CalculateCombatRewardsResult {
  const { enemy, gameState, preRolledDrop } = args;

  const reward = enemy.reward || { shards: 15 };
  const enemyName = enemy?.name || '';
  const droppedPartName = preRolledDrop?.itemName || '';

  // Build inventory with loot
  const newInventory: InventoryItem[] = [...gameState.inventory];

  // Pre-rolled drop is GUARANTEED
  if (preRolledDrop) {
    newInventory.push({
      id: preRolledDrop.itemName,
      rarity: preRolledDrop.itemRarity,
      skillRarities: preRolledDrop.skillRarities,
    });
  }

  // possibleLoot bonus: reduced chance (50% of original) for extra drop
  const bonusLootItems: InventoryItem[] = [];
  const bonusLootChance = (enemy.lootChance || 0.25) * 0.5;
  if (enemy.possibleLoot?.length > 0 && Math.random() < bonusLootChance) {
    const lootObj = enemy.possibleLoot[Math.floor(Math.random() * enemy.possibleLoot.length)];
    const itemName = typeof lootObj === 'string' ? lootObj : lootObj.item;
    const lootRarity = (typeof lootObj === 'object' && lootObj.rarity) ? lootObj.rarity as Rarity : 'normal';
    const lootItem: InventoryItem = { id: itemName, rarity: lootRarity, skillRarities: {} };
    bonusLootItems.push(lootItem);
    newInventory.push(lootItem);
  }

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

  // Bestiary
  const newBestiary = { ...(gameState.bestiary || {}) };
  if (enemyName) {
    const entry = newBestiary[enemyName] || { kills: 0, dropsFound: [] };
    entry.kills += 1;
    if (droppedPartName && !entry.dropsFound.includes(droppedPartName)) {
      entry.dropsFound.push(droppedPartName);
    }
    newBestiary[enemyName] = entry;
  }

  // Reward items (from enemy.reward.items)
  if (enemy.reward?.items) {
    enemy.reward.items.forEach((item: string) => {
      newInventory.push({ id: item, rarity: 'normal', skillRarities: {} });
    });
  }

  // Defeated bosses
  const newDefeatedBosses = enemy.isBoss
    ? Array.from(new Set([...gameState.defeatedBosses, gameState.currentLocation, enemy.name]))
    : gameState.defeatedBosses;

  return {
    shards: reward.shards,
    lootItems: preRolledDrop ? [{
      id: preRolledDrop.itemName,
      rarity: preRolledDrop.itemRarity,
      skillRarities: preRolledDrop.skillRarities,
    }] : [],
    bonusLootItems,
    newInventory,
    newBestiary,
    newQuestProgress,
    newDefeatedBosses,
    newResources: {
      shards: gameState.resources.shards + reward.shards,
    },
    newWins: gameState.wins + 1,
  };
}

// ═══════════════════════════════════════════
// 4-ACTION TURN SYSTEM — New Functions
// ═══════════════════════════════════════════

import type { TempBuffs } from '../types';
import { DEFAULT_TEMP_BUFFS } from '../types';

/**
 * Calculate 4 enemy actions for a turn based on their parts.
 * In the new system, enemies use skills from their `parts` array.
 * If fewer than 4 parts, cycle to fill 4 slots.
 * Master skill replaces slot 1 when HP ≤ 30%.
 */
export function calculateEnemyActions(args: {
  enemyData: any;
  currentEnemyHp: number;
  currentEnemyMaxHp: number;
  isMasterUsed: boolean;
  defense: number;
  preRolledDrop?: PreRolledDrop | null;
}): EnemyIntent[] {
  const { enemyData, currentEnemyHp, currentEnemyMaxHp, isMasterUsed, defense, preRolledDrop } = args;
  
  // Get skills from parts
  const parts = enemyData.parts || [];
  let skillIds: string[] = parts.map((p: any) => p.skill);
  
  // Fill to 4 by cycling through parts
  while (skillIds.length < 4 && skillIds.length > 0) {
    skillIds.push(skillIds[skillIds.length % parts.length]);
  }
  
  // If no parts at all, fall back to intentPattern
  if (skillIds.length === 0) {
    const pattern = enemyData.intentPattern || ['attack'];
    skillIds = Array.from({ length: 4 }, (_, i) => pattern[i % pattern.length]);
  }
  
  // Only keep first 4
  skillIds = skillIds.slice(0, 4);
  
  // Master skill: when HP <= 30%, replace slot 1 (index 0)
  const masterSkillId = enemyData.masterSkill;
  const masterSkillRef = masterSkillId ? TDB[masterSkillId] : null;
  let useMasterSkill = false;
  if (masterSkillRef && !isMasterUsed && currentEnemyHp <= currentEnemyMaxHp * 0.3) {
    useMasterSkill = true;
    // Replace slot 1 (index 0)
    skillIds[0] = masterSkillId;
  }
  
  // Calculate intent for each skill
  return skillIds.map((skillId, idx) => {
    return calculateEnemyIntentForSkill(
      skillId,
      enemyData,
      defense,
      preRolledDrop,
      useMasterSkill && idx === 0,
    );
  });
}

/**
 * Helper: calculate a single enemy intent for a specific skill ID.
 * Extracted from calculateEnemyIntent to support the 4-action system.
 */
function calculateEnemyIntentForSkill(
  skillId: string,
  enemyData: any,
  defense: number,
  preRolledDrop: PreRolledDrop | null,
  isMasterSkill: boolean,
): EnemyIntent {
  const skillRef = TDB[skillId];
  if (skillRef) {
    const baseAtk = enemyData.attack;
    const atkScale = baseAtk / 10;
    let skillDmg = skillRef.damage > 0 ? Math.floor(skillRef.damage * atkScale) : baseAtk;

    const enemySkillRarities = enemyData._skillRarities || preRolledDrop?.skillRarities || {};
    const skillRarity = enemySkillRarities[skillId];
    if (skillRarity && skillDmg > 0) {
      const skillMult = SKILL_RARITY_MULTIPLIER[skillRarity];
      skillDmg = Math.floor(skillDmg * skillMult);
    }

    let estimatedDmg = Math.max(1, Math.floor(skillDmg * (0.85 + Math.random() * 0.3)) - Math.floor(defense * 0.5));
    estimatedDmg = Math.max(Math.floor(skillDmg * 0.3), estimatedDmg);

    let totalDmg = estimatedDmg;
    if (skillRef.multi) {
      totalDmg = estimatedDmg + Math.floor(estimatedDmg * 0.5) * (skillRef.multi - 1);
    }

    let intentCategory = 'attack';
    if (skillRef.type === 'defense') intentCategory = 'defend';
    else if (skillRef.fury) intentCategory = 'buff';
    else if (skillRef.shield && skillRef.damage === 0) intentCategory = 'defend';
    else if (skillRef.type === 'ultimate') intentCategory = 'attack';
    else if (skillRef.debuff && skillRef.damage > 0) intentCategory = 'attack';

    let intentText: string;
    const isMaster = skillId.startsWith('🌟');
    const nameDisplay = isMaster ? `★ ${skillRef.name}` : skillRef.name;

    if (intentCategory === 'buff') {
      intentText = `<strong>${nameDisplay}</strong>`;
    } else if (intentCategory === 'defend') {
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
      icon: isMaster ? '🌟' : skillRef.emoji,
      text: intentText,
      skillId: skillId,
      skillData: skillRef,
      isMasterSkill: isMasterSkill || isMaster,
    };
  }

  // Fallback for unknown skill IDs
  const baseAtk = enemyData.attack;
  let estimatedDmg = Math.max(1, Math.floor(baseAtk * (0.85 + Math.random() * 0.3)) - defense);
  estimatedDmg = Math.max(Math.floor(baseAtk * 0.25), estimatedDmg);
  return { type: 'attack', value: estimatedDmg, icon: '⚔️', text: `Ataque <strong>${estimatedDmg}</strong>` };
}

/**
 * Resolve action order for 4 slots based on player and enemy speed.
 * Returns array of 4 booleans: true = player goes first in that slot.
 * Alternates: faster entity goes first in even slots, slower in odd slots.
 * On speed tie: alternates based on turn number.
 */
export function resolveActionOrder(args: {
  playerSpeed: number;
  enemySpeed: number;
  turnNumber: number;
}): boolean[] {
  const { playerSpeed, enemySpeed, turnNumber } = args;
  let playerFirstInSlot0: boolean;
  if (playerSpeed > enemySpeed) playerFirstInSlot0 = true;
  else if (playerSpeed < enemySpeed) playerFirstInSlot0 = false;
  else playerFirstInSlot0 = turnNumber % 2 === 0; // alternate on tie
  
  return [
    playerFirstInSlot0,       // slot 0
    !playerFirstInSlot0,      // slot 1
    playerFirstInSlot0,       // slot 2
    !playerFirstInSlot0,      // slot 3
  ];
}

/**
 * Get the 4 skills the player can use this turn (one per equipment slot).
 * Returns skill IDs for head, torso, arms, legs in order.
 * If a slot has putrefacción=0, the skill is still returned but marked as unavailable.
 */
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
    let putrefaccion = -1; // -1 means innate (always available)
    
    if (eq && eq.id) {
      const data = getItemData(eq.id);
      if (data?.skillIds && data.skillIds.length > 0) {
        skillId = data.skillIds[0]; // Use first skill from item
      }
      putrefaccion = eq.putrefaccion;
    }
    
    return {
      slotKey,
      skillId,
      putrefaccion,
      isAvailable: putrefaccion === -1 || putrefaccion > 0,
    };
  });
}
