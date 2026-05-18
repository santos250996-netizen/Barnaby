'use client';

import React from 'react';
import { EquipSlot, GameState } from '@/game/types';
import { getItemData, TDB, RARITY_CONFIG, Rarity } from '@/game/constants';

interface SkillsContentProps {
  state: GameState;
  onUpgrade: (skillId: string) => void;
}

export function SkillsContent({ state, onUpgrade }: SkillsContentProps) {

  const getInnateForPart = (part: string) => {
    if (part === 'head') return "💀 Cabezazo Barnaby";
    if (part === 'torso') return "🛡️ Costillas Enrejadas";
    if (part === 'arms') return "🦾 Puño Óseo";
    if (part === 'legs') return "👻 Voluntad Post-Mortem";
    return "";
  };

  const buildSkillStats = (tech: any): string => {
    const parts: string[] = [];
    const isPhys = tech.type === 'basic' || tech.type === 'bleed' || tech.type === 'steal';
    if (tech.damage > 0) {
      parts.push(`Daño: ${tech.damage} ${isPhys ? '+ATK' : '+30%ATK'}`);
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
      parts.push(`Debilitar ${Math.floor((1 - tech.debuff) * 100)}% daño`);
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
      parts.push(`Roba ${tech.steal}💎`);
    }
    if (tech.cost !== undefined) {
      parts.push(`Costo: ${tech.cost} piezas`);
    }
    return parts.join(' | ');
  };

  const innateParts = ['head', 'torso', 'arms', 'legs'];

  return (
    <div className="space-y-6 font-mono">
      <div className="bg-bg-surface p-3 border-l-4 border-accent">
        <h4 className="text-[10px] font-black text-white uppercase mb-1">Nexos de Habilidad</h4>
        <p className="text-[8px] text-text-muted italic">Tus habilidades en combate dependen de las partes equipadas en cada slot.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
          {innateParts.map(part => {
            const eq = (state.equipment as any)[part] as EquipSlot | null;
            const itemId = eq?.id || null;
            const item = itemId ? getItemData(itemId) : null;
            const skillName = item?.skillIds ? item.skillIds[0] : getInnateForPart(part);
           const tech = (TDB as any)[skillName];
           const isInnate = !item?.skillIds;
           const skillRarity: Rarity = (eq?.skillRarities as any)?.[skillName] || eq?.rarity || 'comun';
           const skillRarityCfg = RARITY_CONFIG[skillRarity];

           return (
             <div key={part} className={`p-4 border-2 flex gap-4 items-center ${isInnate ? 'border-border' : 'border-accent/60 bg-accent/10'}`}>
               <div className="w-12 h-12 bg-bg-deep border border-border flex items-center justify-center rounded-full overflow-hidden">
                 {tech?.icon ? <img src={tech.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-2xl">{tech?.emoji || '❓'}</span>}
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[8px] font-black text-accent uppercase tracking-widest">{part === 'arms' ? 'Brazos' : part === 'head' ? 'Cabeza' : part === 'torso' ? 'Torso' : part === 'legs' ? 'Piernas' : part}</span>
                     <div className="flex items-center gap-1">
                       {!isInnate && skillRarityCfg && skillRarity !== 'comun' && <span className="text-[7px] font-black px-1 uppercase" style={{ color: skillRarityCfg.color }}>{skillRarityCfg.label}</span>}
                       {isInnate && <span className="text-[8px] font-black bg-blue-900 px-1 text-blue-200">INNATA</span>}
                     </div>
                  </div>
                  <div className="text-xs font-black text-text-primary uppercase">{tech?.name || skillName} {isInnate ? '[INNATA]' : skillRarity !== 'comun' && skillRarityCfg ? `[${skillRarityCfg.label}]` : ''}</div>
                  <div className="text-[8px] font-bold leading-tight mt-0.5 text-accent/80">{tech ? buildSkillStats(tech) : ''}</div>
                  <div className="text-[7px] italic leading-tight mt-0.5" style={{ color: skillRarityCfg?.color || 'var(--color-desc-skill)' }}>{tech?.desc}</div>
               </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
