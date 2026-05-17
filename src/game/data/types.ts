export type EntityType = 'basic' | 'magic' | 'defense' | 'steal' | 'bleed' | 'ultimate' | 'sacrifice';

export interface Technique {
  cost?: number;
  costMax?: number;
  damage: number;
  heal: number;
  emoji: string;
  name: string;
  damageRange: string;
  type: EntityType;
  desc: string;
  icon?: string;
  guardHeal?: number;
  steal?: number;
  debuff?: number;
  bleed?: number;
  shield?: number;
  fury?: boolean;
  multi?: number;
  freeze?: boolean;
  lifesteal?: number;
  selfDamage?: number;
  shieldAlly?: boolean;
  armorPen?: number;
}

export const RARITIES = ['comun', 'normal', 'raro', 'epico', 'legendario'] as const;
export type Rarity = typeof RARITIES[number];

export interface EnemyData {
  hp: number;
  attack: number;
  reward: { shards: number };
  emoji: string;
  archetype: string;
  lootChance: number;
  possibleLoot: { item: string; rarity: string }[];
  intentPattern: string[];
  masterSkill: string;
  isBoss?: boolean;
  speed?: number;
  parts?: { name: string; skill: string }[];
}

export interface ItemData {
  slot: string;
  stats: Record<string, number>;
  emoji: string;
  desc: string;
  rarity: string;
  maxPutrefaccion: number;
  set?: string;
  skillIds?: string[];
  icon?: string;
  passive?: string;
}

export interface LocationData {
  name: string;
  isTown: boolean;
  enemies: string[];
  npcs: string[];
  boss: string | null;
  description: string;
  comedyLine?: string;
  bgImage?: string;
  npcPositions?: Record<string, { top?: string; left?: string; bottom?: string; right?: string }>;
  npcIcons?: Record<string, string>;
  interactPositions?: Record<string, { top?: string; left?: string; bottom?: string; right?: string }>;
  interactIcons?: Record<string, string>;
  mapPosition: { top?: string; left?: string; bottom?: string; right?: string };
  mapIcon: string;
}

export interface SetData {
  name: string;
  bonus2: { stats: Record<string, number>; desc: string; effect?: string };
  bonus3?: { stats: Record<string, number>; desc: string; effect?: string };
  bonus4?: { stats: Record<string, number>; desc: string; effect?: string };
}

export interface QuestData {
  id: string;
  name: string;
  giver: string;
  location: string;
  type: string;
  target?: string;
  count?: number;
  story: boolean;
  order?: number;
  description: string;
  req: string;
  reward: { shards?: number; item?: string; potions?: number; integrity?: number };
  reqQuest?: string;
  unlocksBoss?: string;
}

export interface LoreEntry {
  id: string;
  title: string;
  date: string;
  zone: string;
  unlockCondition: string;
  excerpt: string;
  content: string;
}
