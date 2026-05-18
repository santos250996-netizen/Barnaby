'use client';

import React from 'react';

interface OptionsContentProps {
  onReset: () => void;
}

export function OptionsContent({ onReset }: OptionsContentProps) {
  return <button onClick={onReset} className="w-full py-4 border-2 border-danger text-danger font-black uppercase text-xs">Reiniciar Partida</button>;
}
