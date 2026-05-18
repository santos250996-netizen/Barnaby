'use client';

import React from 'react';
import { EquipSlot, GameState } from '@/game/types';
import { getItemData, TDB, RARITY_CONFIG, Rarity, getMutation, getPutrefaccionState, PUTREFACCION_MAX, slotName } from '@/game/constants';
import type { PutrefaccionMutation } from '@/game/constants';

interface SkillsContentProps {
  state: GameState;
  onUpgrade: (skillId: string) => void;
}

const PART_LABELS: Record<string, string> = {
  head: 'Cabeza',
  torso: 'Torso',
  arms: 'Brazos',
  legs: 'Piernas',
};

function buildSkillStats(tech: any): string {
  const parts: string[] = [];
  const isPhys = tech.type === 'basic' || tech.type === 'bleed' || tech.type === 'steal';
  if (tech.damage > 0) {
    parts.push(`Daño: ${tech.damage} ${isPhys ? '+ATK' : '+MAG'}`);
  }
  if (tech.heal > 0) {
    parts.push(`Cura: ${tech.heal} piezas`);
  }
  if (tech.shield) {
    parts.push(`Escudo: -${Math.floor(tech.shield * 100)}% daño`);
  }
  if (tech.bleed) {
    parts.push(`Sangrado: ${tech.bleed}/turno`);
  }
  if (tech.freeze) {
    parts.push('Stun 1 turno');
  }
  if (tech.fury) {
    parts.push('Furia +50% daño');
  }
  if (tech.debuff) {
    const reduction = Math.min(100, Math.max(0, Math.round((1 - Math.min(tech.debuff, 1)) * 100)));
    parts.push(`Debilitar ${reduction}% daño`);
  }
  if (tech.multi) {
    parts.push(`${tech.multi}x impactos`);
  }
  if (tech.lifesteal) {
    parts.push(`Robo vida ${Math.floor(tech.lifesteal * 100)}%`);
  }
  if (tech.armorPen) {
    parts.push(`Penetración ${Math.floor(tech.armorPen * 100)}%`);
  }
  if (tech.steal) {
    parts.push(`Roba ${tech.steal} diamantes`);
  }
  if (tech.cost !== undefined) {
    parts.push(`Costo: ${tech.cost} piezas`);
  }
  return parts.join(' · ');
}

/** Construye la descripción detallada de un estado de putrefacción */
function buildMutationDetails(mutation: PutrefaccionMutation, baseDamage: number): {
  buffs: string[];
  costs: string[];
  extras: string[];
} {
  const buffs: string[] = [];
  const costs: string[] = [];
  const extras: string[] = [];

  // Daño
  if (mutation.dmgMult !== 1.0) {
    const pct = Math.round((mutation.dmgMult - 1) * 100);
    buffs.push(`${pct > 0 ? '+' : ''}${pct}% daño`);
    buffs.push(`(${Math.floor(baseDamage * mutation.dmgMult)} total)`);
  }

  // Self damage
  if (mutation.selfDmgPercent > 0) {
    costs.push(`-${mutation.selfDmgPercent}% piezas propias`);
  }

  // Bonus bleed al enemigo
  if (mutation.bonusBleed && mutation.bonusBleed > 0) {
    extras.push(`+${mutation.bonusBleed} sangrado enemigo`);
  }

  // Self bleed
  if (mutation.selfBleed && mutation.selfBleed > 0) {
    costs.push(`-${mutation.selfBleed} sangrado propio/turno`);
  }

  // Bonus debuff al enemigo
  if (mutation.bonusDebuff) {
    extras.push(`Desconcierta enemigo 2 turnos`);
  }

  // Bonus heal
  if (mutation.bonusHeal && mutation.bonusHeal > 0) {
    buffs.push(`+${mutation.bonusHeal} curación`);
  }

  // Bonus shield
  if (mutation.bonusShieldMult && mutation.bonusShieldMult > 1.0) {
    const pct = Math.round((mutation.bonusShieldMult - 1) * 100);
    buffs.push(`+${pct}% escudo`);
  }

  // Bonus steal
  if (mutation.bonusStealPct && mutation.bonusStealPct > 0) {
    const pct = Math.round(mutation.bonusStealPct * 100);
    extras.push(`+${pct}% robo de diamantes`);
  }

  // Infección
  if (mutation.infectEnemy) {
    extras.push(`INFECTA al enemigo`);
  }

  return { buffs, costs, extras };
}

export function SkillsContent({ state }: SkillsContentProps) {
  const getInnateForPart = (part: string) => {
    if (part === 'head') return "💀 Cabezazo Barnaby";
    if (part === 'torso') return "🛡️ Costillas Enrejadas";
    if (part === 'arms') return "🦾 Puño Óseo";
    if (part === 'legs') return "👻 Voluntad Post-Mortem";
    return "";
  };

  const innateParts = ['head', 'torso', 'arms', 'legs'];

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="bg-bg-surface p-3 border-l-4 border-accent">
        <h4 className="text-[10px] font-black text-white uppercase mb-1">Nexos de Habilidad</h4>
        <p className="text-[8px] text-text-muted italic">
          Tus habilidades dependen de las partes equipadas. Cada uso aumenta la putrefacción: más poder pero más riesgo. Al llegar a 4 usos, la skill se destruye para ese combate.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {getPutrefaccionState(0).emoji && (
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded border" style={{ borderColor: '#d4943a40', color: '#d4943a' }}>
            🟡 Fresco — Sin modificaciones
          </span>
        )}
        <span className="text-[7px] font-black px-1.5 py-0.5 rounded border" style={{ borderColor: '#a3e63540', color: '#a3e635' }}>
          🟢 Desgastado — Ligero boost + ligero costo
        </span>
        <span className="text-[7px] font-black px-1.5 py-0.5 rounded border" style={{ borderColor: '#f9731640', color: '#f97316' }}>
          🟠 Putrido — Fuerte boost + fuerte costo + efecto extra
        </span>
        <span className="text-[7px] font-black px-1.5 py-0.5 rounded border" style={{ borderColor: '#dc262640', color: '#dc2626' }}>
          🔴 Necrótico — Máximo poder + máximo riesgo + infección
        </span>
      </div>

      {/* Skills list */}
      <div className="grid grid-cols-1 gap-4">
        {innateParts.map(part => {
          const eq = (state.equipment as any)[part] as EquipSlot | null;
          const itemId = eq?.id || null;
          const item = itemId ? getItemData(itemId) : null;
          const skillName = item?.skillIds ? item.skillIds[0] : getInnateForPart(part);
          const tech = (TDB as any)[skillName];
          const isInnate = !item?.skillIds;
          const skillRarity: Rarity = (eq?.skillRarities as any)?.[skillName] || eq?.rarity || 'comun';
          const skillRarityCfg = RARITY_CONFIG[skillRarity];

          if (!tech) return null;

          // Calcular daño base escalado por rareza
          const rarityMult = skillRarityCfg ? (skillRarityCfg.label === 'Normal' ? 1.0 : skillRarityCfg.label === 'Raro' ? 1.25 : skillRarityCfg.label === 'Épico' ? 1.55 : skillRarityCfg.label === 'Legendario' ? 1.85 : 0.8) : 1.0;
          const baseDmg = tech.damage > 0 ? Math.floor(tech.damage * rarityMult) : tech.damage;

          return (
            <div key={part} className={`border-2 overflow-hidden ${isInnate ? 'border-border' : 'border-accent/60 bg-accent/5'}`}>
              {/* Skill header row */}
              <div className="p-3 flex gap-3 items-center">
                <div className="w-12 h-12 bg-bg-deep border border-border flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                  {tech.icon ? <img src={tech.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-2xl">{tech.emoji || '❓'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[8px] font-black text-accent uppercase tracking-widest">{PART_LABELS[part] || part}</span>
                    <div className="flex items-center gap-1">
                      {!isInnate && skillRarityCfg && skillRarity !== 'comun' && (
                        <span className="text-[7px] font-black px-1 uppercase" style={{ color: skillRarityCfg.color }}>{skillRarityCfg.label}</span>
                      )}
                      {isInnate && <span className="text-[7px] font-black bg-blue-900/60 px-1 text-blue-200 rounded">INNATA</span>}
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-text-primary uppercase truncate">
                    {tech.name}
                    {!isInnate && skillRarity !== 'comun' && skillRarityCfg ? ` [${skillRarityCfg.label}]` : ''}
                  </div>
                  <div className="text-[7px] font-bold leading-tight mt-0.5 text-accent/70 truncate">{buildSkillStats(tech)}</div>
                  <div className="text-[7px] italic leading-tight mt-0.5 text-text-muted truncate">{tech.desc}</div>
                </div>
              </div>

              {/* Putrefacción states detail */}
              <div className="border-t border-border/50 bg-black/20">
                <div className="px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Putrefacción por combate</span>
                  <span className="text-[6px] text-white/25">(4 usos max — al 4° uso se destruye)</span>
                </div>
                <div className="grid grid-cols-2 gap-px">
                  {[0, 1, 2, 3].map(level => {
                    const pState = getPutrefaccionState(level);
                    const mutation = getMutation(tech.type, level);
                    const { buffs, costs, extras } = buildMutationDetails(mutation, baseDmg);
                    const isBase = level === 0;
                    const useNum = level + 1;

                    return (
                      <div
                        key={level}
                        className="p-2 border-t border-border/30"
                        style={{
                          background: isBase ? 'transparent' : `linear-gradient(135deg, ${pState.color}08 0%, transparent 70%)`,
                          borderLeft: `2px solid ${pState.color}40`,
                        }}
                      >
                        {/* State header */}
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pState.color }} />
                          <span className="text-[7px] font-black uppercase" style={{ color: pState.color }}>
                            {pState.emoji} {pState.name}
                          </span>
                          <span className="text-[6px] text-white/30 ml-auto">Uso #{useNum}</span>
                        </div>

                        {isBase ? (
                          /* Base state — skill original sin cambios */
                          <div className="text-[7px] text-white/40 italic">
                            Sin modificaciones. La skill funciona normalmente.
                          </div>
                        ) : (
                          /* Mutated state — mostrar buffs, costs, extras */
                          <div className="space-y-0.5">
                            {buffs.length > 0 && (
                              <div className="flex flex-wrap gap-x-1.5 gap-y-0">
                                {buffs.map((b, i) => (
                                  <span key={i} className="text-[7px] font-bold" style={{ color: '#4ade80' }}>▲ {b}</span>
                                ))}
                              </div>
                            )}
                            {costs.length > 0 && (
                              <div className="flex flex-wrap gap-x-1.5 gap-y-0">
                                {costs.map((c, i) => (
                                  <span key={i} className="text-[7px] font-bold" style={{ color: '#f87171' }}>▼ {c}</span>
                                ))}
                              </div>
                            )}
                            {extras.length > 0 && (
                              <div className="flex flex-wrap gap-x-1.5 gap-y-0">
                                {extras.map((e, i) => (
                                  <span key={i} className="text-[7px] font-bold" style={{ color: mutation.infectEnemy && e === 'INFECTA al enemigo' ? '#c084fc' : '#60a5fa' }}>★ {e}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Destructed warning */}
                <div className="px-3 py-1.5 border-t border-red-900/40 bg-red-950/20 flex items-center gap-1.5">
                  <span className="text-[7px]">💀</span>
                  <span className="text-[7px] font-black text-red-400/80 uppercase">Tras 4° uso — Skill destruida para este combate</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
