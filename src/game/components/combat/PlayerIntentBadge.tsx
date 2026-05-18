'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { TDB } from '@/game/data';
import { Technique } from '@/game/data/types';

interface PlayerIntentBadgeProps {
  playerActionOrder: string[];
  turnPhase: 'planning' | 'executing';
  currentActionSlot: number;
}

function getIntentType(tech: Technique): 'attack' | 'defend' | 'buff' | 'sacrifice' {
  if (tech.type === 'sacrifice') return 'sacrifice';
  if (tech.type === 'defense') return 'defend';
  if (tech.damage > 0) return 'attack';
  return 'buff';
}

function getShortValue(tech: Technique): string {
  const intent = getIntentType(tech);
  if (intent === 'attack') {
    return tech.damageRange || `${tech.damage}`;
  }
  if (intent === 'defend') {
    if (tech.heal > 0 && tech.shield) return 'ESC+CURA';
    if (tech.shield) return 'ESC';
    if (tech.heal > 0) return 'CURA';
    return 'DEF';
  }
  if (intent === 'sacrifice') return 'SAC';
  if (tech.fury) return 'BUF';
  if (tech.heal > 0) return 'CURA';
  return 'BUF';
}

export function PlayerIntentBadge({
  playerActionOrder,
  turnPhase,
  currentActionSlot,
}: PlayerIntentBadgeProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !playerActionOrder || playerActionOrder.length === 0) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '6px' }}>
        {[0, 1, 2, 3].map(idx => {
          const skillId = playerActionOrder[idx];
          const tech = skillId && skillId !== '' ? (TDB as Record<string, Technique>)[skillId] : null;

          const isExecuting = turnPhase === 'executing' && currentActionSlot === idx;
          const isDone = turnPhase === 'executing' && currentActionSlot > idx;
          const isEmpty = !tech;

          const shortName = tech?.name || '';
          const shortValue = tech ? getShortValue(tech) : '';
          const skillIcon = tech?.icon || null;
          const isSacrifice = tech?.type === 'sacrifice';

          let borderColor = 'rgba(212,148,58,0.5)';
          let boxShadow = '0 0 8px rgba(212,148,58,0.4)';
          if (isEmpty) {
            borderColor = 'rgba(255,255,255,0.25)';
            boxShadow = 'none';
          } else if (isExecuting) {
            borderColor = '#d4943a';
            boxShadow = '0 0 16px rgba(212,148,58,0.8), 0 0 4px rgba(212,148,58,0.5) inset';
          } else if (isSacrifice) {
            borderColor = 'rgba(248,113,113,0.6)';
            boxShadow = '0 0 10px rgba(248,113,113,0.5)';
          }

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s',
                opacity: isDone ? 0.3 : 1,
                transform: isDone ? 'scale(0.9)' : 'none',
              }}
            >
              <motion.div
                animate={isExecuting ? { scale: [1, 1.18, 1] } : {}}
                transition={isExecuting ? { duration: 0.7, repeat: Infinity } : {}}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${borderColor}`,
                  boxShadow,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isEmpty ? (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 900 }}>
                    {idx + 1}
                  </span>
                ) : skillIcon ? (
                  <img
                    src={skillIcon}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isExecuting ? 'brightness(1.3) saturate(1.5)' : 'none',
                    }}
                    loading="lazy"
                  />
                ) : (
                  <span style={{ fontSize: '14px' }}>
                    {tech?.emoji || '?'}
                  </span>
                )}
                {!isEmpty && turnPhase === 'planning' && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#d4943a',
                    color: '#000',
                    fontSize: '7px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 4px rgba(0,0,0,0.8)',
                  }}>
                    {idx + 1}
                  </span>
                )}
              </motion.div>
              <div style={{ marginTop: '2px', textAlign: 'center', lineHeight: 1 }}>
                {!isEmpty ? (
                  <>
                    <div style={{
                      fontSize: '7px',
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      maxWidth: '40px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isExecuting ? '#d4943a' : isSacrifice ? '#fca5a5' : 'rgba(255,255,255,0.9)',
                    }}>
                      {shortName}
                    </div>
                    {shortValue && (
                      <div style={{
                        fontSize: '7px',
                        fontWeight: 900,
                        color: isExecuting ? '#d4943a' : isSacrifice ? 'rgba(252,165,165,0.8)' : 'rgba(255,255,255,0.6)',
                      }}>
                        {shortValue}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}
