'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GeometricCombatButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  cost: string;
  variant?: 'primary' | 'danger' | 'blue';
}

export function GeometricCombatButton({ onClick, icon, label, cost, variant = 'primary' }: GeometricCombatButtonProps) {
  const styles = {
    primary: "from-[#1a160e] to-[#2a2418] border-[#4a3a28] hover:border-accent text-[#d4c4a0] shadow-[0_4px_0_0_rgba(0,0,0,0.5)]",
    danger: "from-[#2a1018] to-[#1a0a12] border-[#5a2040] hover:border-red-500 text-red-400 shadow-[0_4px_0_0_rgba(0,0,0,0.5)]",
    blue: "from-[#101a2a] to-[#0a101a] border-[#204060] hover:border-blue-400 text-blue-300 shadow-[0_4px_0_0_rgba(0,0,0,0.5)]"
  };
  return (
    <motion.button
      whileTap={{ y: 2, scale: 0.98 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${styles[variant]} border border-white/10 border-b-4 border-r-4 rounded-none transition-all group overflow-hidden active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.4)] active:translate-x-0.5 active:translate-y-0.5 active:border-b-2 active:border-r-2`}
    >
      <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform drop-shadow-md">{icon}</div>
      <div className="font-display font-black text-[10px] sm:text-sm tracking-widest uppercase mb-0.5 truncate w-full px-2 drop-shadow-sm">{label}</div>
      <div className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] truncate w-full px-2">{cost}</div>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity" />
    </motion.button>
  );
}
