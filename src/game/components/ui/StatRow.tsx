'use client';

import React, { useState } from 'react';

interface StatRowProps {
  label: string;
  value: string;
  tooltip?: string;
}

export function StatRow({ label, value, tooltip }: StatRowProps) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="flex justify-between items-center py-2 border-b border-bg-surface relative cursor-help" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <span className="text-text-secondary text-[10px] uppercase font-black">{label}</span>
      <span className="text-accent font-mono font-black text-sm">{value}</span>
      {tooltip && showTip && (
        <div className="absolute right-0 -top-9 z-50 px-3 py-1.5 bg-[#d4c4a0] border border-[#8a7a60] text-[10px] font-black uppercase tracking-widest text-[#5a4020] whitespace-nowrap rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {tooltip}
          <div className="absolute top-full right-3 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-[#8a7a60]" />
        </div>
      )}
    </div>
  );
}
