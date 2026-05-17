'use client';

import React from 'react';
import { Scroll } from 'lucide-react';
import { GameState } from '@/game/types';
import { getItemData, QST } from '@/game/constants';

interface QuestsContentProps {
  state: GameState;
}

export function QuestsContent({ state }: QuestsContentProps) {
  const active = state.activeQuests;
  const available = QST.filter(q => !state.completedQuests.includes(q.id) && !state.activeQuests.find((aq: any) => aq.id === q.id));

  function questMet(q: any): boolean {
    if (q.boss) return state.defeatedBosses.includes(q.boss);
    if (q.type === 'kill' || q.type === 'collect' || q.type === 'potion') return (state.questProgress?.[q.id] || 0) >= q.count;
    if (q.type === 'boss') return state.defeatedBosses.includes(q.target);
    if (q.type === 'equip_set') {
      const counts: Record<string, number> = {};
      Object.values(state.equipment as any).forEach((eq: any) => {
        const item = eq?.id ? getItemData(eq.id) : null;
        if (item?.set) counts[item.set] = (counts[item.set] || 0) + 1;
      });
      return Object.values(counts).some((c: any) => (c as number) >= q.count);
    }

    return false;
  }

  function questProgressStr(q: any): string {
    if (q.type === 'kill' || q.type === 'collect' || q.type === 'potion') return `${state.questProgress?.[q.id] || 0}/${q.count}`;
    if (q.type === 'equip_set') return `Equipa ${q.count}+ piezas`;
    return '';
  }

  function questProgressPct(q: any): number {
    if (q.type === 'kill' || q.type === 'collect' || q.type === 'potion') return Math.min(100, ((state.questProgress?.[q.id] || 0) / q.count) * 100);
    if (q.type === 'equip_set') return questMet(q) ? 100 : 0;
    return questMet(q) ? 100 : 0;
  }

  return (
    <div className="space-y-6 font-mono">
      {active.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest px-1">Misiones Activas</h4>
          <div className="space-y-2">
            {active.map((q: any) => {
              const met = questMet(q);
              const progress = questProgressStr(q);
              const pct = questProgressPct(q);
              return (
                <div key={q.id} className="p-4 bg-bg-card border-2 border-accent relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">{q.name}</span>
                     {met && <span className="bg-success text-bg-deep text-[8px] font-black px-2 py-0.5 animate-pulse">¡LISTA!</span>}
                     {q.story && <span className="bg-accent/30 text-accent text-[7px] font-black px-1 uppercase ml-1">Historia</span>}
                  </div>
                  <p className="text-[9px] italic mb-3" style={{ color: 'var(--color-desc-lore)' }}>{q.description}</p>

                  {progress && (
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg-deep">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-text-muted">{progress}</span>
                    </div>
                  )}

                  <div className="mb-4 space-y-1">
                     <h5 className="text-[8px] font-black text-accent uppercase tracking-tighter">Recompensas:</h5>
                     <div className="flex flex-wrap gap-2">
                        {q.reward.shards && <span className="text-[8px] font-bold text-text-primary">💎 {q.reward.shards}</span>}
                        {q.reward.item && <span className="text-[8px] font-bold text-accent">🦴 {q.reward.item}</span>}
                        {q.reward.potions && <span className="text-[8px] font-bold text-success">🧪 {q.reward.potions}</span>}
                        {q.reward.integrity && <span className="text-[8px] font-bold text-danger">💖 +{q.reward.integrity}%</span>}
                     </div>
                  </div>

                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${met ? 'bg-success' : 'bg-border animate-ping'}`} />
                        <span className={`text-[8px] font-black uppercase ${met ? 'text-success' : 'text-text-muted'}`}>{q.req}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-border" />
                        <span className="text-[8px] font-black text-text-muted uppercase">Habla con {q.giver} en {q.location} para entregar</span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Misiones Disponibles</h4>
          <div className="space-y-2">
            {available.map(q => (
              <div key={q.id} className="p-4 bg-bg-card border-2 border-border opacity-60">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">{q.name}</span>
                  <span className="text-[8px] font-black text-text-muted border border-border px-1">{q.location}</span>
                </div>
                <p className="text-[9px] italic mb-3" style={{ color: 'var(--color-desc-lore)' }}>Habla con {q.giver} para comenzar.</p>
                <div className="flex flex-wrap gap-2">
                   {q.reward.shards && <span className="text-[7px] font-black text-text-muted">💎 {q.reward.shards}</span>}
                   {q.reward.item && <span className="text-[7px] font-black text-accent opacity-60">🦴 Recompensa: {q.reward.item}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && available.length === 0 && (
        <div className="p-12 border-2 border-border border-dashed text-center opacity-50 flex flex-col items-center">
           <Scroll size={32} className="mb-2" />
           <p className="text-[10px] font-black uppercase">No hay misiones pendientes</p>
        </div>
      )}
    </div>
  );
}
