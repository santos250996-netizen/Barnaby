'use client';

import React from 'react';
import { Book } from 'lucide-react';
import { GameState } from '@/game/types';
import { LOC, ENM, getItemData, RARITY_CONFIG, Rarity } from '@/game/constants';

interface BestiaryContentProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function BestiaryContent({ state, setGameState, showToast }: BestiaryContentProps) {
  const zones = Object.keys(LOC).filter(k => !LOC[k].isTown);

  return (
    <div className="space-y-4 font-mono max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Book size={16} className="text-accent" />
        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bestiario</h4>
        <span className="ml-auto text-[8px] text-text-muted">{Object.keys(state.bestiary || {}).length} / 65 enemigos</span>
      </div>
      {zones.map(zoneId => {
        const locData = LOC[zoneId];
        const zoneEnemies = locData.enemies || [];
        return (
          <div key={zoneId} className="space-y-1">
            <h5 className="text-[9px] font-black text-accent uppercase tracking-tight sticky top-0 bg-bg-deep py-1 z-10">{zoneId}</h5>
            <div className="grid grid-cols-1 gap-1">
              {zoneEnemies.map((ename: string) => {
                const eDef = ENM[ename];
                const entry = state.bestiary?.[ename];
                const kills = entry?.kills || 0;
                const dropsFound = entry?.dropsFound || [];
                const totalParts = eDef?.parts?.length || 6;
                const ENEMY_ICONS: Record<string, string> = {
                  'Jabalí': '/game/ui/icon-jabali.png',
                };
                const iconSrc = ENEMY_ICONS[ename];
                // Get rarity color for each part dot
                const partRarityColors = eDef?.parts?.map((p: any) => {
                  const partData = getItemData(p.name);
                  const rarity = partData?.rarity || 'normal';
                  return RARITY_CONFIG[rarity as Rarity]?.color || '#9ca3af';
                }) || [];
                return (
                  <div key={ename} className="flex items-center gap-2 px-2 py-1.5 bg-bg-card border border-border/60">
                    {iconSrc ? (
                      <img src={iconSrc} alt={ename} className="w-5 h-5 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-sm">{eDef?.emoji || '❓'}</span>
                    )}
                    <span className="text-[9px] font-bold text-text-primary flex-1 truncate">{ename}</span>
                    <span className="text-[8px] text-text-muted font-mono">{kills} kills</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: totalParts }).map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full ${idx < dropsFound.length ? '' : 'bg-border/30'}`} style={idx < dropsFound.length ? { backgroundColor: partRarityColors[idx] || '#d4943a' } : undefined} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
