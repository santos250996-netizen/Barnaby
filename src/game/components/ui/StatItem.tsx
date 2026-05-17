'use client';

import React from 'react';

interface StatItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="p-3 bg-bg-card flex flex-col items-center justify-center group hover:bg-bg-surface transition-colors">
      <div className="flex items-center gap-1.5 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {icon}
        <span className="text-[8px] text-text-secondary uppercase font-black tracking-tighter">{label}</span>
      </div>
      <span className="text-xl font-black text-accent drop-shadow-[0_0_8px_rgba(212,148,58,0.3)]">{value}</span>
    </div>
  );
}
