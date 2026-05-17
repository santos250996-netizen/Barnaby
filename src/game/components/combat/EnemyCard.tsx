'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TDB } from '@/game/data';
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

interface EnemyCardProps {
  enemy: any;
  enemyHp: number;
  enemyMaxHp: number;
  enemyActions: { type: string; value: number; icon: string; text: string; skillId?: string; skillData?: any; isMasterSkill?: boolean }[];
  turnPhase: 'planning' | 'executing';
  currentActionSlot: number;
  combatMenu: 'main' | 'skills' | 'items';
  setCombatMenu: (menu: 'main' | 'skills' | 'items') => void;
  equippedSkills: string[];
  findSkillSlot: (skillId: string) => string | null;
  equipment: Record<string, EquipSlot | null>;
  consumableSlots: (string | null)[];
  potionCount: number;
  onAction: (techName: string) => void;
  onUseConsumable: (slotIndex: 0 | 1) => void;
  onFlee: () => void;
  onConfirmOrder: () => void;
}

export function EnemyCard({
  enemy,
  enemyHp,
  enemyMaxHp,
  enemyActions,
  turnPhase,
  currentActionSlot,
  combatMenu,
  setCombatMenu,
  equippedSkills,
  findSkillSlot,
  equipment,
  consumableSlots,
  potionCount,
  onAction,
  onUseConsumable,
  onFlee,
  onConfirmOrder,
}: EnemyCardProps) {
  const img = enemy?.name ? ENEMY_IMAGES[enemy.name] : null;

  // Render combat action buttons (shared between image/no-image variants)
  const renderActionButtons = () => (
    <div className="absolute bottom-16 right-3 flex flex-col-reverse gap-2 z-30">
      {combatMenu === 'main' ? (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onFlee(); }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 border-blue-400/50 overflow-hidden shadow-[0_0_12px_rgba(96,165,250,0.3)] hover:border-blue-400 hover:shadow-[0_0_16px_rgba(96,165,250,0.5)] transition-all"
          >
            <img src="/game/ui/icon-huir.png" alt="Huir" className="w-full h-full object-cover" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setCombatMenu('items'); }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 border-green-400/50 overflow-hidden shadow-[0_0_12px_rgba(74,222,128,0.3)] hover:border-green-400 hover:shadow-[0_0_16px_rgba(74,222,128,0.5)] transition-all"
          >
            <img src="/game/ui/icon-objetos.png" alt="Objetos" className="w-full h-full object-cover" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setCombatMenu('skills'); }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/70 border-2 border-accent/60 overflow-hidden shadow-[0_0_12px_rgba(212,148,58,0.3)] hover:border-accent hover:shadow-[0_0_16px_rgba(212,148,58,0.5)] transition-all"
          >
            <img src="/game/ui/icon-acciones.png" alt="Acciones" className="w-full h-full object-cover" />
          </motion.button>
        </>
      ) : combatMenu === 'skills' ? (
        <>
          {equippedSkills.map((sk, idx) => {
            const t = (TDB as any)[sk];
            const slot = findSkillSlot(sk);
            const eq = slot ? (equipment as any)[slot] as EquipSlot | null : null;
            const isWornOut = eq && eq.putrefaccion === 0;
            return (
              <motion.button
                key={sk + idx}
                whileHover={!isWornOut ? { scale: 1.1 } : {}}
                whileTap={!isWornOut ? { scale: 0.9 } : {}}
                onClick={(e) => { e.stopPropagation(); if (!isWornOut) onAction(sk); }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 ${isWornOut ? 'border-gray-500/30 opacity-40 cursor-not-allowed' : t?.type === 'sacrifice' ? 'border-red-400/50 shadow-[0_0_12px_rgba(248,113,113,0.3)] hover:border-red-400' : 'border-accent/50 shadow-[0_0_12px_rgba(212,148,58,0.3)] hover:border-accent'} overflow-hidden transition-all relative`}
              >
                {t?.icon ? <img src={t.icon} alt="" className={`w-full h-full object-cover ${isWornOut ? 'grayscale' : ''}`} loading="lazy" /> : <span className="text-lg sm:text-xl">{t?.emoji || '❓'}</span>}
                {isWornOut && <span className="absolute bottom-0 right-0 text-[6px] bg-red-900 text-white px-0.5">✕</span>}
              </motion.button>
            );
          })}
        </>
      ) : (
        <>
          {(consumableSlots || ['potion', null]).map((slotItem, idx) => {
            const slotIdx = idx as 0 | 1;
            if (slotItem === 'potion') {
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onUseConsumable(slotIdx); setCombatMenu('main'); }}
                  disabled={potionCount === 0}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 border-green-400/50 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)] hover:border-green-400 disabled:opacity-30 transition-all"
                >
                  <span className="text-lg sm:text-xl">🧪</span>
                  <span className="text-[6px] sm:text-[7px] font-black text-green-300 uppercase leading-none mt-0.5">x{potionCount}</span>
                </motion.button>
              );
            }
            if (slotItem && slotItem !== 'potion') {
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onUseConsumable(slotIdx); setCombatMenu('main'); }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 border-accent/50 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(212,148,58,0.3)] hover:border-accent transition-all"
                >
                  <span className="text-lg sm:text-xl">📦</span>
                  <span className="text-[5px] sm:text-[6px] font-black text-accent/80 uppercase leading-none mt-0.5">{slotItem}</span>
                </motion.button>
              );
            }
            return (
              <motion.button
                key={idx}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 border-2 border-gray-500/30 flex flex-col items-center justify-center opacity-30"
                disabled
              >
                <span className="text-lg">➖</span>
              </motion.button>
            );
          })}
        </>
      )}
    </div>
  );

  // Render enemy intent badge — NOW SHOWS 4 ACTIONS
  const renderIntentBadge = () => (
    <div className="absolute top-2 right-2 flex flex-col gap-0.5 z-20">
      {enemyActions.length > 0 ? enemyActions.map((action, idx) => {
        const isExecuting = turnPhase === 'executing' && currentActionSlot === idx;
        const isDone = turnPhase === 'executing' && currentActionSlot > idx;
        const hasMaster = action.isMasterSkill;
        return (
          <div
            key={idx}
            className={`flex items-center gap-1 px-2 py-0.5 bg-[#d4c4a0] border rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all ${
              isDone ? 'opacity-30' : isExecuting ? 'border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.7)] scale-105' : hasMaster ? 'border-yellow-500/80 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : 'border-[#8a7a60]'
            }`}
          >
            <span className={`text-sm sm:text-base ${isExecuting ? 'animate-pulse' : ''} ${hasMaster ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'drop-shadow-[0_0_8px_rgba(212,148,58,0.4)]'}`}>{action.icon}</span>
            <span className={`text-[7px] sm:text-[9px] font-black leading-tight tracking-wider ${hasMaster ? 'text-yellow-700' : 'text-[#5a4020]'}`} dangerouslySetInnerHTML={{ __html: action.text }} />
          </div>
        );
      }) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#d4c4a0] border border-[#8a7a60] rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          <span className="text-lg sm:text-xl animate-pulse drop-shadow-[0_0_8px_rgba(212,148,58,0.4)]">⚔️</span>
          <span className="text-[9px] sm:text-[11px] font-black leading-tight tracking-wider text-[#5a4020]">Esperando...</span>
        </div>
      )}
    </div>
  );

  // Render HP bar (shared)
  const renderHpBar = (large: boolean) => (
    <>
      <div className={`w-${large ? '4/5' : 'full'} h-${large ? '1.5 sm:h-2' : '2 sm:h-2.5'} bg-black/60 border border-danger/30 p-[1px] relative overflow-hidden${large ? ' mt-2' : ''}`}>
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }} className="absolute inset-y-0 left-0 bg-white/30 z-10" />
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="h-full bg-gradient-to-r from-red-600 to-red-400 relative z-20 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
      </div>
      <div className={`text-${large ? '[7px] sm:text-[9px]' : '[8px] sm:text-[10px]'} font-black text-white/80 font-mono uppercase tracking-tighter${large ? ' mt-1' : ''}`}>
        {enemyHp} / {enemyMaxHp} HP
      </div>
    </>
  );

  if (img) {
    // Enemy WITH image
    return (
      <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden shadow-[0_0_16px_rgba(220,38,38,0.3)]" onClick={() => combatMenu !== 'main' && setCombatMenu('main')}>
        <img src={img} alt={enemy?.name} className="w-full h-full object-cover min-h-[300px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        {renderIntentBadge()}
        {/* Name + HP - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 space-y-1">
          <div className="text-white font-display font-black text-sm sm:text-base uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
            {enemy?.name}
          </div>
          <div className="w-full h-2 sm:h-2.5 bg-black/60 border border-danger/30 p-[1px] relative overflow-hidden">
            <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }} className="absolute inset-y-0 left-0 bg-white/30 z-10" />
            <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="h-full bg-gradient-to-r from-red-600 to-red-400 relative z-20 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
          </div>
          <div className="text-[8px] sm:text-[10px] font-black text-white/80 font-mono uppercase tracking-tighter">
            {enemyHp} / {enemyMaxHp} HP
          </div>
        </div>
        {renderActionButtons()}
      </div>
    );
  }

  // Enemy WITHOUT image (emoji fallback)
  return (
    <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden bg-[#1a1428] shadow-[0_0_16px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center min-h-[300px]" onClick={() => combatMenu !== 'main' && setCombatMenu('main')}>
      {renderIntentBadge()}
      <div className="text-4xl sm:text-5xl mb-2">{enemy?.emoji}</div>
      <div className="text-danger font-display font-black text-sm sm:text-lg truncate drop-shadow-md">{enemy?.name}</div>
      <div className="w-4/5 h-1.5 sm:h-2 bg-black/60 border border-danger/30 p-[1px] relative overflow-hidden mt-2">
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }} className="absolute inset-y-0 left-0 bg-white/30 z-10" />
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="h-full bg-gradient-to-r from-red-600 to-red-400 relative z-20 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
      </div>
      <div className="text-[7px] sm:text-[9px] font-black text-white/80 font-mono uppercase tracking-tighter mt-1">{enemyHp} / {enemyMaxHp} HP</div>
      {renderActionButtons()}
    </div>
  );
}
