'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TDB } from '@/game/data';
import { EquipSlot } from '@/game/types';
import { Technique } from '@/game/data/types';
import { getPutrefaccionState, getMutation, PUTREFACCION_MAX, slotName } from '@/game/data/putrefaccion';

const ENEMY_IMAGES: Record<string, string> = {
  'Trasgo Tontin': '/game/enemies/enemy-trasgo-tontin.png',
  'Trasgo Lanzahuesos': '/game/enemies/enemy-trasgo-lanzahuesos.png',
  'Goblin': '/game/enemies/enemy-goblin.png',
  'Serpiente': '/game/enemies/enemy-serpiente.png',
  'Jabalí': '/game/enemies/enemy-jabali.png',
  'Rey Trasgo': '/game/enemies/enemy-rey-trasgo.png',
  'Rattlebones': '/game/enemies/enemy-rattlebones.png',
  'Esqueleto Guerrero': '/game/enemies/enemy-esqueleto-guerrero.png',
  'Fantasma': '/game/enemies/enemy-fantasma.png',
  'Momia': '/game/enemies/enemy-momia.png',
  'Gusano de Cripta': '/game/enemies/enemy-gusano-cripta.png',
  'Nigromante': '/game/enemies/enemy-nigromante.png',
  'Reina Espectral': '/game/enemies/enemy-reina-espectral.png',
  'Buitre Carronero': '/game/enemies/enemy-buitre-carronero.png',
  'Hombre Escorpion': '/game/enemies/enemy-hombre-escorpion.png',
  'Nomada Sombrio': '/game/enemies/enemy-nomada-sombrio.png',
  'Golem de Arena': '/game/enemies/enemy-golem-arena.png',
  'Espectro del Desierto': '/game/enemies/enemy-espectro-desierto.png',
  'Faraon Maldito': '/game/enemies/enemy-faraon-maldito.png',
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
  playerPutrefaccion?: Record<string, number>;
  enemyPutrefaccion?: number;
  consumableSlots: (string | null)[];
  potionCount: number;
  onAction: (techName: string) => void;
  onUseConsumable: (slotIndex: 0 | 1) => void;
  onFlee: () => void;
  onConfirmOrder: () => void;
  playerActionOrder: string[];
  currentActor: 'player' | 'enemy' | null;
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
  playerPutrefaccion,
  enemyPutrefaccion,
  consumableSlots,
  potionCount,
  onAction,
  onUseConsumable,
  onFlee,
  onConfirmOrder,
  playerActionOrder,
  currentActor,
}: EnemyCardProps) {
  const img = enemy?.name ? ENEMY_IMAGES[enemy.name] : null;
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const getSkillPutref = (skillId: string) => {
    const slot = findSkillSlot(skillId);
    if (!slot || !playerPutrefaccion) return { level: 0, pState: getPutrefaccionState(0), isDestroyed: false };
    const level = playerPutrefaccion[slot] || 0;
    return { level, pState: getPutrefaccionState(level), isDestroyed: level >= PUTREFACCION_MAX };
  };

  const renderSkillButton = (sk: string, idx: number) => {
    const t = (TDB as any)[sk];
    const slot = findSkillSlot(sk);
    const { level, pState, isDestroyed } = getSkillPutref(sk);
    const mutation = t ? getMutation(t.type, level) : null;
    const isSelected = playerActionOrder.includes(sk);
    const isHovered = hoveredSkill === sk;
    const canInteract = !isDestroyed && !isSelected;

    let btnClass = 'w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden transition-all relative ';
    if (isDestroyed) {
      btnClass += 'bg-black/70 border-2 border-gray-500/30 opacity-40 cursor-not-allowed';
    } else if (isSelected) {
      btnClass += 'bg-black/70 border-2 border-yellow-400 cursor-default';
    } else {
      btnClass += 'bg-black/70 border-2';
    }

    const glowStyle = (!isDestroyed && !isSelected && level > 0) ? (() => {
      if (level === 3) return { borderColor: '#dc2626', boxShadow: '0 0 18px rgba(220,38,38,0.8)' };
      if (level === 2) return { borderColor: '#f97316', boxShadow: '0 0 14px rgba(249,115,22,0.6)' };
      if (level === 1) return { borderColor: '#a3e635', boxShadow: '0 0 10px rgba(163,230,53,0.4)' };
      return { borderColor: '#d4943a', boxShadow: undefined };
    })() : undefined;

    const imgClass = ['w-full h-full object-cover'];
    if (isDestroyed) imgClass.push('grayscale');
    if (isSelected) imgClass.push('brightness-125 saturate-150');

    const showTooltip = isHovered && !isDestroyed && level > 0 && mutation;
    const showDestroyedTooltip = isHovered && isDestroyed;

    return (
      <div key={sk + idx} className="relative">
        <motion.button
          whileHover={canInteract ? { scale: 1.1 } : undefined}
          whileTap={canInteract ? { scale: 0.9 } : undefined}
          onClick={(e) => { e.stopPropagation(); if (canInteract) onAction(sk); }}
          onMouseEnter={() => setHoveredSkill(sk)}
          onMouseLeave={() => setHoveredSkill(null)}
          className={btnClass}
          style={glowStyle}
        >
          {t?.icon
            ? <img src={t.icon} alt="" className={imgClass.join(' ')} loading="lazy" />
            : <span className="text-lg sm:text-xl">{t?.emoji || '?'}</span>
          }
          {isDestroyed && <span className="absolute bottom-0 right-0 text-[6px] bg-red-900 text-white px-0.5">X</span>}
          {isSelected && (
            <span className="absolute -top-1 -right-1 text-[8px] font-black text-yellow-300" style={{ textShadow: '0 0 4px rgba(250,204,21,0.8)' }}>
              {playerActionOrder.indexOf(sk) + 1}
            </span>
          )}
          {!isDestroyed && level > 0 && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-px">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: i < level ? pState.color : 'rgba(255,255,255,0.2)' }}
                />
              ))}
            </div>
          )}
        </motion.button>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
            <div className="bg-black/90 border rounded-lg px-2 py-1 text-[7px] sm:text-[8px] whitespace-nowrap" style={{ borderColor: pState.color }}>
              <div className="font-black" style={{ color: pState.color }}>
                {pState.emoji} {slotName(slot || '')} - {pState.name}
              </div>
              {mutation.logDesc && <div className="text-white/70 mt-0.5">{mutation.logDesc}</div>}
              <div className="text-white/40 mt-0.5">Usos restantes: {PUTREFACCION_MAX - level}</div>
            </div>
          </div>
        )}
        {showDestroyedTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
            <div className="bg-black/90 border border-red-500/50 rounded-lg px-2 py-1 text-[7px] sm:text-[8px] whitespace-nowrap">
              <div className="font-black text-red-400">{slotName(slot || '')} DESTRUIDA</div>
              <div className="text-white/50">Skill perdida este combate</div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
          {equippedSkills.map((sk, idx) => renderSkillButton(sk, idx))}
          {enemyPutrefaccion && enemyPutrefaccion > 0 && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 border border-green-500/30 rounded-full px-2 py-0.5 z-40">
              <span className="text-[7px] font-black text-green-400">INFECCION {enemyPutrefaccion}</span>
            </div>
          )}
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
                  <span className="text-lg sm:text-xl">Potion</span>
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
                  <span className="text-lg sm:text-xl">Item</span>
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
                <span className="text-lg">-</span>
              </motion.button>
            );
          })}
        </>
      )}
    </div>
  );

  const renderIntentBadge = () => (
    <div className="absolute top-2 left-2 z-20">
      {enemyActions.length > 0 ? (
        <div className="flex flex-row gap-1">
          {enemyActions.map((action, idx) => {
            const isExecuting = turnPhase === 'executing' && currentActionSlot === idx && currentActor === 'enemy';
            const isDone = turnPhase === 'executing' && currentActionSlot > idx;
            const hasMaster = action.isMasterSkill;
            const skillIcon = action.skillData?.icon || null;
            const shortName = action.skillData?.name || action.icon;
            const shortValue = action.type === 'attack' ? `${action.value}` : action.type === 'buff' ? 'BUF' : action.type === 'defend' ? 'DEF' : '';

            return (
              <div
                key={idx}
                className={`flex flex-col items-center transition-all ${isDone ? 'opacity-25' : ''}`}
              >
                <motion.div
                  animate={isExecuting ? { scale: [1, 1.15, 1] } : {}}
                  transition={isExecuting ? { duration: 0.8, repeat: Infinity } : {}}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 relative flex items-center justify-center bg-black/70 ${
                    isExecuting
                      ? 'border-red-500 shadow-[0_0_14px_rgba(220,38,38,0.7)]'
                      : hasMaster
                        ? 'border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : 'border-white/20 shadow-[0_0_6px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {skillIcon ? (
                    <img src={skillIcon} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className={`text-sm sm:text-base flex items-center justify-center w-full h-full ${isExecuting ? 'animate-pulse' : ''}`}>{action.icon}</span>
                  )}
                  {hasMaster && !isDone && (
                    <span className="absolute -top-0.5 -right-0.5 text-[7px] text-yellow-300" style={{ textShadow: '0 0 3px rgba(234,179,8,0.9)' }}>*</span>
                  )}
                </motion.div>
                <div className={`mt-0.5 text-center leading-none ${isDone ? 'opacity-40' : ''}`}>
                  <div className={`text-[5px] sm:text-[7px] font-black tracking-tight truncate max-w-[32px] sm:max-w-[40px] ${
                    hasMaster && !isDone ? 'text-yellow-300' : 'text-white/80'
                  }`}>
                    {shortName}
                  </div>
                  {shortValue && (
                    <div className={`text-[5px] sm:text-[7px] font-black ${
                      isExecuting ? 'text-red-400 animate-pulse' : hasMaster ? 'text-yellow-300/80' : 'text-white/50'
                    }`}>
                      {shortValue}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 border border-white/20 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          <span className="text-sm sm:text-base animate-pulse">⚔️</span>
          <span className="text-[8px] sm:text-[10px] font-black tracking-wider text-white/60">Esperando...</span>
        </div>
      )}
    </div>
  );

  const renderPlayerExecutionMirror = () => {
    if (turnPhase !== 'executing' || !playerActionOrder || playerActionOrder.length === 0) return null;
    return (
      <div className="absolute top-2 right-2 z-20">
        <div className="flex flex-row gap-1">
          {[0, 1, 2, 3].map(idx => {
            const skillId = playerActionOrder[idx];
            const tech = skillId && skillId !== '' ? (TDB as Record<string, Technique>)[skillId] : null;
            const isExecuting = currentActionSlot === idx && currentActor === 'player';
            const isDone = currentActionSlot > idx;
            const isEmpty = !tech;
            const skillIcon = tech?.icon || null;

            return (
              <motion.div
                key={idx}
                animate={isExecuting ? { scale: [1, 1.18, 1] } : {}}
                transition={isExecuting ? { duration: 0.7, repeat: Infinity } : {}}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 relative flex items-center justify-center bg-black/70 transition-all duration-300 ${
                  isEmpty
                    ? 'border-white/15 opacity-30'
                    : isExecuting
                      ? 'border-[#d4943a] shadow-[0_0_14px_rgba(212,148,58,0.8),0_0_4px_rgba(212,148,58,0.5)_inset]'
                      : isDone
                        ? 'border-white/15 opacity-25'
                        : 'border-[#d4943a]/40 shadow-[0_0_6px_rgba(212,148,58,0.3)]'
                }`}
              >
                {isEmpty ? (
                  <span className="text-[9px] sm:text-[10px] text-white/20 font-black">-</span>
                ) : skillIcon ? (
                  <img src={skillIcon} alt="" className={`w-full h-full object-cover ${isExecuting ? 'brightness-130 saturate-150' : isDone ? 'brightness-50' : ''}`} loading="lazy" />
                ) : (
                  <span className={`text-xs sm:text-sm ${isExecuting ? 'animate-pulse' : isDone ? 'opacity-40' : ''}`}>{tech?.emoji || '?'}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

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
    return (
      <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden shadow-[0_0_16px_rgba(220,38,38,0.3)]" onClick={() => combatMenu !== 'main' && setCombatMenu('main')}>
        <img src={img} alt={enemy?.name} className="w-full h-full object-cover min-h-[300px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        {renderIntentBadge()}
        {renderPlayerExecutionMirror()}
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
        {turnPhase !== 'executing' && renderActionButtons()}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full border-2 border-danger/50 overflow-hidden bg-[#1a1428] shadow-[0_0_16px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center min-h-[300px]" onClick={() => combatMenu !== 'main' && setCombatMenu('main')}>
      {renderIntentBadge()}
      {renderPlayerExecutionMirror()}
      <div className="text-4xl sm:text-5xl mb-2">{enemy?.emoji}</div>
      <div className="text-danger font-display font-black text-sm sm:text-lg truncate drop-shadow-md">{enemy?.name}</div>
      <div className="w-4/5 h-1.5 sm:h-2 bg-black/60 border border-danger/30 p-[1px] relative overflow-hidden mt-2">
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }} className="absolute inset-y-0 left-0 bg-white/30 z-10" />
        <motion.div initial={false} animate={{ width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%` }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="h-full bg-gradient-to-r from-red-600 to-red-400 relative z-20 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
      </div>
      <div className="text-[7px] sm:text-[9px] font-black text-white/80 font-mono uppercase tracking-tighter mt-1">{enemyHp} / {enemyMaxHp} HP</div>
      {turnPhase !== 'executing' && renderActionButtons()}
    </div>
  );
}
