'use client';

import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getItemData } from '../constants';
import type { InventoryItem, EquipSlot } from '../types';

/**
 * useInventory — Extracts equipment/inventory management from BarnabyGame.tsx.
 * Handles: equipItem, unequipItem, equipConsumable, useConsumable
 *
 * Equipment logic:
 *  - Equipping: removes item from inventory, puts previous equipment back,
 *    sets new equipment with putrefaccion from ItemData
 *  - Unequipping: removes from equipment slot, puts back in inventory
 *  - Consumable slots: equip a consumable type (e.g. 'potion') to slot 0 or 1
 */
export function useInventory() {
  const setGameState = useGameStore(s => s.setGameState);
  const addToast = useGameStore(s => s.addToast);

  /**
   * Equip an inventory item to the appropriate body slot.
   * If a piece is already equipped in that slot, it goes back to inventory.
   */
  const equipItem = useCallback(
    (invItem: InventoryItem, playSound: (type: string) => void) => {
      const data = getItemData(invItem.id);
      if (!data) return;
      const slot = data.slot;

      setGameState(prev => {
        const newInv = [...prev.inventory];
        const prevEq = (prev.equipment as any)[slot] as EquipSlot | null;

        // Unequip previous: put it back in inventory
        if (prevEq) {
          newInv.push({ id: prevEq.id, rarity: prevEq.rarity, skillRarities: prevEq.skillRarities || {} });
        }

        // Remove equipped item from inventory
        const invIdx = newInv.findIndex(
          (i) => i.id === invItem.id && i.rarity === invItem.rarity
        );
        if (invIdx >= 0) newInv.splice(invIdx, 1);

        return {
          ...prev,
          equipment: {
            ...prev.equipment,
            [slot]: {
              id: invItem.id,
              putrefaccion: data.maxPutrefaccion || 20,
              rarity: invItem.rarity,
              skillRarities: invItem.skillRarities || {},
            },
          },
          inventory: newInv,
        };
      });

      playSound('equip');
    },
    [setGameState]
  );

  /**
   * Unequip an item from a body slot, putting it back in inventory.
   */
  const unequipItem = useCallback(
    (slot: string, playSound: (type: string) => void) => {
      setGameState(prev => {
        const eq = (prev.equipment as any)[slot] as EquipSlot | null;
        if (!eq) return prev;

        const newInv = [...prev.inventory, { id: eq.id, rarity: eq.rarity, skillRarities: eq.skillRarities || {} }];
        return {
          ...prev,
          equipment: { ...prev.equipment, [slot]: null },
          inventory: newInv,
        };
      });

      playSound('click');
    },
    [setGameState]
  );

  /**
   * Equip a consumable (e.g. 'potion') to a specific consumable slot (0 or 1).
   */
  const equipConsumable = useCallback(
    (slotIndex: 0 | 1, itemId: string) => {
      setGameState(prev => {
        const slots = [...(prev.consumableSlots || [null, null])] as [string | null, string | null];
        slots[slotIndex] = itemId;
        return { ...prev, consumableSlots: slots };
      });
    },
    [setGameState]
  );

  /**
   * Use a consumable from a specific slot.
   * Currently only supports 'potion' type.
   *
   * @param slotIndex - Which consumable slot (0 or 1)
   * @param callbacks - Object with side-effect callbacks:
   *   - usePotion: () => void — the potion usage logic
   */
  const useConsumable = useCallback(
    (slotIndex: 0 | 1, callbacks: { usePotion: () => void }) => {
      const state = useGameStore.getState();
      const slotItem = state.consumableSlots?.[slotIndex];
      if (!slotItem) return;

      if (slotItem === 'potion') {
        callbacks.usePotion();
      }
      // Future: add more consumable types here
    },
    []
  );

  return { equipItem, unequipItem, equipConsumable, useConsumable };
}
