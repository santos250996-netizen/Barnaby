'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@/game/types';
import { LOC } from '@/game/constants';

interface MapContentProps {
  state: GameState;
  onTravel: (loc: string) => void;
  onClose: () => void;
}

export function MapContent({ state, onTravel, onClose }: MapContentProps) {
  const allLocations = Object.keys(LOC);

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      {/* Dark overlay - click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90"
      />
      {/* Map modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-[560px] shadow-2xl overflow-hidden"
      >
        {/* Map image with positioned destinations */}
        <div className="relative w-full" style={{ minHeight: '280px' }}>
          <img
            src="/game/locations/mapa-bg.png"
            alt="Mapa del Mundo"
            className="w-full h-full object-cover min-h-[280px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0c14]/10 via-transparent to-[#0e0c14]/20" />

          {/* Destination icons positioned on the map */}
          {allLocations.map((l: string) => {
            const locData = LOC[l];
            const isCurrent = state.currentLocation === l;
            const mapPos = locData.mapPosition || { top: '50%', left: '50%' };
            const mapIcon = locData.mapIcon;
            const style: React.CSSProperties = {};
            if (mapPos.top) style.top = mapPos.top;
            if (mapPos.bottom) style.bottom = mapPos.bottom;
            if (mapPos.left) style.left = mapPos.left;
            if (mapPos.right) style.right = mapPos.right;

            return (
              <div
                key={l}
                className="absolute group -translate-x-1/2 -translate-y-1/2 hover:z-[100]"
                style={style}
              >
                <button
                  disabled={isCurrent}
                  onClick={() => { if (!isCurrent) onTravel(l); }}
                  className={`transition-all ${
                    !isCurrent
                      ? 'hover:scale-125 active:scale-95 cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 overflow-hidden transition-all ${
                    isCurrent
                      ? 'border-[#d4943a] shadow-[0_0_16px_rgba(212,148,58,0.7)] animate-pulse'
                      : 'border-[#8a7a60]/60 shadow-[0_0_12px_rgba(138,122,96,0.4)] group-hover:border-[#8a7a60] group-hover:shadow-[0_0_20px_rgba(138,122,96,0.7)]'
                  } bg-[#1a1428]/50`}>
                    {mapIcon ? (
                      <img src={mapIcon} alt={locData.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📍</div>
                    )}
                  </div>
                  {/* Current location indicator */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#d4943a] border border-[#8a7a60] text-[#1a1428] text-[7px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                      TÚ
                    </div>
                  )}
                </button>
                {/* Parchment tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-[#d4c4a0] border border-[#8a7a60] text-[#5a4020] text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-50">
                  {locData.name}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
