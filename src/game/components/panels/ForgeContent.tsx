'use client';

import React, { useState, useMemo } from 'react';
import { EquipSlot, GameState, InventoryItem } from '@/game/types';
import { getItemData, EDB, RARITIES, RARITY_CONFIG, Rarity, scaleStat } from '@/game/constants';
import { getRarityColor } from '@/game/components/ui/EquipmentSlot';

interface ForgeContentProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playSound: (sound: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// ═══ FUSION LOGIC ═══

const FUSION_COSTS: Record<string, number> = {
  comun: 50,
  normal: 100,
  raro: 200,
  epico: 400,
  legendario: 0, // can't fuse legendary
};

const RARITY_TIERS = ['comun', 'normal', 'raro', 'epico', 'legendario'] as const;

/**
 * Resolve rarity from 3 inputs:
 * - 3/3 same → upgrade one tier
 * - 2/3 same → keep dominant (NO upgrade)
 * - all different → random among the 3
 */
function resolveFusionRarity(rarities: [Rarity, Rarity, Rarity]): Rarity {
  const counts: Record<string, number> = {};
  rarities.forEach(r => { counts[r] = (counts[r] || 0) + 1; });

  const entries = Object.entries(counts);
  const dominant = entries.reduce((a, b) => b[1] > a[1] ? b : a);

  if (dominant[1] === 3) {
    // 3/3 same → upgrade
    const idx = RARITY_TIERS.indexOf(dominant[0] as Rarity);
    if (idx >= RARITY_TIERS.length - 1) return 'legendario'; // already max
    return RARITY_TIERS[idx + 1];
  }

  if (dominant[1] === 2) {
    // 2/3 same → keep dominant, NO upgrade
    return dominant[0] as Rarity;
  }

  // All different → random among the 3
  return rarities[Math.floor(Math.random() * 3)];
}

/**
 * Perform fusion: consume 3 identical items, produce 1 new with resolved rarities.
 */
function performFusion(items: [InventoryItem, InventoryItem, InventoryItem], state: GameState): GameState {
  const [a, b, c] = items;
  const data = getItemData(a.id);
  if (!data) return state;

  // Resolve item rarity
  const itemRarities: [Rarity, Rarity, Rarity] = [a.rarity, b.rarity, c.rarity];
  const resultItemRarity = resolveFusionRarity(itemRarities);

  // Resolve each skill rarity independently
  const resultSkillRarities: Record<string, Rarity> = {};
  if (data.skillIds) {
    data.skillIds.forEach((skillId: string) => {
      const sRarities: [Rarity, Rarity, Rarity] = [
        a.skillRarities?.[skillId] || a.rarity,
        b.skillRarities?.[skillId] || b.rarity,
        c.skillRarities?.[skillId] || c.rarity,
      ];
      resultSkillRarities[skillId] = resolveFusionRarity(sRarities);
    });
  }

  // Putrefacción = average of the 3 (R2)
  const dataA = getItemData(a.id);
  const dataB = getItemData(b.id);
  const dataC = getItemData(c.id);
  // For inventory items, putrefaccion isn't stored — use max from data
  const maxPutr = data?.maxPutrefaccion || 20;
  const avgPutr = Math.floor(maxPutr * 0.7); // fused items start at 70% durability

  // Cost = based on highest rarity among inputs
  const highestRarityIdx = Math.max(...itemRarities.map(r => RARITY_TIERS.indexOf(r)));
  const cost = FUSION_COSTS[RARITY_TIERS[highestRarityIdx]] || 100;

  // Build new inventory: remove the 3 fused items, add the result
  const newInv = [...state.inventory];
  const toRemove = [a, b, c];
  toRemove.forEach(item => {
    const idx = newInv.findIndex(i => i.id === item.id && i.rarity === item.rarity);
    if (idx >= 0) newInv.splice(idx, 1);
  });

  newInv.push({
    id: a.id,
    rarity: resultItemRarity,
    skillRarities: resultSkillRarities,
  });

  return {
    ...state,
    inventory: newInv,
    resources: {
      ...state.resources,
      shards: state.resources.shards - cost,
    },
  };
}

// ═══ COMPONENT ═══

export function ForgeContent({ state, setGameState, playSound, showToast }: ForgeContentProps) {
  const [forgeTab, setForgeTab] = useState<'repair' | 'fusion'>('fusion');
  const [fusionSelected, setFusionSelected] = useState<number[]>([]); // indices into inventory

  // Group inventory items by id (same piece name)
  const itemGroups = useMemo(() => {
    const groups: Record<string, { item: InventoryItem; indices: number[] }[]> = {};
    state.inventory.forEach((item, idx) => {
      if (!groups[item.id]) groups[item.id] = [];
      groups[item.id].push({ item, indices: [idx] });
    });
    // Merge same id+rarity entries
    const mergedGroups: Record<string, { items: InventoryItem[]; indices: number[] }> = {};
    Object.entries(groups).forEach(([id, entries]) => {
      entries.forEach(e => {
        const key = id;
        if (!mergedGroups[key]) mergedGroups[key] = { items: [], indices: [] };
        mergedGroups[key].items.push(e.item);
        mergedGroups[key].indices.push(...e.indices);
      });
    });
    return mergedGroups;
  }, [state.inventory]);

  // Items eligible for fusion (3+ copies of same name)
  const fusionEligible = useMemo(() => {
    return Object.entries(itemGroups).filter(([, group]) => group.items.length >= 3);
  }, [itemGroups]);

  // Currently selected group for fusion
  const selectedGroupId = fusionSelected.length > 0
    ? state.inventory[fusionSelected[0]]?.id
    : null;

  const toggleFusionItem = (idx: number) => {
    const item = state.inventory[idx];
    if (!item) return;

    if (fusionSelected.includes(idx)) {
      setFusionSelected(prev => prev.filter(i => i !== idx));
    } else {
      if (fusionSelected.length >= 3) return;
      // Must be same id as already selected
      if (fusionSelected.length > 0) {
        const firstItem = state.inventory[fusionSelected[0]];
        if (firstItem?.id !== item.id) return;
      }
      setFusionSelected(prev => [...prev, idx]);
    }
  };

  const doFusion = () => {
    if (fusionSelected.length !== 3) return;
    const items = fusionSelected.map(i => state.inventory[i]) as [InventoryItem, InventoryItem, InventoryItem];
    const data = getItemData(items[0].id);
    if (!data) return;

    // Calculate cost
    const highestRarityIdx = Math.max(...items.map(i => RARITY_TIERS.indexOf(i.rarity)));
    const cost = FUSION_COSTS[RARITY_TIERS[highestRarityIdx]] || 100;

    if (state.resources.shards < cost) {
      showToast(`Necesitas ${cost} 💎`, "error");
      return;
    }

    // Check if trying to fuse 3 legendary items (can't go higher)
    if (items.every(i => i.rarity === 'legendario')) {
      showToast("No se puede mejorar más allá de Legendario", "info");
      return;
    }

    const newState = performFusion(items, state);
    setGameState(newState);
    playSound('forge');
    showToast(`¡Fusión completada! ${items[0].id} transformado`, "success");
    setFusionSelected([]);
  };

  // ═══ Repair logic — uses shards ═══
  const repairItem = (slot: string) => {
    const eq = state.equipment[slot as keyof typeof state.equipment] as EquipSlot | null;
    if (!eq) return;
    const maxPutr = 20; // Fixed max putrefaccion
    if (eq.putrefaccion >= maxPutr) {
      showToast("Esta pieza está como nueva", "info");
      return;
    }
    const cost = Math.ceil((maxPutr - eq.putrefaccion) / 3) * 10; // shards cost
    if (state.resources.shards < cost) {
      showToast(`Necesitas ${cost} 💎 Shards`, "error");
      return;
    }
    setGameState((prev: any) => {
      const newEquip = { ...prev.equipment };
      (newEquip as any)[slot] = { ...eq, putrefaccion: maxPutr };
      return { ...prev, equipment: newEquip, resources: { ...prev.resources, shards: prev.resources.shards - cost } };
    });
    showToast(`${eq.id} reparada al máximo!`, "success");
    playSound('forge');
  };



  const slots = [
    { id: 'head', label: 'Cabeza' },
    { id: 'torso', label: 'Torso' },
    { id: 'arms', label: 'Brazos' },
    { id: 'legs', label: 'Piernas' },
  ];

  // ═══ Calculate fusion cost preview ═══
  const fusionCostPreview = useMemo(() => {
    if (fusionSelected.length !== 3) return null;
    const items = fusionSelected.map(i => state.inventory[i]);
    const highestRarityIdx = Math.max(...items.map(i => RARITY_TIERS.indexOf(i.rarity)));
    return FUSION_COSTS[RARITY_TIERS[highestRarityIdx]] || 100;
  }, [fusionSelected, state.inventory]);

  return (
    <div className="space-y-4 font-mono">
      <div className="p-3 bg-accent/15 border border-accent/50 text-accent text-[10px] font-black uppercase italic">
        "Une tus restos con esencia viva para trascender tu forma ósea."
      </div>

      <div className="flex border-b-2 border-border">
        <button onClick={() => { setForgeTab('fusion'); setFusionSelected([]); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${forgeTab === 'fusion' ? 'bg-accent text-bg-deep' : 'text-text-muted hover:bg-bg-surface'}`}>
          🔥 Fusionar
        </button>
        <button onClick={() => setForgeTab('repair')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${forgeTab === 'repair' ? 'bg-accent text-bg-deep' : 'text-text-muted hover:bg-bg-surface'}`}>
          🔧 Reparar
        </button>

      </div>

      {/* ═══ FUSION TAB ═══ */}
      {forgeTab === 'fusion' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[9px] text-text-muted italic leading-relaxed">
              Fusiona 3 piezas idénticas. La rareza resultante depende de las 3 entradas:
              <br />• <span className="text-accent font-black">3 iguales</span> → sube un tier
              <br />• <span className="text-accent font-black">2 iguales</span> → se mantiene la dominante
              <br />• <span className="text-accent font-black">3 distintas</span> → aleatorio entre las 3
              <br />La rareza de pieza y skill se calculan por separado.
            </div>
          </div>

          {/* Selection slots */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(slot => {
              const selectedIdx = fusionSelected[slot];
              const item = selectedIdx !== undefined ? state.inventory[selectedIdx] : null;
              const data = item ? getItemData(item.id) : null;
              const itemRarity = item?.rarity || data?.rarity;
              const rarityCfg = itemRarity ? RARITY_CONFIG[itemRarity as Rarity] : null;
              return (
                <div
                  key={slot}
                  onClick={() => {
                    if (item) {
                      setFusionSelected(prev => prev.filter((_, i) => i !== slot));
                    }
                  }}
                  className={`w-20 h-24 border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                    item
                      ? `bg-bg-card ${getRarityColor(itemRarity)} ${rarityCfg?.glow ? 'shadow-lg' : ''}`
                      : 'bg-bg-surface/30 border-border/50 border-dashed opacity-40'
                  }`}
                  style={item && rarityCfg?.glow ? { boxShadow: rarityCfg.glow } : undefined}
                >
                  {item ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFusionSelected(prev => prev.filter((_, i) => i !== slot)); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[8px] font-black flex items-center justify-center z-10"
                      >✕</button>
                      <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                        {data?.icon ? <img src={data.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : (data?.emoji || '❓')}
                      </div>
                      <span className="text-[6px] font-black uppercase mt-1" style={{ color: rarityCfg?.color }}>{rarityCfg?.label || ''}</span>
                      {data?.skillIds && data.skillIds.map((s: string) => {
                        const sRarity = item.skillRarities?.[s] || item.rarity;
                        const sCfg = RARITY_CONFIG[sRarity as Rarity];
                        return <span key={s} className="text-[5px]" style={{ color: sCfg?.color }}>⚡{sCfg?.label}</span>;
                      })}
                    </>
                  ) : (
                    <span className="text-[8px] text-text-muted">{slot + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cost preview */}
          {fusionCostPreview !== null && (
            <div className="text-center text-[9px] font-black">
              <span className={state.resources.shards >= fusionCostPreview ? 'text-accent' : 'text-danger'}>
                Costo: {fusionCostPreview} 💎
              </span>
              <span className="text-text-muted ml-2">(Tienes: {state.resources.shards}💎)</span>
            </div>
          )}

          {/* Fuse button */}
          <button
            onClick={doFusion}
            disabled={fusionSelected.length !== 3 || (fusionCostPreview !== null && state.resources.shards < fusionCostPreview)}
            className={`w-full py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
              fusionSelected.length === 3 && (!fusionCostPreview || state.resources.shards >= fusionCostPreview)
                ? 'bg-accent text-bg-deep shadow-glow hover:scale-[1.02] active:scale-95'
                : 'bg-bg-surface text-text-muted cursor-not-allowed opacity-40'
            }`}
          >
            🔥 FUSIONAR {fusionSelected.length}/3
          </button>

          {/* Available items for fusion */}
          <div className="space-y-2">
            <div className="text-[8px] font-black text-text-muted uppercase tracking-widest border-b border-border pb-1">
              Piezas disponibles ({fusionEligible.length} tipos con 3+ copias)
            </div>

            {fusionEligible.length === 0 ? (
              <div className="p-6 border border-dashed border-border text-center text-[10px] text-text-muted italic">
                Necesitas 3 piezas iguales para fusionar.
                <br /><span className="text-[8px]">¡Sigue combatiendo para obtener más!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {fusionEligible.map(([itemId, group]) => {
                  const data = getItemData(itemId);
                  if (!data) return null;
                  return group.items.map((item, i) => {
                    const invIdx = group.indices[i];
                    const itemRarity = item.rarity || data.rarity;
                    const rarityCfg = RARITY_CONFIG[itemRarity as Rarity];
                    const isSelected = fusionSelected.includes(invIdx);
                    const canSelect = !isSelected && (fusionSelected.length < 3) && (fusionSelected.length === 0 || state.inventory[fusionSelected[0]]?.id === itemId);
                    return (
                      <div
                        key={`${itemId}-${i}`}
                        onClick={() => (isSelected || canSelect) && toggleFusionItem(invIdx)}
                        className={`p-2 border-2 flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-accent bg-accent/20 shadow-[0_0_8px_rgba(212,148,58,0.3)]'
                            : canSelect
                              ? `bg-bg-card ${getRarityColor(itemRarity)} hover:border-accent/60`
                              : `bg-bg-card ${getRarityColor(itemRarity)} opacity-40 cursor-not-allowed`
                        }`}
                        style={!isSelected && rarityCfg?.glow ? { boxShadow: rarityCfg.glow } : undefined}
                      >
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {data.icon ? <img src={data.icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : (data.emoji || '❓')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[7px] font-black text-text-primary truncate">{itemId}</div>
                          <div className="flex gap-1 items-center">
                            <span className="text-[6px] font-black uppercase" style={{ color: rarityCfg?.color }}>{rarityCfg?.label}</span>
                            {data.skillIds?.map((s: string) => {
                              const sRarity = item.skillRarities?.[s] || item.rarity;
                              const sCfg = RARITY_CONFIG[sRarity as Rarity];
                              return <span key={s} className="text-[5px]" style={{ color: sCfg?.color }}>⚡{sCfg?.label}</span>;
                            })}
                          </div>
                        </div>
                        {isSelected && <span className="text-accent text-[10px]">✓</span>}
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ REPAIR TAB ═══ */}
      {forgeTab === 'repair' && (
        <div className="space-y-3">
          <div className="text-[10px] text-text-muted italic">Repara tus piezas equipadas usando fragmentos. Cada pieza tiene 20 usos por habilidad.</div>
          {slots.map(slot => {
            const eq = state.equipment[slot.id as keyof typeof state.equipment] as EquipSlot | null;
            if (!eq) return null;
            const itemData = getItemData(eq.id);
            if (!itemData) return null;
            const maxPutr = 20; // Fixed max putrefaccion
            const pct = Math.floor(eq.putrefaccion / maxPutr * 100);
            const cost = Math.ceil((maxPutr - eq.putrefaccion) / 3) * 10;
            const hasShards = state.resources.shards >= cost;
            return (
              <div key={slot.id} className="p-3 bg-bg-card border border-border flex items-center gap-3">
                <div className="text-2xl">
                  {itemData.icon ? (
                    <img src={itemData.icon} alt={eq.id} className="w-7 h-7 object-contain" loading="lazy" />
                  ) : (
                    itemData.emoji
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-text-primary uppercase">{eq.id}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-bg-deep">
                      <div className={`h-full ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[8px] text-text-muted">Usos: {eq.putrefaccion}/{maxPutr}</span>
                  </div>
                </div>
                <button
                  onClick={() => repairItem(slot.id)}
                  disabled={!hasShards || eq.putrefaccion >= maxPutr}
                  className="px-3 py-2 bg-accent/30 border border-accent text-[8px] font-black uppercase disabled:opacity-30 hover:bg-accent/50 transition-colors"
                >
                  💎 {cost}
                </button>
              </div>
            );
          })}
          {!slots.some(s => state.equipment[s.id as keyof typeof state.equipment]) && (
            <div className="p-6 border border-dashed border-border text-center text-[10px] text-text-muted">No hay piezas equipadas para reparar.</div>
          )}
        </div>
      )}


    </div>
  );
}
