'use client';

import React from 'react';
import { EquipSlot } from '@/game/types';
import { getItemData, RARITY_CONFIG, Rarity } from '@/game/constants';

export function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'comun': return 'border-rarity-common';
    case 'normal': return 'border-rarity-normal';
    case 'raro': return 'border-rarity-rare';
    case 'epico': return 'border-rarity-epic';
    case 'legendario': return 'border-rarity-legendary';
    default: return 'border-border';
  }
}

interface EquipmentSlotProps {
  item: EquipSlot | string | null;
  title: string;
}

export function EquipmentSlot({ item, title }: EquipmentSlotProps) {
  const itemId = typeof item === 'string' ? item : item?.id || null;
  const data = itemId ? getItemData(itemId) : null;
  const itemRarity = !(typeof item === 'string') && item ? (item as EquipSlot).rarity || data?.rarity : data?.rarity;
  const rarityColor = data ? getRarityColor(itemRarity) : 'border-border opacity-40';
  const rarityCfg = RARITY_CONFIG[itemRarity as Rarity];
  const isLegendary = itemRarity === 'legendario';
  const isEpic = itemRarity === 'epico';
  const putrefaccionPct = item && !(typeof item === 'string') ? Math.floor((item as EquipSlot).putrefaccion / (data?.maxPutrefaccion || 20) * 100) : 100;
  const putrefaccionColor = putrefaccionPct > 50 ? 'bg-green-500' : putrefaccionPct > 25 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`aspect-square bg-bg-surface border-2 flex flex-col items-center justify-center rounded-none transition-all group relative ${rarityColor} ${isLegendary ? 'legendary-glow' : isEpic ? 'epic-glow' : ''}`}>
      <span className="text-[6px] absolute top-0.5 uppercase font-black opacity-30 group-hover:opacity-100 transition-opacity">{title}</span>
      <div className="text-xl sm:text-2xl">
        {data?.icon ? (
          <img src={data.icon} alt={title} className="w-7 h-7 object-contain" loading="lazy" />
        ) : (
          data ? data.emoji : '➖'
        )}
      </div>
      {rarityCfg && data && (
        <span className="text-[4px] font-black uppercase" style={{ color: rarityCfg.color }}>{rarityCfg.label}</span>
      )}
      {item && !(typeof item === 'string') && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-deep">
          <div className={`h-full ${putrefaccionColor} transition-all`} style={{ width: `${putrefaccionPct}%` }} />
        </div>
      )}
    </div>
  );
}
