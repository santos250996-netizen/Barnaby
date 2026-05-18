import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EquipSlot,
  GameState,
  CombatFx,
  LogEntry,
  Toast,
  FloatingNumber,
  InventoryItem,
  TurnPhase,
  TempBuffs,
} from '../types';
import { INITIAL_STATE, DEFAULT_TEMP_BUFFS } from '../types';
import type { Rarity } from '../constants';

// ═══════════════════════════════════════════════════════════════
// Extended type definitions for the store
// ═══════════════════════════════════════════════════════════════

export interface EnemyIntent {
  type: string;
  value: number;
  icon: string;
  text: string;
  skillId?: string;
  skillData?: any;
  isMasterSkill?: boolean;
}

export interface PreRolledDrop {
  itemName: string;
  itemRarity: Rarity;
  skillRarities: Record<string, Rarity>;
  partStats: Record<string, number>;
}

export interface ModalData {
  title: string;
  msg: string;
  onConfirm: () => void;
}

export interface NpcDialogData {
  name: string;
  text: string;
  options: any[];
  info?: string;
}

export interface CombatVfxData {
  type: string;
  id: string;
  target: 'player' | 'enemy';
}

// ═══════════════════════════════════════════════════════════════
// CombatState — NOT persisted (transient)
// ═══════════════════════════════════════════════════════════════

export interface CombatState {
  isCombat: boolean;
  enemy: any | null;
  enemyHp: number;
  enemyMaxHp: number;
  isPlayerTurn: boolean;
  enemyIntent: EnemyIntent | null;
  combatLog: LogEntry[];
  combatFx: CombatFx | null;
  isEnemyAnimating: boolean;
  shield: number;
  furyActive: boolean;
  bleedOnEnemy: number;
  bleedOnPlayer: number;
  poisonOnEnemy: number;
  freezeOnEnemy: number;
  freezeOnPlayer: number;
  debuffOnEnemy: number;
  enemyDebuff: number;
  enemyTurnCount: number;
  combatMenu: 'main' | 'skills' | 'items';
  firstAttackDone: boolean;
  masterSkillUsed: boolean;
  preRolledDrop: PreRolledDrop | null;
  // ── 4-Action Turn System ──
  enemyActions: EnemyIntent[];      // 4 enemy actions for current turn
  playerActionOrder: string[];      // 4 ordered skill IDs the player selected
  turnPhase: TurnPhase;             // 'planning' | 'executing'
  currentActionSlot: number;        // 0-3 which slot is currently executing
  turnNumber: number;               // for speed tie alternation
  tempBuffs: TempBuffs;             // temporary buffs for this turn only
  currentActor: 'player' | 'enemy' | null;  // who is currently executing their action
  // ── Putrefacción por combate ──
  playerPutrefaccion: Record<string, number>;  // head/torso/arms/legs → 0-4
  enemyPutrefaccion: number;                   // putrefacción acumulada del enemigo (infección)
}

// ═══════════════════════════════════════════════════════════════
// UIState — NOT persisted (transient)
// ═══════════════════════════════════════════════════════════════

export interface UIState {
  activePanel: string | null;
  toasts: Toast[];
  floatingNumbers: FloatingNumber[];
  screenShake: boolean;
  flash: string | null;
  npcDialog: NpcDialogData | null;
  travelEvent: any | null;
  showIntro: boolean;
  modal: ModalData | null;
  isDungeon: boolean;
  travelTransition: string | null;
  activeCombatVfx: CombatVfxData | null;
  vsSlam: boolean;
  showNpcInfo: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════════

export interface GameActions {
  addShards: (amount: number) => void;
  changeLocation: (location: string) => void;
  equipItem: (slot: keyof GameState['equipment'], item: EquipSlot) => void;
  unequipItem: (slot: keyof GameState['equipment']) => void;
  equipConsumable: (slotIndex: 0 | 1, itemId: string) => void;
  useConsumable: (slotIndex: 0 | 1) => void;
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (itemId: string) => void;
  updateBestiary: (enemyName: string, droppedPart?: string) => void;
  startQuest: (quest: any) => void;
  advanceQuest: (questId: string, amount?: number) => void;
  completeQuest: (questId: string) => void;
  unlockLore: (loreId: string) => void;
  visitLocation: (location: string) => void;
  resetGame: () => void;
  setGameState: (updater: (prev: GameState) => Partial<GameState>) => void;

  // Combat actions
  startCombat: (enemyData: any, logs: LogEntry[], playerFirst: boolean, intent: EnemyIntent, preRoll: PreRolledDrop | null) => void;
  endCombat: () => void;
  setEnemyHp: (hp: number) => void;
  setPlayerTurn: (isTurn: boolean) => void;
  setEnemyIntent: (intent: EnemyIntent | null) => void;
  addCombatLog: (entry: LogEntry) => void;
  setCombatFx: (fx: CombatFx | null) => void;
  setShield: (amount: number) => void;
  setFuryActive: (active: boolean) => void;
  setBleedOnEnemy: (amount: number) => void;
  setBleedOnPlayer: (amount: number) => void;
  setPoisonOnEnemy: (amount: number) => void;
  setFreezeOnEnemy: (turns: number) => void;
  setFreezeOnPlayer: (turns: number) => void;
  setDebuffOnEnemy: (turns: number) => void;
  setEnemyDebuff: (amount: number) => void;
  setIsEnemyAnimating: (animating: boolean) => void;
  clearCombatState: () => void;
  setEnemyTurnCount: (count: number) => void;
  setCombatMenu: (menu: 'main' | 'skills' | 'items') => void;
  setFirstAttackDone: (done: boolean) => void;
  setMasterSkillUsed: (used: boolean) => void;
  setPreRolledDrop: (drop: PreRolledDrop | null) => void;

  // 4-Action Turn System actions
  setEnemyActions: (actions: EnemyIntent[]) => void;
  setPlayerActionOrder: (order: string[]) => void;
  setTurnPhase: (phase: TurnPhase) => void;
  setCurrentActionSlot: (slot: number) => void;
  setTurnNumber: (num: number) => void;
  setTempBuffs: (buffs: TempBuffs) => void;
  setCurrentActor: (actor: 'player' | 'enemy' | null) => void;

  // Putrefacción actions
  setPlayerPutrefaccion: (putref: Record<string, number>) => void;
  setEnemyPutrefaccion: (level: number) => void;

  // UI actions
  setActivePanel: (panel: string | null) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  addFloatingNumber: (fn: FloatingNumber) => void;
  removeFloatingNumber: (id: number) => void;
  setScreenShake: (shake: boolean) => void;
  setFlash: (flash: string | null) => void;
  setNpcDialog: (dialog: NpcDialogData | null) => void;
  setTravelEvent: (event: any | null) => void;
  setShowIntro: (show: boolean) => void;
  setModal: (modal: ModalData | null) => void;
  setIsDungeon: (isDungeon: boolean) => void;
  setTravelTransition: (transition: string | null) => void;
  setActiveCombatVfx: (vfx: CombatVfxData | null) => void;
  setVsSlam: (slam: boolean) => void;
  setShowNpcInfo: (show: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// Default values
// ═══════════════════════════════════════════════════════════════

const DEFAULT_COMBAT: CombatState = {
  isCombat: false,
  enemy: null,
  enemyHp: 0,
  enemyMaxHp: 0,
  isPlayerTurn: true,
  enemyIntent: null,
  combatLog: [],
  combatFx: null,
  isEnemyAnimating: false,
  shield: 0,
  furyActive: false,
  bleedOnEnemy: 0,
  bleedOnPlayer: 0,
  poisonOnEnemy: 0,
  freezeOnEnemy: 0,
  freezeOnPlayer: 0,
  debuffOnEnemy: 0,
  enemyDebuff: 0,
  enemyTurnCount: 0,
  combatMenu: 'main',
  firstAttackDone: false,
  masterSkillUsed: false,
  preRolledDrop: null,
  // ── 4-Action Turn System ──
  enemyActions: [],
  playerActionOrder: [],
  turnPhase: 'planning' as TurnPhase,
  currentActionSlot: 0,
  turnNumber: 0,
  tempBuffs: { ...DEFAULT_TEMP_BUFFS },
  currentActor: null,
  // ── Putrefacción por combate ──
  playerPutrefaccion: { head: 0, torso: 0, arms: 0, legs: 0 },
  enemyPutrefaccion: 0,
};

const DEFAULT_UI: UIState = {
  activePanel: null,
  toasts: [],
  floatingNumbers: [],
  screenShake: false,
  flash: null,
  npcDialog: null,
  travelEvent: null,
  showIntro: true,
  modal: null,
  isDungeon: false,
  travelTransition: null,
  activeCombatVfx: null,
  vsSlam: false,
  showNpcInfo: false,
};

// ═══════════════════════════════════════════════════════════════
// Full store type
// ═══════════════════════════════════════════════════════════════

export type GameStore = GameState & CombatState & UIState & GameActions;

// ═══════════════════════════════════════════════════════════════
// Store creation
// ═══════════════════════════════════════════════════════════════

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── GameState defaults ──
      ...INITIAL_STATE,

      // ── CombatState defaults ──
      ...DEFAULT_COMBAT,

      // ── UIState defaults ──
      ...DEFAULT_UI,

      // ══════════════════════════════════════════
      // Game Actions
      // ══════════════════════════════════════════

      addShards: (amount) =>
        set((state) => ({
          resources: { ...state.resources, shards: state.resources.shards + amount },
        })),

      changeLocation: (location) =>
        set((state) => ({
          currentLocation: location,
        })),

      equipItem: (slot, item) =>
        set((state) => ({
          equipment: { ...state.equipment, [slot]: item },
        })),

      unequipItem: (slot) =>
        set((state) => ({
          equipment: { ...state.equipment, [slot]: null },
        })),

      equipConsumable: (slotIndex, itemId) =>
        set((state) => {
          const slots = [...(state.consumableSlots || [null, null])] as [string | null, string | null];
          slots[slotIndex] = itemId;
          return { consumableSlots: slots };
        }),

      useConsumable: (_slotIndex) => {
        // Placeholder
      },

      addToInventory: (item) =>
        set((state) => ({
          inventory: [...state.inventory, item],
        })),

      removeFromInventory: (itemId) =>
        set((state) => ({
          inventory: state.inventory.filter((i) => i.id !== itemId),
        })),

      updateBestiary: (enemyName, droppedPart) =>
        set((state) => {
          const newBestiary = { ...(state.bestiary || {}) };
          const entry = newBestiary[enemyName] || { kills: 0, dropsFound: [] };
          entry.kills += 1;
          if (droppedPart && !entry.dropsFound.includes(droppedPart)) {
            entry.dropsFound.push(droppedPart);
          }
          newBestiary[enemyName] = entry;
          return { bestiary: newBestiary };
        }),

      startQuest: (quest) =>
        set((state) => ({
          activeQuests: [...state.activeQuests, quest],
        })),

      advanceQuest: (questId, amount = 1) =>
        set((state) => ({
          questProgress: {
            ...(state.questProgress || {}),
            [questId]: ((state.questProgress || {})[questId] || 0) + amount,
          },
        })),

      completeQuest: (questId) =>
        set((state) => ({
          completedQuests: [...(state.completedQuests || []), questId],
          activeQuests: state.activeQuests.filter((q: any) =>
            typeof q === 'string' ? q !== questId : q.id !== questId
          ),
        })),

      unlockLore: (loreId) =>
        set((state) => {
          const current = state.unlockedLore || [];
          if (current.includes(loreId)) return state;
          return { unlockedLore: [...current, loreId] };
        }),

      visitLocation: (location) =>
        set((state) => {
          const current = state.unlockedLocations || [];
          if (current.includes(location)) return state;
          return { unlockedLocations: [...current, location] };
        }),

      resetGame: () =>
        set((state) => ({
          ...INITIAL_STATE,
        })),

      setGameState: (updater) =>
        set((state) => updater(state)),

      // ══════════════════════════════════════════
      // Combat Actions
      // ══════════════════════════════════════════

      startCombat: (enemyData, logs, playerFirst, intent, preRoll) =>
        set((state) => ({
          isCombat: true,
          enemy: enemyData,
          enemyHp: enemyData.hp,
          enemyMaxHp: enemyData.hp,
          isPlayerTurn: playerFirst,
          enemyIntent: intent,
          combatLog: logs,
          combatFx: {
            enemyBleed: 0, enemyBleedTurns: 0,
            enemyPoison: 0, enemyPoisonTurns: 0,
            enemyFrozen: false,
            enemyDebuff: false, enemyDebuffTurns: 0,
            enemyFury: false, enemyFuryTurns: 0,
            enemyShield: false, enemyShieldValue: 0,
            playerShield: false, playerGuard: false,
            playerPoison: false, playerPoisonTurns: 0, playerPoisonDmg: 0,
            playerBleed: false, playerBleedTurns: 0, playerBleedDmg: 0,
            playerDebuff: false, playerDebuffTurns: 0,
            playerFrozen: false, playerStunCount: 0,
          },
          isEnemyAnimating: false,
          shield: 0,
          furyActive: false,
          bleedOnEnemy: 0,
          bleedOnPlayer: 0,
          poisonOnEnemy: 0,
          freezeOnEnemy: 0,
          freezeOnPlayer: 0,
          debuffOnEnemy: 0,
          enemyDebuff: 0,
          enemyTurnCount: 0,
          combatMenu: 'main',
          firstAttackDone: false,
          masterSkillUsed: false,
          preRolledDrop: preRoll,
          enemyActions: [],
          playerActionOrder: [],
          turnPhase: 'planning' as TurnPhase,
          currentActionSlot: 0,
          turnNumber: 0,
          tempBuffs: { ...DEFAULT_TEMP_BUFFS },
          // ── Putrefacción reset por combate ──
          playerPutrefaccion: { head: 0, torso: 0, arms: 0, legs: 0 },
          enemyPutrefaccion: 0,
        })),

      endCombat: () =>
        set((state) => ({
          ...DEFAULT_COMBAT,
        })),

      setEnemyHp: (hp) => set({ enemyHp: hp }),
      setPlayerTurn: (isTurn) => set({ isPlayerTurn: isTurn }),
      setEnemyIntent: (intent) => set({ enemyIntent: intent }),

      addCombatLog: (entry) =>
        set((state) => ({
          combatLog: [...state.combatLog, entry],
        })),

      setCombatFx: (fx) => set({ combatFx: fx }),
      setShield: (amount) => set({ shield: amount }),
      setFuryActive: (active) => set({ furyActive: active }),
      setBleedOnEnemy: (amount) => set({ bleedOnEnemy: amount }),
      setBleedOnPlayer: (amount) => set({ bleedOnPlayer: amount }),
      setPoisonOnEnemy: (amount) => set({ poisonOnEnemy: amount }),
      setFreezeOnEnemy: (turns) => set({ freezeOnEnemy: turns }),
      setFreezeOnPlayer: (turns) => set({ freezeOnPlayer: turns }),
      setDebuffOnEnemy: (turns) => set({ debuffOnEnemy: turns }),
      setEnemyDebuff: (amount) => set({ enemyDebuff: amount }),
      setIsEnemyAnimating: (animating) => set({ isEnemyAnimating: animating }),
      clearCombatState: () => set({ ...DEFAULT_COMBAT }),
      setEnemyTurnCount: (count) => set({ enemyTurnCount: count }),
      setCombatMenu: (menu) => set({ combatMenu: menu }),
      setFirstAttackDone: (done) => set({ firstAttackDone: done }),
      setMasterSkillUsed: (used) => set({ masterSkillUsed: used }),
      setPreRolledDrop: (drop) => set({ preRolledDrop: drop }),

      // ── 4-Action Turn System ──
      setEnemyActions: (actions) => set({ enemyActions: actions }),
      setPlayerActionOrder: (order) => set({ playerActionOrder: order }),
      setTurnPhase: (phase) => set({ turnPhase: phase }),
      setCurrentActionSlot: (slot) => set({ currentActionSlot: slot }),
      setTurnNumber: (num) => set({ turnNumber: num }),
      setTempBuffs: (buffs) => set({ tempBuffs: buffs }),
      setCurrentActor: (actor) => set({ currentActor: actor }),

      // ── Putrefacción ──
      setPlayerPutrefaccion: (putref) => set({ playerPutrefaccion: putref }),
      setEnemyPutrefaccion: (level) => set({ enemyPutrefaccion: level }),

      // ══════════════════════════════════════════
      // UI Actions
      // ══════════════════════════════════════════

      setActivePanel: (panel) => set({ activePanel: panel }),

      addToast: (msg, type) => {
        const id = Date.now() + Math.random();
        set((state) => ({
          toasts: [...state.toasts, { id, msg, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 2500);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      addFloatingNumber: (fn) =>
        set((state) => ({
          floatingNumbers: [...state.floatingNumbers, fn],
        })),

      removeFloatingNumber: (id) =>
        set((state) => ({
          floatingNumbers: state.floatingNumbers.filter((f) => f.id !== id),
        })),

      setScreenShake: (shake) => set({ screenShake: shake }),
      setFlash: (flash) => set({ flash }),
      setNpcDialog: (dialog) => set({ npcDialog: dialog }),
      setTravelEvent: (event) => set({ travelEvent: event }),
      setShowIntro: (show) => set({ showIntro: show }),
      setModal: (modal) => set({ modal }),
      setIsDungeon: (isDungeon) => set({ isDungeon }),
      setTravelTransition: (transition) => set({ travelTransition: transition }),
      setActiveCombatVfx: (vfx) => set({ activeCombatVfx: vfx }),
      setVsSlam: (slam) => set({ vsSlam: slam }),
      setShowNpcInfo: (show) => set({ showNpcInfo: show }),
    }),
    {
      name: 'barnaby_save',
      partialize: (state) => ({
        pieces: state.pieces,
        maxPieces: state.maxPieces,
        wins: state.wins,
        techniques: state.techniques,
        resources: state.resources,
        equipment: state.equipment,
        inventory: state.inventory,
        currentLocation: state.currentLocation,
        unlockedLocations: state.unlockedLocations,
        defeatedBosses: state.defeatedBosses,
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        storyFlags: state.storyFlags,
        dungeon: state.dungeon,
        bestiary: state.bestiary,
        questProgress: state.questProgress,
        consumableSlots: state.consumableSlots,
        unlockedLore: state.unlockedLore,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState;

        const persisted = persistedState as Record<string, any>;
        const merged = { ...currentState };

        for (const key of Object.keys(persisted)) {
          if (key in currentState) {
            if (key === 'resources' && typeof persisted[key] === 'object') {
              // Migrate: remove old calcium from saved resources
              const savedRes = { ...persisted[key] };
              delete savedRes.calcium;
              delete savedRes.exp;
              merged[key] = { ...(currentState as any)[key], ...savedRes };
            } else if (key === 'storyFlags' && typeof persisted[key] === 'object') {
              merged[key] = { ...(currentState as any)[key], ...persisted[key] };
            } else if (key === 'equipment' && typeof persisted[key] === 'object') {
              merged[key] = { ...(currentState as any)[key], ...persisted[key] };
            } else {
              merged[key] = persisted[key];
            }
          }
        }

        // Migration: old inventory format (string[]) → new (InventoryItem[])
        if (Array.isArray(merged.inventory)) {
          merged.inventory = merged.inventory.map((item: any) =>
            typeof item === 'string'
              ? { id: item, rarity: 'normal' as Rarity, skillRarities: {} }
              : item
          );
        }

        // Migration: old equipment format (no rarity) → new (with rarity)
        if (merged.equipment && typeof merged.equipment === 'object') {
          const eq = { ...INITIAL_STATE.equipment, ...merged.equipment };
          for (const slot of Object.keys(eq) as (keyof typeof eq)[]) {
            const e = eq[slot] as any;
            if (e && !e.rarity) {
              e.rarity = 'normal';
              e.skillRarities = e.skillRarities || {};
            }
          }
          merged.equipment = eq;
        }

        // Migration: ensure all zones are unlocked
        const ALL_ZONES = ["🏙️ Ciudad", "🌲 Bosque", "Catacumbas", "Paramo", "Cienaga", "Volcan", "Trono"];
        if (Array.isArray(merged.unlockedLocations)) {
          ALL_ZONES.forEach(z => {
            if (!merged.unlockedLocations.includes(z)) merged.unlockedLocations.push(z);
          });
        }

        // Migration: existing players (have completed quests) skip tutorial
        if (merged.storyFlags && !('tutorialComplete' in merged.storyFlags)) {
          const hasCompleted = Array.isArray(merged.completedQuests) && merged.completedQuests.length > 0;
          merged.storyFlags.tutorialComplete = hasCompleted;
        }

        // Migration: remove old fields
        delete (merged as any).level;
        delete (merged as any).exp;
        delete (merged as any).expToLevel;
        delete (merged as any).zoneLevels;

        return merged;
      },
    }
  )
);
