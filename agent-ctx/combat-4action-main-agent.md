# Task: Rewrite Barnaby RPG Combat Hook + EnemyCard UI for 4-Action Turn System

## Task ID: combat-4action
## Agent: Main Agent
## Date: 2026-03-04

## Summary
Rewrote the Barnaby RPG combat system from a 1-action-per-turn flow to a 4-action turn system with planning and execution phases.

## Files Modified

### 1. `/home/z/my-project/Barnaby/src/game/hooks/useCombatActions.ts` (Full Rewrite)
**Key Changes:**
- Added `swapSlots(slotA, slotB)` function for reordering player actions via click-to-swap
- Modified `startTurnPlanning` to auto-populate `playerActionOrder` with default skills from each equipment slot using `getPlayerSlotSkills()`
- Exported `getPlayerSlotSkills()` and `computeSpeed()` as standalone functions for use in BarnabyGame.tsx
- Fixed circular dependency issues using `useRef` pattern for `endTurn`, `endCombat`, `startTurnPlanning`, `executeNextAction`, `executePlayerSkill`, and `executeEnemySkill`
- Added `playerFrozen` check in `executeNextAction` - when player is frozen (from enemy freeze skill), the player's action in that slot is skipped
- Kept `handlePlayerAction` and `enemyTurn` as legacy compatibility stubs
- `startCombatWithEnemy` auto-populates player action order with default skills
- Return object includes: `startCombatWithEnemy`, `endCombat`, `startTurnPlanning`, `setSkillOrder`, `swapSlots`, `confirmPlayerOrder`, `executeNextAction`, `handlePlayerAction`, `enemyTurn`, `getEquippedSkills`, `findSkillSlot`, `calculateEnemyActionsForTurn`, `getPlayerSlotSkills`

### 2. `/home/z/my-project/Barnaby/src/game/components/combat/EnemyCard.tsx` (Full Rewrite)
**Key Changes:**
- Added swap functionality: click a player slot to select it (highlighted with glow), click another slot to swap the skills
- Replaced `require()` call with proper `getItemData` import from `@/game/data`
- Added `onSwapSlots` prop to the component interface
- Each player slot shows: skill emoji, skill name, putrefaccion indicator (amber number when ≤2), and speed indicator (⚡/🐾)
- Each enemy slot shows: skill icon, damage text, and speed indicator
- Putrefaccion bars rendered below the player slots showing degradation state
- During PLANNING phase: slots are clickable for reordering, "Confirmar" and "Huir" buttons shown, hint text "Toca para intercambiar"
- During EXECUTING phase: current executing slot highlighted with glow, completed slots dimmed, no reordering allowed
- Master skill enemy actions highlighted with yellow glow
- Auto-populated from `playerActionOrder` (set by the hook)
- Visual feedback: selected slot has accent glow + scale transform, swapped slots have amber tint

### 3. `/home/z/my-project/Barnaby/src/game/BarnabyGame.tsx` (Surgical Updates)
**Key Changes:**
- Added imports: `useCombatActions`, `getPlayerSlotSkills` from `@/game/hooks/useCombatActions`, `useGameStore` from `@/game/store/gameStore`
- Added `combatActions = useCombatActions()` hook call
- Added zustand selectors: `storeEnemyActions`, `storePlayerActionOrder`, `storeTurnPhase`, `storeCurrentActionSlot`, `storeTurnNumber`, `storeIsCombat`
- Updated EnemyCard props to use reactive zustand selectors instead of non-reactive `useGameStore.getState()` calls
- Added `onSwapSlots` prop to EnemyCard
- Updated TurnIndicator to use `storeTurnPhase === 'planning'` instead of local `isPlayerTurn`
- Modified `startCombat()` to also initialize the zustand store's 4-action system state (enemyActions, playerActionOrder, turnPhase, etc.)
- Disabled the old enemy-first useEffect (commented out) since it's no longer needed in 4-action system
- Added zustand store cleanup (`useGameStore.getState().endCombat()`) in local `endCombat()` function
- Removed the `enemyFirstRef.current = true` logic since planning phase handles turn order

## Architecture Decisions

### State Management
- BarnabyGame.tsx retains its local React state for backward compatibility with the extensive UI
- The zustand store is used for 4-action combat state (new fields: enemyActions, playerActionOrder, turnPhase, currentActionSlot, turnNumber, tempBuffs)
- EnemyCard reads from zustand selectors (reactive), while other combat UI reads from local state
- Both state systems are initialized in `startCombat()` and cleaned up in `endCombat()`

### Circular Dependency Resolution
Used `useRef` pattern to break circular dependencies between functions:
- `endTurn` references `startTurnPlanning` and `endCombat`
- `executeNextAction` references `endTurn` and `endCombat`
- `advanceSlot` references `executeNextAction`
- All refs are updated after each function definition

### Swap Mechanism
- Click-to-select, click-to-swap approach
- First click selects a slot (visual feedback: accent glow + scale)
- Second click on different slot swaps the two skills
- Second click on same slot deselects
- Only available during planning phase

## Build Status
- `next build` compiles successfully
- Pre-existing TypeScript/lint errors remain (unrelated to this task)
