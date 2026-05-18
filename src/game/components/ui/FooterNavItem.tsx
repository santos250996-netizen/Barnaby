'use client';

import React from 'react';

interface FooterNavItemProps {
  label: string;
  icon?: string;
  onClick: () => void;
  iconSrc?: string;
}

export function FooterNavItem({ label, icon, onClick, iconSrc }: FooterNavItemProps) {
  return (
    <div className="flex-1 group relative flex items-center justify-center border-r border-[#8a7a60]/30 last:border-r-0">
      <button
        onClick={onClick}
        className="flex items-center justify-center hover:brightness-125 active:scale-90 transition-all duration-200 py-2 px-1 w-full h-full"
      >
        {iconSrc ? (
          <img src={iconSrc} alt={label} className="w-8 h-8 object-contain object-center" draggable={false} loading="lazy" />
        ) : (
          <span className="text-sm">{icon}</span>
        )}
      </button>
      {/* Parchment tooltip - always in DOM, opacity toggle for smooth animation */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-[#d4c4a0] border border-[#8a7a60] text-[10px] font-black uppercase tracking-widest text-[#5a4020] whitespace-nowrap rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-[#8a7a60]" />
      </div>
    </div>
  );
}
