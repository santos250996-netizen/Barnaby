/**
 * Barrel export for all game hooks.
 * Re-exports hooks from individual modules.
 */

export { useAudio } from './useAudio';
export { useTravel } from './useTravel';
export { useNPC, NPC_DIALOGS } from './useNPC';
export type { NpcDialogDef, NpcDialogOption } from './useNPC';
export { useInventory } from './useInventory';
export { useCombatActions } from './useCombatActions';
export { usePreloadContext, usePrefetchAdjacent, preloadEnemyImages } from './usePreloadImages';
