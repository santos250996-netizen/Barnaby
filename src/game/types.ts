import { Rarity } from '@/game/constants';

export interface InventoryItem {
  id: string;           // EDB key like "Cráneo de Goblin"
  rarity: Rarity;       // dropped rarity
  skillRarities: Record<string, Rarity>;  // skillId → skill rarity
}

export interface EquipSlot {
  id: string;
  putrefaccion: number;
  rarity: Rarity;
  skillRarities: Record<string, Rarity>;
}

export interface GameState {
  pieces: number;
  maxPieces: number;
  wins: number;
  techniques: string[];
  resources: { potions: number; shards: number; crit: number };
  equipment: {
    head: EquipSlot | null;
    torso: EquipSlot | null;
    arms: EquipSlot | null;
    legs: EquipSlot | null;
  };
  inventory: InventoryItem[];
  currentLocation: string;
  unlockedLocations: string[];
  defeatedBosses: string[];
  activeQuests: any[];
  completedQuests: string[];
  storyFlags: { nextCrit: boolean; inDungeon: boolean; tutorialComplete: boolean };
  dungeon: {
    rooms: any[];
    currentRoom: number;
    depth: number;
    reward: any;
  } | null;
  bestiary: Record<string, { kills: number; dropsFound: string[] }>;
  questProgress: Record<string, number>;
  consumableSlots: [string | null, string | null];
  unlockedLore: string[];
}

export interface CombatFx {
  enemyBleed: number;
  enemyBleedTurns: number;
  enemyPoison: number;
  enemyPoisonTurns: number;
  enemyFrozen: boolean;
  enemyDebuff: boolean;
  enemyDebuffTurns: number;
  enemyFury: boolean;
  enemyFuryTurns: number;
  enemyShield: boolean;
  enemyShieldValue: number;
  playerShield: boolean;
  playerGuard: boolean;
  playerPoison: boolean;
  playerPoisonTurns: number;
  playerPoisonDmg: number;
  playerBleed: boolean;
  playerBleedTurns: number;
  playerBleedDmg: number;
  playerDebuff: boolean;
  playerDebuffTurns: number;
  playerFrozen: boolean;
  playerStunCount: number;
}

export interface LogEntry {
  text: string;
  type?: 'player' | 'enemy' | 'effect' | 'reward';
}

export interface Toast {
  id: number;
  msg: string;
  type?: 'success' | 'error' | 'info';
}

export interface FloatingNumber {
  id: number;
  val: string;
  type: 'damage' | 'heal' | 'crit' | 'shield';
  x: number;
  y: number;
}

// ═══════════════════════════════════════════
// 4-Action Turn-Based Combat Types
// ═══════════════════════════════════════════

export type TurnPhase = 'planning' | 'executing';

export interface TempBuffs {
  playerAtk: number;     // bonus attack this turn
  playerDef: number;     // bonus defense this turn
  playerCrit: number;    // bonus crit this turn
  playerMag: number;     // bonus magic this turn
  playerMagRes: number;  // bonus magic resistance this turn
  enemyAtk: number;      // bonus attack this turn
  enemyDef: number;      // bonus defense this turn
  enemyMag: number;      // bonus magic this turn
  enemyMagRes: number;   // bonus magic resistance this turn
}

export const DEFAULT_TEMP_BUFFS: TempBuffs = {
  playerAtk: 0, playerDef: 0, playerCrit: 0, playerMag: 0, playerMagRes: 0,
  enemyAtk: 0, enemyDef: 0, enemyMag: 0, enemyMagRes: 0,
};

export const INITIAL_STATE: GameState = {
  pieces: 200, maxPieces: 200, wins: 0,
  techniques: ["💀 Cabezazo Barnaby", "🛡️ Costillas Enrejadas", "🦾 Puño Óseo", "👻 Voluntad Post-Mortem"],
  resources: { potions: 3, shards: 120, crit: 5 },
  equipment: { head: null, torso: null, arms: null, legs: null },
  inventory: [],
  currentLocation: "🏙️ Ciudad", unlockedLocations: ["🏙️ Ciudad", "🌲 Bosque", "Catacumbas", "Paramo", "Cienaga", "Volcan", "Trono"],
  defeatedBosses: [], activeQuests: [], completedQuests: [],
  storyFlags: { nextCrit: false, inDungeon: false, tutorialComplete: false },
  dungeon: null,
  bestiary: {}, questProgress: {},
  consumableSlots: ['potion', null] as [string | null, string | null],
  unlockedLore: ['origen-1', 'origen-2']
};
