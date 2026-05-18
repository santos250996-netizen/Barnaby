'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Sword, Shield, Zap, Activity, Footprints, TrendingUp, X, Flame, Wind } from 'lucide-react';
import { EquipSlot, GameState } from '@/game/types';
import { getItemData, TDB, SETS, RARITY_CONFIG, RARITY_STAT_FACTOR, Rarity, scaleStat, SKILL_RARITY_MULTIPLIER } from '@/game/constants';
import { StatItem } from '@/game/components/ui/StatItem';
import { getRarityColor } from '@/game/components/ui/EquipmentSlot';

interface CharacterContentProps {
  state: GameState;
  getAttack: () => number;
  getDefense: () => number;
  getMagic: () => number;
  getMagicRes: () => number;
  getSpeed: () => number;
  getCrit: () => number;
  getMaxPieces: () => number;
}

export function CharacterContent({ state, getAttack, getDefense, getMagic, getMagicRes, getSpeed, getCrit, getMaxPieces }: CharacterContentProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const slots = [
    { id: 'head', label: 'Craneo', icon: <Skull size={10} />, pos: 'top-0 left-1/2 -translate-x-1/2' },
    { id: 'torso', label: 'Torso', icon: <Activity size={10} />, pos: 'top-[4.5rem] left-1/2 -translate-x-1/2' },
    { id: 'arms', label: 'Brazos', icon: <Sword size={10} />, pos: 'top-[7rem] left-1/2 -translate-x-1/2' },
    { id: 'legs', label: 'Piernas', icon: <Footprints size={10} />, pos: 'top-[9.5rem] left-1/2 -translate-x-1/2' },
  ];

  const itemData = selectedItem ? getItemData(selectedItem) : null;
  const selectedItemRarity = (() => {
    if (!selectedItem) return 'comun' as Rarity;
    const eq = Object.values(state.equipment) as (EquipSlot | null)[];
    const matched = eq.find(e => e?.id === selectedItem);
    return (matched?.rarity || itemData?.rarity || 'comun') as Rarity;
  })();
  const getEquippedId = (slot: string) => { const eq = state.equipment[slot as keyof typeof state.equipment] as EquipSlot | null; return eq?.id || null; };

  return (
    <div className="space-y-6 font-mono text-text-primary">
      {/* Visual Skeleton View */}
      <div className="relative w-full aspect-video bg-bg-deep border border-accent/50 rounded-none overflow-hidden flex items-center justify-center p-4 shadow-inner">
         <div className="absolute top-2 left-2 text-[8px] font-black uppercase text-accent tracking-[0.2em] opacity-40">Bio-Estructura Detectada</div>
         <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            <span className="text-[6px] font-black text-accent uppercase">Sincronización On</span>
         </div>

         <div className="relative w-40 h-[180px]">
            {/* Connection Lines (Glowy) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 160 180">
               <line x1="80" y1="20" x2="80" y2="60" stroke="#d4943a" strokeWidth="1" />
               <line x1="80" y1="70" x2="80" y2="110" stroke="#d4943a" strokeWidth="1" />
               <line x1="80" y1="120" x2="80" y2="155" stroke="#d4943a" strokeWidth="1" />
            </svg>

            {slots.map(s => {
               const eq: EquipSlot | null = state.equipment[s.id as keyof typeof state.equipment] as EquipSlot | null;
               const itemId = eq?.id || null;
               const data = itemId ? getItemData(itemId) : null;
               const eqRarity = eq?.rarity || data?.rarity;
               const rarityColor = itemId ? getRarityColor(eqRarity) : 'border-border opacity-40';
               const isSelected = selectedItem === itemId && itemId !== null;
               return (
                  <motion.div
                     key={s.id}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => itemId && setSelectedItem(itemId === selectedItem ? null : itemId)}
                    className={`absolute w-12 h-12 bg-bg-surface border-2 flex items-center justify-center transition-all shadow-md cursor-pointer rounded-full overflow-hidden ${rarityColor} ${s.pos} ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-deep' : ''}`}
                 >
                    <div className="w-full h-full flex items-center justify-center">{data?.icon ? <img src={data.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-xl">{data?.emoji || '➖'}</span>}</div>
                    <div className="absolute -bottom-4 text-[7px] font-black uppercase text-text-muted whitespace-nowrap opacity-60 group-hover:opacity-100">{s.label}</div>
                    {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-bg-surface" />}
                 </motion.div>
               );
            })}
         </div>
      </div>

      {/* Item Detail Panel */}
      <AnimatePresence mode="wait">
        {itemData ? (() => {
          const rarityCfg = RARITY_CONFIG[selectedItemRarity as Rarity];
          return (
            <motion.div
              key={selectedItem}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="parchment-panel border-2 p-4 relative overflow-hidden"
              style={{
                borderColor: rarityCfg?.color || '#8a7a60',
                backgroundColor: rarityCfg?.tint ? `color-mix(in srgb, ${rarityCfg.tint} 100%, #1a1410 88%)` : undefined,
                boxShadow: rarityCfg?.glow || 'none',
              }}
            >
              {/* ═══ RARITY TINT OVERLAY ═══ */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: rarityCfg?.tint || 'transparent' }} />

              {/* ═══ GHOST ICON WATERMARK ═══ */}
              {itemData.icon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <img
                    src={itemData.icon}
                    alt=""
                    className="w-[70%] h-[70%] object-contain opacity-[0.08]"
                    style={{ filter: 'saturate(0.3) brightness(1.5)' }}
                    loading="lazy"
                  />
                </div>
              )}

              {/* ═══ CONTENT (above watermark) ═══ */}
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className={`text-4xl bg-bg-deep p-3 border-2 shadow-inner rounded-full overflow-hidden w-16 h-16 flex items-center justify-center ${getRarityColor(selectedItemRarity)}`} style={rarityCfg?.glow ? { boxShadow: rarityCfg.glow } : undefined}>
                    {itemData.icon ? (
                      <img src={itemData.icon} alt={selectedItem || ''} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      itemData.emoji
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-display font-black text-accent uppercase tracking-tighter">{selectedItem}</h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 border border-current" style={rarityCfg ? { color: rarityCfg.color } : undefined}>
                        {rarityCfg?.label || selectedItemRarity}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed italic mb-3" style={{ color: 'var(--color-desc-item)' }}>"{itemData.desc}"</p>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(itemData.stats || {}).map(([stat, val]) => (
                        <div key={stat} className="flex justify-between items-center bg-bg-deep/90 px-2 py-1 border border-border">
                          <span className="text-[8px] uppercase font-black text-text-muted">{stat}</span>
                          <span className="text-[10px] font-black text-accent">+{scaleStat(val as number, itemData.rarity, selectedItemRarity)}</span>
                        </div>
                      ))}
                    </div>

                    {itemData.skillIds && itemData.skillIds.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest block mb-2">Habilidad Vinculada</span>
                        {itemData.skillIds.map((skillId: string) => {
                          const skill = TDB[skillId];
                          const eqSlot = Object.values(state.equipment).find(eq => eq?.id === selectedItem) as EquipSlot | null;
                          const skillRarity = eqSlot?.skillRarities?.[skillId] || selectedItemRarity;
                          const skillRarityCfg = RARITY_CONFIG[skillRarity as Rarity];
                          const skillMult = SKILL_RARITY_MULTIPLIER[skillRarity as Rarity];
                          return (
                            <div key={skillId} className="bg-bg-deep/90 border border-accent/50 p-2 mb-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">{skill?.icon ? <img src={skill.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : (skill?.emoji || '❓')}</span>
                                <span className="text-[10px] font-black text-text-primary uppercase tracking-tighter">{skillId}</span>
                                <span className="text-[7px] font-black px-1 py-px border border-current uppercase" style={{ color: skillRarityCfg?.color }}>{skillRarityCfg?.label || 'Normal'}</span>
                                <span className="text-[7px] text-text-muted">×{skillMult}</span>
                                <span className="ml-auto text-[9px] font-mono text-accent">COST: {skill?.cost} AP</span>
                              </div>
                              <p className="text-[9px] leading-tight" style={{ color: 'var(--color-desc-skill)' }}>{skill?.desc}</p>
                              <div className="mt-1 text-[8px] font-black text-accent/60 uppercase">Efecto: {skill?.damageRange}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-1 right-1 text-text-muted hover:text-accent p-1 z-20"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })() : (
          <div className="h-[120px] border-2 border-dashed border-border/70 flex items-center justify-center">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Selecciona una parte para analizar</p>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-px bg-border border border-border">
        <StatItem label="ATK" value={`${getAttack()}`} icon={<Sword size={12} />} />
        <StatItem label="DEF" value={`${getDefense()}`} icon={<Shield size={12} />} />
        <StatItem label="MAG" value={`${getMagic()}`} icon={<Flame size={12} />} />
        <StatItem label="MAG RES" value={`${getMagicRes()}`} icon={<Shield size={12} />} />
        <StatItem label="SPD" value={`${getSpeed()}`} icon={<Wind size={12} />} />
        <StatItem label="CRIT" value={`${getCrit()}%`} icon={<Zap size={12} />} />
        <StatItem label="Piezas" value={`${state.pieces}/${getMaxPieces()}`} icon={<Shield size={12} />} />
        <StatItem label="Victorias" value={state.wins.toString()} icon={<TrendingUp size={12} />} />
      </div>

      <div className="space-y-4 pt-4 border-t-2 border-border/70">
         <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-1 border-l-2 border-accent">
          SETS ACTIVOS
        </h4>
         <div className="space-y-2">
            {Object.keys(SETS as any).map(setName => {
              const count = (Object.values(state.equipment) as (EquipSlot | null)[]).filter(eq => eq && eq.id && getItemData(eq.id)?.set === setName).length;
              if (count < 2) return null;
             const setData = (SETS as any)[setName];
             return (
               <div key={setName} className="bg-bg-card p-3 border-2 border-accent/60 shadow-md">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-text-primary uppercase">{setData.name}</span>
                   <span className="text-[10px] font-black px-2 bg-accent text-bg-deep">{count} PARTES</span>
                 </div>
                 <div className="space-y-1">
                   {Object.keys(setData).filter(k => k.startsWith('bonus')).sort().map(bonusKey => {
                     const threshold = parseInt(bonusKey.replace('bonus', ''));
                     const bonus = setData[bonusKey];
                     const isActive = count >= threshold;
                     return (
                       <div key={bonusKey} className={`text-[8px] font-black uppercase ${isActive ? 'text-accent' : 'text-text-muted opacity-50'} ${isActive && threshold >= 4 ? 'glow-text' : ''}`}>
                         [{threshold}] {bonus.desc}
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })}
           {(Object.values(state.equipment) as (EquipSlot | null)[]).some(eq => eq && getItemData(eq.id)?.set) || <div className="text-center py-4 border-2 border-dashed border-border/50 text-[8px] font-black text-text-muted uppercase">Sin sets activos</div>}
        </div>
      </div>
    </div>
  );
}
