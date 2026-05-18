'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
}

export function TurnIndicator({ isPlayerTurn }: TurnIndicatorProps) {
  return (
    <div className="w-full h-8 sm:h-10 mb-4 sm:mb-6 bg-bg-surface border-b border-accent/60 flex items-center justify-between px-2 sm:px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-pulse pointer-events-none" />

      <motion.div
        animate={{
          opacity: isPlayerTurn ? 0.3 : 1,
          scale: isPlayerTurn ? 0.9 : 1.1,
          color: isPlayerTurn ? '#4a3a28' : '#ef4444'
        }}
        className="flex items-center gap-1 sm:gap-3"
      >
        <Skull size={12} className={!isPlayerTurn ? 'animate-bounce' : ''} />
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em]">Turno Enemigo</span>
      </motion.div>

      <div className="hidden xs:flex items-center gap-1 sm:gap-2 opacity-50">
        <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
        <div className="w-1 h-1 bg-accent rounded-full mb-0 shadow-glow" />
      </div>

      <motion.div
        animate={{
          opacity: isPlayerTurn ? 1 : 0.3,
          scale: isPlayerTurn ? 1.1 : 0.9,
          color: isPlayerTurn ? '#d4ba8a' : '#4a3a28'
        }}
        className="flex items-center gap-1 sm:gap-3"
      >
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em]">Tu Turno</span>
        <Skull size={12} className={isPlayerTurn ? 'animate-bounce' : ''} />
      </motion.div>
    </div>
  );
}
