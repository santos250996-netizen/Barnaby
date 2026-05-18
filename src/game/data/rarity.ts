import { Rarity, RARITIES } from './types';

// ═══════════════════════════════════════════
// RARITY SYSTEM
// ═══════════════════════════════════════════

export { RARITIES };
export type { Rarity };

export const RARITY_CONFIG: Record<Rarity, {
  label: string; multiplier: number; color: string; glow: string; tint: string;
}> = {
  comun:     { label: 'Común',     multiplier: 0.7, color: '#9ca3af', glow: '',                                   tint: 'rgba(156,163,175,0.08)' },
  normal:    { label: 'Normal',    multiplier: 1.0, color: '#22c55e', glow: '',                                   tint: 'rgba(34,197,94,0.08)' },
  raro:      { label: 'Raro',      multiplier: 1.5, color: '#3b82f6', glow: '0 0 6px rgba(59,130,246,0.4)',      tint: 'rgba(59,130,246,0.10)' },
  epico:     { label: 'Épico',     multiplier: 2.0, color: '#a855f7', glow: '0 0 8px rgba(168,85,247,0.5)',      tint: 'rgba(168,85,247,0.12)' },
  legendario:{ label: 'Legendario', multiplier: 3.0, color: '#eab308', glow: '0 0 12px rgba(234,179,8,0.6)',     tint: 'rgba(234,179,8,0.15)' },
};

// SKILL RARITY is INDEPENDENT from item rarity
// RARITY_STAT_FACTOR: scales the 30-point base budget by rarity
// raro = baseline (1.0x), comun diminishes, legendary amplifies
export const RARITY_STAT_FACTOR: Record<Rarity, number> = {
  comun: 0.5,
  normal: 0.75,
  raro: 1.0,
  epico: 1.25,
  legendario: 1.5,
};

export const SKILL_RARITY_MULTIPLIER: Record<Rarity, number> = {
  comun: 0.8,
  normal: 1.0,
  raro: 1.25,
  epico: 1.55,
  legendario: 1.85,
};

// All zones have the same max rarity — zone determines SKILL variety, not loot quality
export function getZoneMaxRarityIndex(_locationKey: string): number {
  return 4; // All zones can drop up to legendario
}

// Roll rarity: same probability for all zones
// zoneMaxRarityIdx: from getZoneMaxRarityIndex() — always 4 now
// enemyLevel: optional, kept for backward compat but ignored
export function rollRarity(zoneMaxRarityIdx: number, _enemyLevel?: number): Rarity {
  const maxIdx = zoneMaxRarityIdx;
  // Fixed base weights — same for all zones
  const weights = [
    35,   // comun:  35%
    30,   // normal: 30%
    20,   // raro:   20%
    10,   // epico:  10%
     5,   // legend:  5%
  ];

  // Zero out weights above zone max rarity
  for (let i = maxIdx + 1; i < weights.length; i++) {
    weights[i] = 0;
  }

  const roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (roll < acc) return RARITIES[i];
  }
  return 'normal';
}

// Scale item stats by rarity — uses RARITY_STAT_FACTOR
// comun = 50% of base, legendario = 150% of base
export function scaleStat(baseValue: number, _listedRarity: Rarity, dropRarity: Rarity): number {
  return Math.max(1, Math.floor(baseValue * RARITY_STAT_FACTOR[dropRarity]));
}

// Get the effective stat value from an item given its equipped/drop rarity
export function getEffectiveStat(baseValue: number, rarity: Rarity): number {
  return Math.max(1, Math.floor(baseValue * RARITY_STAT_FACTOR[rarity]));
}

// Scale skill numeric attributes by SKILL rarity (independent from item rarity)
export function scaleSkillValue(baseValue: number, skillRarity: Rarity): number {
  return Math.max(1, Math.floor(baseValue * SKILL_RARITY_MULTIPLIER[skillRarity]));
}

// Scale percentage-based skill attributes by SKILL rarity with caps
export function scaleSkillPercent(baseValue: number, skillRarity: Rarity): number {
  const scaled = baseValue * SKILL_RARITY_MULTIPLIER[skillRarity];
  return Math.min(0.8, scaled); // cap at 80%
}
