'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Sword, Shield, Zap, Activity, Footprints, Package, Backpack, X, Flame, Wind } from 'lucide-react';
import { InventoryItem, EquipSlot, GameState } from '@/game/types';
import { getItemData, SETS, TDB, RARITY_CONFIG, RARITY_STAT_FACTOR, Rarity, scaleStat, SKILL_RARITY_MULTIPLIER } from '@/game/constants';
import { StatItem } from '@/game/components/ui/StatItem';
import { getRarityColor } from '@/game/components/ui/EquipmentSlot';

interface InventoryContentProps {
  state: GameState;
  onEquip: (item: InventoryItem) => void;
  onUnequip: (slot: string) => void;
  onUse: (id: string) => void;
  onEquipConsumable: (slotIndex: 0 | 1, itemId: string) => void;
  getMaxPieces: () => number;
  getAttack: () => number;
  getDefense: () => number;
  getMagic: () => number;
  getMagicRes: () => number;
  getSpeed: () => number;
  getCrit: () => number;
}

export function InventoryContent({ state, onEquip, onUnequip, onUse, onEquipConsumable, getMaxPieces, getAttack, getDefense, getMagic, getMagicRes, getSpeed, getCrit }: InventoryContentProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [highlightSlot, setHighlightSlot] = useState<string | null>(null);
  const [showEquipSlot, setShowEquipSlot] = useState<0 | 1 | null>(null);

  const supplies = [
    { id: 'potion', name: 'Pociones', count: state.resources.potions, emoji: '🧪', type: 'consumable' as const },
  ];

  const consumableSlots = state.consumableSlots || [null, null];

  const categories = [
    { id: 'all', name: 'Todo', icon: <Package size={12} /> },
    { id: 'head', name: 'Cabeza', icon: <Skull size={12} /> },
    { id: 'torso', name: 'Torso', icon: <Activity size={12} /> },
    { id: 'arms', name: 'Brazos', icon: <Sword size={12} /> },
    { id: 'legs', name: 'Piernas', icon: <Footprints size={12} /> }
  ];

  const skeletonSlots = [
    { id: 'head', label: 'Cráneo', icon: <Skull size={10} /> },
    { id: 'torso', label: 'Torso', icon: <Activity size={10} /> },
    { id: 'arms', label: 'Brazos', icon: <Sword size={10} /> },
    { id: 'legs', label: 'Piernas', icon: <Footprints size={10} /> },
  ];

  const filteredItems = state.inventory.filter((item: InventoryItem) => {
    if (filter === 'all') return true;
    const data = getItemData(item.id);
    if (!data) return false;
    return data.slot === filter;
  });

  const getMatchingSlot = (itemSlot: string) => {
    if (itemSlot === 'head') return 'head';
    if (itemSlot === 'torso') return 'torso';
    if (itemSlot === 'arms') return 'arms';
    if (itemSlot === 'legs') return 'legs';
    return null;
  };

  const getHighlightedSlots = (itemSlot: string): string[] => {
    return [itemSlot];
  };

  const activeHighlights = selectedItem ? (() => {
    const data = getItemData(selectedItem.id);
    if (!data) return [] as string[];
    return getHighlightedSlots(data.slot);
  })() : (highlightSlot ? getHighlightedSlots(highlightSlot) : []);

  // selectedSlot tells us WHERE the item was selected from:
  // - null → from inventory grid → always show INJERTAR EN CUERPO
  // - 'head'/'torso'/'arms'/'legs' → from equipment slot → show DESEQUIPAR
  const isFromEquipment = selectedSlot !== null;

  return (
    <div className="parchment-panel font-mono text-text-primary">
      {/* ═══ ALL CONTENT ═══ */}
      <div className="relative z-[2] space-y-4">

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (() => {
            const data = getItemData(selectedItem.id);
            if (!data) return null;
            const itemRarity = selectedItem.rarity || data.rarity;
            const rarityCfg = RARITY_CONFIG[itemRarity as Rarity];
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85"
                onClick={() => { setSelectedItem(null); setSelectedSlot(null); setHighlightSlot(null); }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="parchment-panel border-2 p-6 w-full max-w-[340px] shadow-2xl relative overflow-hidden"
                  style={{
                    borderColor: rarityCfg?.color || '#8a7a60',
                    boxShadow: rarityCfg?.glow || 'none',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* ═══ RARITY TINT OVERLAY ═══ */}
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: rarityCfg?.tint || 'transparent' }} />

                  {/* ═══ GHOST ICON WATERMARK ═══ */}
                  {data.icon && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      <img
                        src={data.icon}
                        alt=""
                        className="w-[70%] h-[70%] object-contain opacity-[0.08]"
                        style={{ filter: 'saturate(0.3) brightness(1.5)' }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* ═══ CONTENT ═══ */}
                  <div className="relative z-10">
                    <button onClick={() => { setSelectedItem(null); setSelectedSlot(null); setHighlightSlot(null); }} className="absolute -top-2 -right-2 text-text-muted hover:text-danger z-20"><X size={20} /></button>
                    <div className="flex gap-4 mb-6 pt-2">
                      <div className={`w-20 h-20 bg-bg-deep border-2 flex items-center justify-center text-4xl shadow-md rounded-full overflow-hidden ${getRarityColor(itemRarity)}`} style={rarityCfg?.glow ? { boxShadow: rarityCfg.glow } : undefined}>
                        {data.icon ? (
                          <img src={data.icon} alt={selectedItem.id} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          data.emoji || '❓'
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-accent uppercase leading-none mb-1">{selectedItem.id}</h3>
                        <div className="flex gap-2 mb-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 border border-current uppercase ${getRarityColor(itemRarity)}`} style={rarityCfg ? { color: rarityCfg.color } : undefined}>{rarityCfg?.label || itemRarity}</span>
                          <span className="text-[8px] font-black px-1.5 py-0.5 border border-border text-text-muted uppercase">{data.slot}</span>
                        </div>
                        <p className="text-[10px] leading-tight italic" style={{ color: 'var(--color-desc-item)' }}>{data.desc}</p>
                      </div>
                    </div>

                    <div className="bg-bg-deep/90 p-4 border border-border mb-6">
                      <div className="text-[9px] font-black text-text-muted uppercase mb-2 border-b border-border pb-1">Atributos del Injerto</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(data.stats || {}).map(([stat, val]) => (
                          <div key={stat} className="flex justify-between items-center py-1">
                            <span className="text-[9px] uppercase text-text-secondary">{stat}</span>
                            <span className="text-xs font-bold text-accent">+{scaleStat(val as number, data.rarity, itemRarity)}</span>
                          </div>
                        ))}
                      </div>
                      {data.skillIds && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-[9px] font-black text-text-muted uppercase mb-1">Nexo Neuronal</div>
                          {data.skillIds.map((s: string) => {
                            const tech = TDB[s];
                            const skillRarity = selectedItem.skillRarities?.[s] || itemRarity;
                            const skillRarityCfg = RARITY_CONFIG[skillRarity as Rarity];
                            const skillMult = SKILL_RARITY_MULTIPLIER[skillRarity as Rarity];
                            return (
                              <div key={s} className="bg-bg-deep/80 border border-accent/30 p-2 mb-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                  {tech?.icon ? <span className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"><img src={tech.icon} alt="" className="w-full h-full object-cover" loading="lazy" /></span> : <Zap size={10} />}
                                  <span className="text-[10px] font-black text-text-primary uppercase" style={skillRarityCfg ? { color: skillRarityCfg.color } : undefined}>{tech?.name || s}</span>
                                  <span className="text-[7px] font-black px-1 py-px border border-current uppercase" style={{ color: skillRarityCfg?.color }}>{skillRarityCfg?.label || 'Normal'}</span>
                                  <span className="text-[7px] text-text-muted">×{skillMult}</span>
                                  <span className="ml-auto text-[9px] font-mono text-accent">COST: {tech?.cost} AP</span>
                                </div>
                                <p className="text-[9px] leading-tight" style={{ color: 'var(--color-desc-skill)' }}>{tech?.desc}</p>
                                <div className="mt-1 text-[8px] font-black text-accent/60 uppercase">Efecto: {tech?.damageRange}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {isFromEquipment ? (
                      <button
                        onClick={() => { onUnequip(selectedSlot!); setSelectedItem(null); setSelectedSlot(null); setHighlightSlot(null); }}
                        className="w-full bg-danger text-bg-deep py-4 font-black text-sm uppercase tracking-[0.2em] shadow-glow hover:brightness-110 active:scale-95 transition-all"
                      >
                        DESEQUIPAR
                      </button>
                    ) : (
                      <button
                        onClick={() => { onEquip(selectedItem); setSelectedItem(null); setSelectedSlot(null); setHighlightSlot(null); }}
                        className="w-full bg-accent text-bg-deep py-4 font-black text-sm uppercase tracking-[0.2em] shadow-glow hover:brightness-110 active:scale-95 transition-all"
                        style={rarityCfg?.glow ? { boxShadow: rarityCfg.glow } : undefined}
                      >
                        INJERTAR EN CUERPO
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Main Layout: Skeleton Left + Items Right */}
        <div className="flex gap-3">
          {/* Left: Skeleton / Character Equipment */}
          <div className="w-[130px] flex-shrink-0 bg-bg-deep/50 border border-accent/30 p-2 flex flex-col items-center gap-1">
            <div className="text-[7px] font-black uppercase text-accent/50 tracking-[0.2em] mb-1">Bio-Estructura</div>

            {skeletonSlots.map(s => {
              const eq: EquipSlot | null = state.equipment[s.id as keyof typeof state.equipment] as EquipSlot | null;
              const itemId = eq?.id || null;
              const data = itemId ? getItemData(itemId) : null;
              const eqRarity = eq?.rarity || data?.rarity;
              const rarityColor = itemId ? getRarityColor(eqRarity) : 'border-border/40';
              const isLegendary = eqRarity === 'legendario';
              const isEpic = eqRarity === 'epico';
              const rarityCfg = RARITY_CONFIG[eqRarity as Rarity];
              const isHighlighted = activeHighlights.includes(s.id);
              const isSelectedEquipped = selectedSlot === s.id;
              return (
                <motion.div
                  key={s.id}
                  whileHover={itemId ? { scale: 1.03 } : {}}
                  whileTap={itemId ? { scale: 0.97 } : {}}
                  animate={isHighlighted ? { scale: [1, 1.08, 1], borderColor: '#d4943a' } : {}}
                  transition={{ repeat: isHighlighted ? Infinity : 0, duration: 0.8 }}
                  onClick={() => {
                    if (itemId) {
                      // ALWAYS use the equipped item's data, never search inventory
                      const eqItem: InventoryItem = { id: itemId, rarity: eq?.rarity || 'comun', skillRarities: eq?.skillRarities || {} };
                      if (isSelectedEquipped) {
                        setSelectedItem(null);
                        setSelectedSlot(null);
                        setHighlightSlot(null);
                      } else {
                        setSelectedItem(eqItem);
                        setSelectedSlot(s.id);
                        setHighlightSlot(s.id);
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-1.5 p-1 border transition-all ${itemId ? 'cursor-pointer hover:border-accent/80' : 'opacity-40 cursor-default'} ${rarityColor} ${isLegendary ? 'legendary-glow' : isEpic ? 'epic-glow' : ''} ${isHighlighted ? 'border-accent shadow-[0_0_8px_rgba(212,148,58,0.4)]' : ''} ${isSelectedEquipped ? 'ring-1 ring-accent' : ''}`}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-bg-surface/50 text-base flex-shrink-0 rounded-full overflow-hidden">{data?.icon ? <img src={data.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : (data?.emoji || '➖')}</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[6px] font-black uppercase text-text-muted tracking-wider">{s.label}</span>
                    <span className="text-[7px] font-bold text-accent truncate">{data?.name || 'Vacío'}</span>
                    {rarityCfg && itemId && <span className="text-[5px] font-black uppercase" style={{ color: rarityCfg.color }}>{rarityCfg.label}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Consumibles + Grid */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Consumible Slots — click equipped slot to consume outside combat */}
            <div className="flex gap-2">
              {consumableSlots.map((slotItem, idx) => {
                const slotIdx = idx as 0 | 1;
                if (slotItem === 'potion') {
                  return (
                    <div key={idx} onClick={() => onUse('potion')} className="flex-1 bg-bg-deep/30 border border-green-400/40 p-2 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors group">
                      <span className="text-lg group-hover:scale-110 transition-transform">🧪</span>
                      <span className="text-[9px] font-black text-green-400">x{state.resources.potions}</span>
                      <span className="text-[6px] font-bold text-text-muted uppercase">Poción</span>
                    </div>
                  );
                }
                if (slotItem && slotItem !== 'potion') {
                  // Other consumable equipped
                  return (
                    <div key={idx} className="flex-1 bg-bg-deep/30 border border-accent/40 p-2 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors group">
                      <span className="text-lg group-hover:scale-110 transition-transform">📦</span>
                      <span className="text-[6px] font-bold text-text-muted uppercase">{slotItem}</span>
                    </div>
                  );
                }
                // Empty slot — click to equip a consumable
                return (
                  <div 
                    key={idx} 
                    onClick={() => setShowEquipSlot(showEquipSlot === slotIdx ? null : slotIdx)}
                    className="flex-1 bg-bg-deep/30 border border-dashed border-border/50 p-2 flex flex-col items-center justify-center cursor-pointer hover:border-accent/60 transition-colors"
                  >
                    <span className="text-lg opacity-40">➕</span>
                    <span className="text-[6px] font-bold text-text-muted uppercase">Slot {idx + 1}</span>
                  </div>
                );
              })}
            </div>
            {/* Equip consumable to empty slot */}
            {showEquipSlot !== null && (
              <div className="bg-bg-card border border-accent/40 p-2 space-y-1">
                <div className="text-[7px] font-black text-accent uppercase tracking-widest">Equipar en Slot {showEquipSlot + 1}</div>
                {supplies.filter(s => s.type === 'consumable' && s.count > 0).map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onEquipConsumable(showEquipSlot, s.id); setShowEquipSlot(null); }}
                    className="w-full flex items-center gap-2 p-2 bg-bg-deep/50 border border-border hover:border-accent transition-colors"
                  >
                    <span>{s.emoji}</span>
                    <span className="text-[8px] font-black text-text-primary uppercase">{s.name}</span>
                    <span className="text-[7px] text-text-muted ml-auto">x{s.count}</span>
                  </button>
                ))}
                {supplies.filter(s => s.type === 'consumable' && s.count > 0).length === 0 && (
                  <div className="text-[8px] text-text-muted italic text-center py-2">No hay consumibles</div>
                )}
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-1 px-2 py-1 border text-[8px] font-black uppercase tracking-tighter transition-all whitespace-nowrap
                  ${filter === cat.id ? 'bg-accent text-bg-deep border-accent' : 'bg-bg-surface/50 border-border text-text-muted hover:border-accent hover:text-accent'}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* RPG Grid */}
            <div className="bg-bg-deep/30 p-2 border-2 border-border min-h-[200px] flex-1">
              <div className="grid grid-cols-4 gap-1.5">
                {filteredItems.map((item: InventoryItem, idx: number) => {
                  const data = getItemData(item.id);
                  const itemRarity = item.rarity || data?.rarity;
                  const rarityColor = getRarityColor(itemRarity);
                  const rarityCfg = RARITY_CONFIG[itemRarity as Rarity];
                  const isLegendary = itemRarity === 'legendario';
                  const isEpic = itemRarity === 'epico';
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedItem(item); setSelectedSlot(null); data && setHighlightSlot(getMatchingSlot(data.slot)); }}
                      onMouseEnter={() => data && setHighlightSlot(getMatchingSlot(data.slot))}
                      onMouseLeave={() => !selectedItem && setHighlightSlot(null)}
                      className={`aspect-square bg-bg-card border-2 ${rarityColor} flex flex-col items-center justify-center cursor-pointer shadow-md relative group ${isLegendary ? 'legendary-glow' : isEpic ? 'epic-glow' : ''}`}
                    >
                      <div className="text-xl group-hover:drop-shadow-[0_0_8px_rgba(212,148,58,0.5)] w-full h-full flex items-center justify-center">{data?.icon ? <img src={data.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : data?.emoji}</div>
                      {/* Rarity label */}
                      {rarityCfg && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[5px] font-black uppercase tracking-wider py-px" style={{ color: rarityCfg.color, backgroundColor: 'rgba(0,0,0,0.7)' }}>{rarityCfg.label}</span>
                      )}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  );
                })}
                {Array.from({ length: Math.max(0, 12 - filteredItems.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-bg-surface/30 border border-border/50 flex items-center justify-center opacity-30">
                    <Package size={12} />
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-50">
                  <Backpack size={32} className="mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Sección vacía</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-border border border-border">
          <StatItem label="ATK" value={`${getAttack()}`} icon={<Sword size={10} />} />
          <StatItem label="DEF" value={`${getDefense()}`} icon={<Shield size={10} />} />
          <StatItem label="MAG" value={`${getMagic()}`} icon={<Flame size={10} />} />
          <StatItem label="MAG RES" value={`${getMagicRes()}`} icon={<Shield size={10} />} />
          <StatItem label="SPD" value={`${getSpeed()}`} icon={<Wind size={10} />} />
          <StatItem label="CRIT" value={`${getCrit()}%`} icon={<Zap size={10} />} />
        </div>

        {/* Active Sets */}
        <div className="space-y-2 pt-2 border-t border-border/70">
          <h4 className="text-[8px] font-black text-accent uppercase tracking-[0.2em] px-1 border-l-2 border-accent">
            Sets Activos
          </h4>
          <div className="space-y-1.5">
            {Object.keys(SETS as any).map(setName => {
              const RARE_PLUS = ['raro', 'epico', 'legendario'];
              const count = (Object.values(state.equipment) as (EquipSlot | null)[]).filter(eq => eq && eq.id && getItemData(eq.id)?.set === setName && RARE_PLUS.includes(eq.rarity)).length;
              const totalPieces = (Object.values(state.equipment) as (EquipSlot | null)[]).filter(eq => eq && eq.id && getItemData(eq.id)?.set === setName).length;
              if (totalPieces < 1) return null;
              const setData = (SETS as any)[setName];
              return (
                <div key={setName} className="bg-bg-card/50 p-2 border border-accent/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-text-primary uppercase">{setData.name}</span>
                    <span className="text-[8px] font-black px-1.5 bg-accent text-bg-deep">{count}/{totalPieces} RARAS+</span>
                  </div>
                  <div className="text-[6px] text-text-muted italic mb-1">Solo piezas raras o superior activan bonos</div>
                  <div className="space-y-0.5">
                    {Object.keys(setData).filter(k => k.startsWith('bonus')).sort().map(bonusKey => {
                      const threshold = parseInt(bonusKey.replace('bonus', ''));
                      const bonus = setData[bonusKey];
                      const isActive = count >= threshold;
                      return (
                        <div key={bonusKey} className={`text-[7px] font-black uppercase ${isActive ? 'text-accent' : 'text-text-muted opacity-50'} ${isActive && threshold >= 4 ? 'glow-text' : ''}`}>
                          [{threshold}] {bonus.desc}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {(Object.values(state.equipment) as (EquipSlot | null)[]).some(eq => eq && getItemData(eq.id)?.set) || <div className="text-center py-2 border border-dashed border-border/50 text-[7px] font-black text-text-muted uppercase">Sin sets activos</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
