'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Lock } from 'lucide-react';
import { LORE_DATA } from '@/game/constants';
import { GameState } from '@/game/types';

const ZONE_ORDER = [
  { id: 'origen', label: 'Origen', icon: '💀' },
  { id: 'ciudad', label: 'Ciudad', icon: '🏙️' },
  { id: 'bosque', label: 'Bosque', icon: '🌲' },
];

interface LoreContentProps {
  state: GameState;
}

export function LoreContent({ state }: LoreContentProps) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string>('origen');

  const unlockedIds = state.unlockedLore || [];
  const zoneEntries = LORE_DATA.filter((entry: any) => entry.zone === activeZone);
  const currentZone = ZONE_ORDER.find(z => z.id === activeZone);

  return (
    <div className="space-y-4 font-mono">
      {/* Zone Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
        {ZONE_ORDER.map(zone => {
          const total = LORE_DATA.filter((e: any) => e.zone === zone.id).length;
          const unlocked = LORE_DATA.filter((e: any) => e.zone === zone.id && unlockedIds.includes(e.id)).length;
          return (
            <button
              key={zone.id}
              onClick={() => { setActiveZone(zone.id); setSelectedEntry(null); }}
              className={`flex-shrink-0 px-3 py-2 text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                activeZone === zone.id
                  ? 'bg-accent text-bg-deep border-accent'
                  : 'bg-bg-surface text-text-muted border-border hover:border-accent/60'
              }`}
            >
              {zone.icon} {zone.label}
              <span className="ml-1 text-[7px] opacity-60">({unlocked}/{total})</span>
            </button>
          );
        })}
      </div>

      {/* Zone Header */}
      <div className="bg-bg-surface p-3 border-l-4 border-accent">
        <h4 className="text-[10px] font-black text-white uppercase mb-1">{currentZone?.icon} {currentZone?.label}</h4>
        <p className="text-[8px] text-text-muted italic">
          {activeZone === 'origen' && 'Los orígenes de Barnaby y su extraña existencia.'}
          {activeZone === 'ciudad' && 'El refugio de los vivos y los que no lo son tanto.'}
          {activeZone === 'bosque' && 'Un bosque que no es natural. Criaturas que no son amables.'}
        </p>
      </div>

      {/* Lore Entries */}
      <div className="grid grid-cols-1 gap-3">
        {zoneEntries.map((entry: any) => {
          const isUnlocked = unlockedIds.includes(entry.id);
          const isSelected = selectedEntry === entry.id;

          if (!isUnlocked) {
            return (
              <div key={entry.id} className="p-4 bg-bg-card border-2 border-border/40 opacity-40 flex items-center gap-3">
                <Lock size={16} className="text-text-muted" />
                <div>
                  <div className="text-[10px] font-black text-text-muted uppercase">???</div>
                  <div className="text-[8px] text-text-muted italic">Descubre más para desbloquear</div>
                </div>
              </div>
            );
          }

          return (
            <motion.div
              key={entry.id}
              layout
              onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
              className={`group cursor-pointer bg-bg-card border-2 transition-all overflow-hidden ${isSelected ? 'border-accent shadow-glow-sm' : 'border-border hover:border-accent/60'}`}
            >
              {/* Header (no image) */}
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-bg-surface border border-border flex items-center justify-center text-lg flex-shrink-0">
                  📜
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-black bg-accent/20 text-accent px-1.5 py-0.5 uppercase tracking-tighter">{entry.date}</span>
                  </div>
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-tight truncate">{entry.title}</h3>
                </div>
                <ChevronRight size={14} className={`text-accent transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 bg-bg-surface overflow-hidden"
                  >
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-desc-lore)' }}>
                      {entry.content}
                    </p>
                    <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                      <span className="text-[8px] text-text-muted font-black uppercase italic">Fragmento de Lore</span>
                      <BookOpen size={12} className="text-accent opacity-30" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
