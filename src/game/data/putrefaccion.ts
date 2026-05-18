// ═══════════════════════════════════════════════════════
// Sistema de Putrefacción — Mutaciones de Habilidades
// ═══════════════════════════════════════════════════════
// Cada parte tiene 4 puntos de putrefacción por combate.
// 0 = Fresco, 1 = Desgastado, 2 = Putrido, 3 = Necrótico
// A los 4 usos, la skill se pierde para ese combate.

import type { EntityType } from './types';

// ── Estados de Putrefacción ──

export const PUTREFACCION_STATES = [
  { level: 0, name: 'Fresco',    color: '#d4943a', emoji: '🟡', desc: 'Estado normal de la pieza.' },
  { level: 1, name: 'Desgastado', color: '#a3e635', emoji: '🟢', desc: 'La pieza empieza a ceder.' },
  { level: 2, name: 'Putrido',    color: '#f97316', emoji: '🟠', desc: 'La carne se descompone. Mucho poder, mucho riesgo.' },
  { level: 3, name: 'Necrótico',  color: '#dc2626', emoji: '🔴', desc: 'El borde de la destrucción. Poder máximo, pero la pieza no sobrevivirá otro uso.' },
] as const;

export const PUTREFACCION_MAX = 4; // al llegar a 4, la skill se pierde

export type PutrefaccionLevel = 0 | 1 | 2 | 3;

// ── Mutaciones por tipo de skill y nivel de putrefacción ──

export interface PutrefaccionMutation {
  dmgMult: number;          // multiplicador de daño (1.0 = normal)
  selfDmgPercent: number;   // % del maxPieces que te quitas a ti mismo (0 = ninguno)
  bonusBleed?: number;      // bleed extra aplicado al enemigo
  bonusDebuff?: boolean;    // aplica debuff al enemigo (30% reducción, 2 turnos)
  bonusHeal?: number;       // curación extra
  bonusShieldMult?: number; // multiplicador extra para escudo (defense skills)
  bonusStealPct?: number;   // % extra de robo de fragments (steal skills)
  infectEnemy?: boolean;    // infecta al enemigo con putrefacción
  selfBleed?: number;       // bleed aplicado a Barnaby
  logTag: string;           // etiqueta corta para el log de combate
  logDesc: string;          // descripción de la mutación para el log
}

/**
 * Tabla de mutaciones: [skillType][putrefaccionLevel] → mutation
 * - Fresco (0): comportamiento base, sin modificaciones
 * - Desgastado (1): potencia leve + costo leve
 * - Putrido (2): potencia fuerte + costo fuerte + efecto extra
 * - Necrótico (3): potencia máxima + costo severo + infección
 */
const MUTATIONS: Record<EntityType, PutrefaccionMutation[]> = {
  basic: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.35, selfDmgPercent: 3,   logTag: 'DESGASTADO', logDesc: '+35% daño, -3% piezas' },
    { dmgMult: 1.8,  selfDmgPercent: 7,   bonusBleed: 2,       logTag: 'PUTRIDO',   logDesc: '+80% daño, -7% piezas, sangrado 2' },
    { dmgMult: 2.4,  selfDmgPercent: 12,  bonusBleed: 3, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+140% daño, -12% piezas, sangrado 3, INFECTA' },
  ],
  magic: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.3,  selfDmgPercent: 4,   logTag: 'DESGASTADO', logDesc: '+30% daño, -4% piezas' },
    { dmgMult: 1.7,  selfDmgPercent: 8,   bonusDebuff: true,   logTag: 'PUTRIDO',   logDesc: '+70% daño, -8% piezas, desconcerta' },
    { dmgMult: 2.3,  selfDmgPercent: 12,  bonusDebuff: true, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+130% daño, -12% piezas, desconcerta, INFECTA' },
  ],
  defense: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   bonusShieldMult: 1.0, logTag: '',         logDesc: '' },
    { dmgMult: 1.0,  selfDmgPercent: 3,   bonusShieldMult: 1.3, logTag: 'DESGASTADO', logDesc: '+30% escudo, -3% piezas' },
    { dmgMult: 1.0,  selfDmgPercent: 6,   bonusShieldMult: 1.6, bonusDebuff: true,  logTag: 'PUTRIDO',   logDesc: '+60% escudo, -6% piezas, desconcerta' },
    { dmgMult: 1.0,  selfDmgPercent: 10,  bonusShieldMult: 2.0, bonusDebuff: true, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+100% escudo, -10% piezas, desconcerta, INFECTA' },
  ],
  bleed: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.3,  selfDmgPercent: 3,   bonusBleed: 1,       logTag: 'DESGASTADO', logDesc: '+30% daño, -3% piezas, +1 sangrado' },
    { dmgMult: 1.7,  selfDmgPercent: 6,   bonusBleed: 2, selfBleed: 2, logTag: 'PUTRIDO',   logDesc: '+70% daño, -6% piezas, +2 sangrado, auto-sangrado 2' },
    { dmgMult: 2.2,  selfDmgPercent: 10,  bonusBleed: 3, selfBleed: 3, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+120% daño, -10% piezas, +3 sangrado, auto-sangrado 3, INFECTA' },
  ],
  steal: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.3,  selfDmgPercent: 3,   bonusStealPct: 0.5, logTag: 'DESGASTADO', logDesc: '+30% daño, -3% piezas, +50% robo' },
    { dmgMult: 1.7,  selfDmgPercent: 6,   bonusStealPct: 1.0, logTag: 'PUTRIDO',   logDesc: '+70% daño, -6% piezas, +100% robo' },
    { dmgMult: 2.2,  selfDmgPercent: 10,  bonusStealPct: 1.5, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+120% daño, -10% piezas, +150% robo, INFECTA' },
  ],
  ultimate: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.3,  selfDmgPercent: 4,   logTag: 'DESGASTADO', logDesc: '+30% daño, -4% piezas' },
    { dmgMult: 1.8,  selfDmgPercent: 8,   bonusBleed: 3,       logTag: 'PUTRIDO',   logDesc: '+80% daño, -8% piezas, sangrado 3' },
    { dmgMult: 2.5,  selfDmgPercent: 15,  bonusBleed: 4, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+150% daño, -15% piezas, sangrado 4, INFECTA' },
  ],
  sacrifice: [
    { dmgMult: 1.0,  selfDmgPercent: 0,   logTag: '',         logDesc: '' },
    { dmgMult: 1.4,  selfDmgPercent: 5,   logTag: 'DESGASTADO', logDesc: '+40% daño, -5% piezas extra' },
    { dmgMult: 1.9,  selfDmgPercent: 10,  bonusBleed: 2,       logTag: 'PUTRIDO',   logDesc: '+90% daño, -10% piezas extra, sangrado 2' },
    { dmgMult: 2.5,  selfDmgPercent: 18,  bonusBleed: 3, infectEnemy: true, logTag: 'NECROTICO', logDesc: '+150% daño, -18% piezas extra, sangrado 3, INFECTA' },
  ],
};

// ── Helpers ──

/** Obtener la mutación para un tipo de skill y nivel de putrefacción */
export function getMutation(skillType: EntityType, level: number): PutrefaccionMutation {
  const levels = MUTATIONS[skillType] || MUTATIONS.basic;
  const idx = Math.min(Math.max(0, level), 3);
  return levels[idx];
}

/** Obtener el estado visual de putrefacción */
export function getPutrefaccionState(level: number) {
  const idx = Math.min(Math.max(0, level), 3);
  return PUTREFACCION_STATES[idx];
}

/** Calcular el self-damage basado en % del maxPieces */
export function calcSelfDamage(percent: number, maxPieces: number): number {
  if (percent <= 0) return 0;
  return Math.max(1, Math.floor(maxPieces * (percent / 100)));
}

/** Daño que recibe el enemigo por putrefacción al final de turno */
export function enemyPutrefaccionDmg(level: number): number {
  if (level <= 0) return 0;
  return level * 2; // 2 daño por punto de putrefacción
}

/** Reducción de daño del enemigo por putrefacción (%) */
export function enemyPutrefaccionReduction(level: number): number {
  if (level <= 0) return 0;
  return Math.min(30, level * 5); // -5% por punto, max -30%
}

/** Nombre de la pieza en español */
export function slotName(slot: string): string {
  const names: Record<string, string> = {
    head: 'Cabeza',
    torso: 'Torso',
    arms: 'Brazos',
    legs: 'Piernas',
  };
  return names[slot] || slot;
}

/** Reset de putrefacción por combate */
export function createDefaultPutrefaccion(): Record<string, number> {
  return { head: 0, torso: 0, arms: 0, legs: 0 };
}
