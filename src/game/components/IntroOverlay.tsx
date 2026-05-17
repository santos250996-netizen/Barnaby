'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Sword, Shield, Zap } from 'lucide-react';

interface IntroOverlayProps {
  onStart: () => void;
}

export function IntroOverlay({ onStart }: IntroOverlayProps) {
  const hasSave = typeof window !== 'undefined' && !!localStorage.getItem('barnaby_save');
  return (
    <div className="fixed inset-0 bg-bg-deep z-[1000] flex flex-col justify-center items-center p-8 text-center overflow-hidden">
      <div className="absolute inset-0 mesh-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="relative inline-block mb-8">
          <Skull size={100} className="text-accent drop-shadow-[0_0_30px_rgba(212,148,58,0.5)]" />
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 border-2 border-accent/50 rounded-full"
          />
        </div>
        <h1 className="font-display font-black text-6xl sm:text-8xl text-accent mb-2 uppercase tracking-tighter drop-shadow-2xl">
          BARNABY
        </h1>
        <div className="w-24 h-1 bg-accent mx-auto mb-6" />
        <p className="text-text-secondary text-xs sm:text-sm max-w-[320px] mb-12 font-mono uppercase tracking-[0.3em] leading-loose opacity-70">
          Un esqueleto sin magia en un reino de piezas y fragmentos.
        </p>

        <button
          onClick={onStart}
          className="group relative px-16 py-5 bg-transparent overflow-hidden border-2 border-accent transition-all hover:shadow-[0_0_30px_rgba(212,148,58,0.3)] active:scale-95"
        >
          <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 font-black text-xl uppercase tracking-[0.4em] text-accent group-hover:text-bg-deep transition-colors">
            {hasSave ? 'REANUDAR' : 'DESPERTAR'}
          </span>
        </button>

        <div className="mt-16 flex gap-8 justify-center opacity-30">
          <Sword size={20} />
          <Shield size={20} />
          <Zap size={20} />
        </div>
      </motion.div>
    </div>
  );
}
