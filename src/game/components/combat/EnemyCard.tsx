'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TDB, getItemData } from '@/game/data';
import { EquipSlot } from '@/game/types';

const ENEMY_IMAGES: Record<string, string> = {
  'Trasgo Tontin': '/game/enemies/enemy-trasgo-tontin.png',
  'Trasgo Lanzahuesos': '/game/enemies/enemy-trasgo-lanzahuesos.png',
  'Goblin': '/game/enemies/enemy-goblin.png',
  'Serpiente': '/game/enemies/enemy-serpiente.png',
  'Jabalí': '/game/enemies/enemy-jabali.png',
  '👑 Rey Trasgo': '/game/enemies/enemy-rey-trasgo.png',
  '🕺 Rattlebones': '/game/enemies/enemy-rattlebones.png',
  'Esqueleto Guerrero': '/game/enemies/enemy-esqueleto-guerrero.png',
  'Fantasma': '/game/enemies/enemy-fantasma.png',
  'Momia': '/game/enemies/enemy-momia.png',
  'Gusano de Cripta': '/game/enemies/enemy-gusano-cripta.png',
  'Nigromante': '/game/enemies/enemy-nigromante.png',
  '👑 Reina Espectral': '/game/enemies/enemy-reina-espectral.png',
  'Buitre Carroñero': '/game/enemies/enemy-buitre-carronero.png',
  'Hombre Escorpión': '/game/enemies/enemy-hombre-escorpion.png',
  'Nómada Sombrío': '/game/enemies/enemy-nomada-sombrio.png',
  'Golem de Arena': '/game/enemies/enemy-golem-arena.png',
  'Espectro del Desierto': '/game/enemies/enemy-espectro-desierto.png',
  '👑 Faraón Maldito': '/game/enemies/enemy-faraon-maldito.png',
};

interface PlayerSlotInfo {
  slotKey: string;
  skillId: string;
  putrefaccion: number;
  isAvailable: boolean;
}

interface EnemyCardProps {
  enemy: any;
  enemyHp: number;
  enemyMaxHp: number;
  // New 4-action system props
  enemyActions: { type: string; value: number; icon: string; text: string; skillId?: string; isMasterSkill?: boolean }[];
  playerActionOrder: string[];
  turnPhase: 'planning' | 'executing';
  currentActionSlot: number;
  equippedSkills: string[];
  findSkillSlot: (skillId: string) => string | null;
  equipment: Record<string, EquipSlot | null>;
  onSetSkillOrder: (skillId: string, slotIndex: number) => void;
  onSwapSlots: (slotA: number, slotB: number) => void;
  onConfirmOrder: () => void;
  onFlee: () => void;
  onUseConsumable: (slotIndex: 0 | 1) => void;
  consumableSlots: (string | null)[];
  potionCount: number;
  playerSpeed: number;
  enemySpeed: number;
  turnNumber: number;
}

export function EnemyCard({
  enemy,
  enemyHp,
  enemyMaxHp,
  enemyActions,
  playerActionOrder,
  turnPhase,
  currentActionSlot,
  equippedSkills,
  findSkillSlot,
  equipment,
  onSetSkillOrder,
  onSwapSlots,
  onConfirmOrder,
  onFlee,
  onUseConsumable,
  consumableSlots,
  potionCount,
  playerSpeed,
  enemySpeed,
  turnNumber,
}: EnemyCardProps) {
  const img = enemy?.name ? ENEMY_IMAGES[enemy.name] : null;
  const hpPercent = enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0;
  
  // Track selected slot for swap functionality
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Resolve action order for display
  let playerFirst: boolean;
  if (playerSpeed > enemySpeed) playerFirst = true;
  else if (playerSpeed < enemySpeed) playerFirst = false;
  else playerFirst = turnNumber % 2 === 0;

  // Get 4 player slot skills (one per equipment slot)
  const playerSlots: PlayerSlotInfo[] = React.useMemo(() => {
    const slots: { slotKey: string; defaultSkill: string }[] = [
      { slotKey: 'head', defaultSkill: '💀 Cabezazo Barnaby' },
      { slotKey: 'torso', defaultSkill: '🛡️ Costillas Enrejadas' },
      { slotKey: 'arms', defaultSkill: '🦾 Puño Óseo' },
      { slotKey: 'legs', defaultSkill: '👻 Voluntad Post-Mortem' },
    ];
    return slots.map(({ slotKey, defaultSkill }) => {
      const eq = equipment[slotKey];
      let skillId = defaultSkill;
      let putrefaccion = -1;
      let isAvailable = true;
      if (eq && eq.id) {
        const data = getItemData(eq.id);
        if (data?.skillIds && data.skillIds.length > 0) skillId = data.skillIds[0];
        putrefaccion = eq.putrefaccion;
        isAvailable = eq.putrefaccion > 0;
      }
      return { slotKey, skillId, putrefaccion, isAvailable };
    });
  }, [equipment]);

  // Handle slot click for swap
  const handleSlotClick = (slotIdx: number) => {
    if (turnPhase !== 'planning') return;
    
    if (selectedSlot === null) {
      // Select first slot
      setSelectedSlot(slotIdx);
    } else if (selectedSlot === slotIdx) {
      // Deselect
      setSelectedSlot(null);
    } else {
      // Swap the two slots
      onSwapSlots(selectedSlot, slotIdx);
      setSelectedSlot(null);
    }
  };

  // Render HP bar
  const renderHpBar = () => (
    <div className="w-full h-2 sm:h-2.5 bg-black/60 border border-danger/30 p-[1px] relative overflow-hidden">
      <motion.div initial={false} animate={{ width: `${hpPercent}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className={`h-full ${hpPercent < 30 ? 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-400'}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[7px] sm:text-[9px] font-black text-white/80 font-mono uppercase tracking-tighter">{enemyHp} / {enemyMaxHp}</span>
      </div>
    </div>
  );

  // Render enemy action slot
  const renderEnemyActionSlot = (action: typeof enemyActions[0], idx: number) => {
    const isExecuting = turnPhase === 'executing' && currentActionSlot === idx;
    const isDone = turnPhase === 'executing' && currentActionSlot > idx;
    
    // Speed indicator for this slot
    const playerGoesFirst = idx % 2 === 0 ? playerFirst : !playerFirst;
    
    return (
      <div
        key={idx}
        className={`flex flex-col items-center gap-0.5 transition-all ${
          isDone ? 'opacity-30' : ''
        }`}
      >
        <span className="text-[7px] text-white/40">{playerGoesFirst ? '🐾' : '⚡'}</span>
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] border transition-all ${
            isDone
              ? 'bg-gray-800/50 border-gray-600/30'
              : isExecuting
                ? 'bg-red-900/60 border-red-400/70 shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                : action.isMasterSkill
                  ? 'bg-yellow-900/40 border-yellow-400/60 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                  : 'bg-black/40 border-danger/30'
          }`}
        >
          <span className={`${isExecuting ? 'animate-pulse' : ''}`}>{action.icon}</span>
          <span className="font-bold text-white/90 truncate max-w-[50px] sm:max-w-[70px]" dangerouslySetInnerHTML={{ __html: action.text }} />
        </div>
      </div>
    );
  };

  // Render player action slot
  const renderPlayerActionSlot = (slotIdx: number) => {
    const slotInfo = playerSlots[slotIdx];
    const selectedSkillId = playerActionOrder[slotIdx] || '';
    const isExecuting = turnPhase === 'executing' && currentActionSlot === slotIdx;
    const isDone = turnPhase === 'executing' && currentActionSlot > slotIdx;
    const isPlannable = turnPhase === 'planning';
    const isSelected = selectedSlot === slotIdx;
    
    // Determine who goes first in this slot
    const playerGoesFirst = slotIdx % 2 === 0 ? playerFirst : !playerFirst;
    
    const tech = selectedSkillId ? TDB[selectedSkillId] : null;
    const isAvailable = slotInfo?.isAvailable ?? true;

    // Determine if this skill has been swapped from its default
    const isSwapped = selectedSkillId && selectedSkillId !== slotInfo?.skillId;

    return (
      <div
        key={slotIdx}
        className={`flex flex-col items-center gap-0.5 transition-all ${
          isDone ? 'opacity-30' : ''
        }`}
      >
        <span className="text-[7px] text-white/40">{playerGoesFirst ? '⚡' : '🐾'}</span>
        <div
          onClick={() => handleSlotClick(slotIdx)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] border transition-all cursor-pointer ${
            isDone
              ? 'bg-gray-800/50 border-gray-600/30 cursor-default'
              : isExecuting
                ? 'bg-emerald-900/60 border-emerald-400/70 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : isSelected
                  ? 'bg-accent/30 border-accent shadow-[0_0_12px_rgba(212,148,58,0.6)] scale-105'
                  : !isAvailable
                    ? 'bg-gray-800/50 border-gray-500/30 opacity-50 cursor-not-allowed'
                    : isSwapped
                      ? 'bg-amber-900/30 border-amber-400/40 shadow-[0_0_4px_rgba(245,158,11,0.2)]'
                      : isPlannable
                        ? 'bg-emerald-900/30 border-emerald-400/40 hover:border-emerald-400/70 hover:bg-emerald-900/40'
                        : 'bg-black/40 border-accent/30'
          }`}
        >
          <span className="text-[10px] sm:text-xs">{tech?.emoji || '❓'}</span>
          {!isAvailable && <span className="text-[7px] text-red-400">✕</span>}
          <span className="font-bold text-white/90 truncate max-w-[50px] sm:max-w-[70px]">
            {!isAvailable ? 'Roto' : tech?.name || '—'}
          </span>
          {isAvailable && slotInfo?.putrefaccion >= 0 && slotInfo.putrefaccion <= 2 && (
            <span className="text-[6px] text-amber-400 font-mono">{slotInfo.putrefaccion}</span>
          )}
        </div>
      </div>
    );
  };

  // Render putrefacción bars for all slots
  const renderPutrefaccionBars = () => {
    return (
      <div className="flex gap-1 px-1">
        {playerSlots.map((slot, idx) => {
          if (slot.putrefaccion < 0) return null;
          const maxPut = 5; // typical max
          const pct = Math.max(0, Math.min(100, (slot.putrefaccion / maxPut) * 100));
          return (
            <div key={slot.slotKey} className="flex-1">
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    slot.putrefaccion === 0 ? 'bg-red-500' : slot.putrefaccion <= 1 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Confirm button
  const renderConfirmButton = () => {
    if (turnPhase !== 'planning') return null;
    const hasAnySkill = playerActionOrder.some(s => s && s !== '');
    return (
      <div className="flex gap-2 items-center">
        {selectedSlot !== null && (
          <span className="text-[8px] text-accent animate-pulse">Selecciona otra ranura para intercambiar</span>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setSelectedSlot(null); onConfirmOrder(); }}
          disabled={!hasAnySkill}
          className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        >
          Confirmar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setSelectedSlot(null); onFlee(); }}
          className="px-3 py-1.5 rounded bg-red-900/60 hover:bg-red-800/70 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-red-400/30"
        >
          Huir
        </motion.button>
      </div>
    );
  };

  // Phase indicator
  const renderPhaseIndicator = () => (
    <div className={`text-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
      turnPhase === 'planning' ? 'text-accent' : 'text-red-400 animate-pulse'
    }`}>
      {turnPhase === 'planning' ? '⏳ Planificación' : `⚔️ Ejecución (${currentActionSlot + 1}/4)`}
    </div>
  );

  const content = (
    <>
      {/* Enemy name + emoji */}
      {img ? (
        <div className="text-white font-display font-black text-sm sm:text-base uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
          {enemy?.emoji} {enemy?.name}
        </div>
      ) : (
        <div className="text-3xl sm:text-4xl mb-1">{enemy?.emoji}</div>
      )}
      {img ? null : (
        <div className="text-danger font-display font-black text-sm sm:text-lg truncate drop-shadow-md">{enemy?.name}</div>
      )}
      
      {renderHpBar()}
      
      {/* Phase indicator */}
      {renderPhaseIndicator()}
      
      {/* 4 Action Slots - Enemy */}
      <div className="space-y-0.5">
        <div className="text-[7px] sm:text-[8px] text-red-300/70 font-bold uppercase tracking-wider">Enemigo</div>
        <div className="flex gap-1">
          {enemyActions.map((a, i) => renderEnemyActionSlot(a, i))}
        </div>
      </div>
      
      {/* 4 Action Slots - Player */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="text-[7px] sm:text-[8px] text-emerald-300/70 font-bold uppercase tracking-wider">Barnaby</div>
          {turnPhase === 'planning' && (
            <div className="text-[6px] text-white/30">Toca para intercambiar</div>
          )}
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(i => renderPlayerActionSlot(i))}
        </div>
      </div>
      
      {/* Putrefacción bars */}
      {renderPutrefaccionBars()}
      
      {/* Confirm / Flee buttons */}
      {renderConfirmButton()}
    </>
  );

  if (img) {
    return (
      <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden shadow-[0_0_16px_rgba(220,38,38,0.3)]">
        <img src={img} alt={enemy?.name} className="w-full h-full object-cover min-h-[300px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
        
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 space-y-1">
          {content}
        </div>
      </div>
    );
  }

  // Fallback: emoji only
  return (
    <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden bg-[#1a1428] shadow-[0_0_16px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center min-h-[300px]">
      {content}
    </div>
  );
}
