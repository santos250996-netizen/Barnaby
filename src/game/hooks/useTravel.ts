'use client';

import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOC, LORE_DATA, getItemData } from '../constants';
import { rollTravelEvent, TravelEventEffect } from '../travelEvents';

/**
 * useTravel — Extracts travel logic from BarnabyGame.tsx.
 * Handles: travel animation, location change, travel event rolling (30% chance),
 * and lore unlock by location.
 */
export function useTravel() {
  const setGameState = useGameStore(s => s.setGameState);
  const addToast = useGameStore(s => s.addToast);
  const setTravelTransition = useGameStore(s => s.setTravelTransition);
  const setActivePanel = useGameStore(s => s.setActivePanel);
  const setTravelEvent = useGameStore(s => s.setTravelEvent);

  /**
   * Check and unlock lore entries based on a trigger (location, npc, boss).
   * Mirrors the original checkLoreUnlocks logic.
   */
  const checkLoreUnlocks = useCallback(
    (trigger: string, value: string) => {
      setGameState(prev => {
        const currentUnlocked = prev.unlockedLore || [];
        const newUnlocks: string[] = [];
        LORE_DATA.forEach((entry: any) => {
          if (currentUnlocked.includes(entry.id)) return;
          const cond = entry.unlockCondition;
          if (cond === 'start') { newUnlocks.push(entry.id); return; }
          if (cond === `location:${value}`) { newUnlocks.push(entry.id); return; }
          if (cond === `npc:${value}`) { newUnlocks.push(entry.id); return; }
          if (cond === `boss:${value}`) { newUnlocks.push(entry.id); return; }
        });
        if (newUnlocks.length > 0) {
          const firstEntry = LORE_DATA.find((e: any) => e.id === newUnlocks[0]);
          if (firstEntry) {
            addToast(`📜 Lore desbloqueado: ${firstEntry.title}`, 'info');
          }
          return { ...prev, unlockedLore: [...currentUnlocked, ...newUnlocks] };
        }
        return prev;
      });
    },
    [LORE_DATA, addToast, setGameState]
  );

  /**
   * Travel to a new location with transition animation.
   * - Plays walk sound
   * - Shows transition overlay for 800ms
   * - Changes location in store
   * - Checks for lore unlocks
   * - Rolls for travel event (30% chance)
   */
  const travelTo = useCallback(
    (loc: string, playSound: (type: string) => void) => {
      const locName = LOC[loc]?.name || loc;
      setTravelTransition(locName);
      setActivePanel(null);
      playSound('walk');

      setTimeout(() => {
        setGameState(prev => ({ ...prev, currentLocation: loc }));
        setTravelTransition(null);

        // Unlock lore by location
        checkLoreUnlocks('location', loc);

        // Roll for travel event (30% chance)
        const event = rollTravelEvent(loc);
        if (event) {
          setTravelEvent(event);
          playSound('click');
        }
      }, 800);
    },
    [setGameState, setTravelTransition, setActivePanel, setTravelEvent, checkLoreUnlocks]
  );

  /**
   * Dismiss the current travel event without applying any effect.
   */
  const dismissTravelEvent = useCallback(() => {
    setTravelEvent(null);
  }, [setTravelEvent]);

  /**
   * Compute max pieces from current store state (helper for travel effects).
   */
  const computeMaxPieces = useCallback(() => {
    const state = useGameStore.getState();
    let bonus = 0;
    const RARE_PLUS = ['raro', 'epico', 'legendario'];
    (Object.values(state.equipment) as any[]).forEach(eq => {
      if (eq && eq.id) {
        const item = getItemData(eq.id);
        if (item?.stats?.maxPieces) bonus += item.stats.maxPieces;
      }
    });
    return state.maxPieces + bonus;
  }, []);

  /**
   * Apply a travel event effect to game state, show feedback toasts, and dismiss.
   * Mirrors the original applyTravelEventEffect logic.
   */
  const handleTravelChoice = useCallback(
    (effect: TravelEventEffect | undefined, playSound: (type: string) => void) => {
      if (!effect) {
        setTravelEvent(null);
        return;
      }

      const maxP = computeMaxPieces();

      setGameState(prev => {
        const newPieces = effect.pieces
          ? Math.max(1, Math.min(maxP, prev.pieces + effect.pieces))
          : prev.pieces;
        const newShards = effect.shards
          ? Math.max(0, prev.resources.shards + effect.shards)
          : prev.resources.shards;
        const newPotions = effect.potions
          ? Math.max(0, prev.resources.potions + effect.potions)
          : prev.resources.potions;
        return {
          ...prev,
          pieces: newPieces,
          resources: { ...prev.resources, shards: newShards, potions: newPotions },
        };
      });

      // Show feedback toasts
      if (effect.shards && effect.shards > 0) addToast(`+${effect.shards}💎`, 'success');
      if (effect.shards && effect.shards < 0) addToast(`${effect.shards}💎`, 'error');
      if (effect.pieces && effect.pieces > 0) addToast(`+${effect.pieces} piezas`, 'success');
      if (effect.pieces && effect.pieces < 0) addToast(`${effect.pieces} piezas`, 'error');
      if (effect.potions && effect.potions > 0) addToast(`+${effect.potions} pociones`, 'success');

      playSound('coin');
      setTravelEvent(null);
    },
    [addToast, setGameState, setTravelEvent, computeMaxPieces]
  );

  return { travelTo, dismissTravelEvent, handleTravelChoice, checkLoreUnlocks };
}
