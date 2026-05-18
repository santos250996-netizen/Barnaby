'use client';

import React from 'react';
import { GameState } from '@/game/types';

interface ShopContentProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playSound: (sound: string) => void;
}

export function ShopContent({ state, setGameState, playSound }: ShopContentProps) {
  const items = [{ id: 'po', n: '🧪 Pocion', c: 50, i: '🧪' }];
  const buy = (id: string, c: number) => {
    if (state.resources.shards < c) return;
    setGameState((p: any) => ({ ...p, resources: { ...p.resources, shards: p.resources.shards - c, potions: id === 'po' ? p.resources.potions + 1 : p.resources.potions } }));
    playSound('shop');
  };
  return (
    <div className="space-y-2">
      {items.map(i => (
        <button key={i.id} onClick={() => buy(i.id, i.c)} disabled={state.resources.shards < i.c} className="w-full p-4 bg-bg-card border-2 border-border flex justify-between items-center disabled:opacity-30">
          <span className="text-xs font-bold whitespace-nowrap">{i.i} {i.n}</span>
          <span className="text-accent font-bold">💎 {i.c}</span>
        </button>
      ))}
    </div>
  );
}
