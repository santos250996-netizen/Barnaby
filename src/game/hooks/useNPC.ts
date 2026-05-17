'use client';

import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { QST, getItemData } from '../constants';

// ═══════════════════════════════════════════════════════════════
// NPC Dialog Data — data-driven approach replacing the if/else chain
// ═══════════════════════════════════════════════════════════════

export interface NpcDialogOption {
  label: string;
  action: 'shop' | 'forge' | 'map' | 'rest' | 'dismiss' | 'combat' | 'custom';
  /** For combat actions: enemy name */
  combatTarget?: string;
  /** For combat actions: is boss */
  combatIsBoss?: boolean;
  /** For custom actions: arbitrary callback */
  customAction?: () => void;
}

export interface NpcDialogDef {
  /** Default greeting text */
  greeting: string;
  /** Extra options added before quest/close options */
  options: NpcDialogOption[];
  /** Info text shown on NPC info panel */
  info?: string;
  /** Conditional greeting override (checked in order, first match wins) */
  conditionalGreeting?: {
    check: (state: any) => boolean;
    text: string;
    extraOptions?: NpcDialogOption[];
  }[];
}

/**
 * NPC_DIALOGS — Data-driven NPC dialog definitions.
 * Each NPC has a greeting, options, and optional conditional greetings.
 * The hardcoded if/else chain from the original talkToNpc is replaced
 * by looking up the NPC name in this constant.
 */
export const NPC_DIALOGS: Record<string, NpcDialogDef> = {
  Morgana: {
    greeting: 'Barnaby... tus piezas suenan como música de ultratumba. ¿Buscas algo en particular?',
    options: [],
    info: '🔮 Morgana\n\nMorgana ofrece misiones y conoce los secretos de la nigromancia. Completa sus misiones para desbloquear nuevas zonas y obtener recompensas.',
  },
  Mercader: {
    greeting: 'Huesos, cristales, fragmentos... todo tiene un precio aquí.',
    options: [{ label: 'Ver Tienda', action: 'shop' }],
    info: '💰 Comerciante\n\nCompra pociones y materiales. El inventario se reabastece al descansar en la taberna.',
  },
  Herrero: {
    greeting: '¡Clang, clang! Mis martillos no descansan, igual que tus huesos. ¿Necesitas forjar algo?',
    options: [{ label: 'Abrir Forja', action: 'forge' }],
    info: '⚒️ Herrería\n\nAquí puedes fusionar 3 piezas idénticas para mejorar su rareza, y reparar piezas cuyo putrefacción se ha agotado. Todo cuesta fragmentos 💎.',
  },
  Tabernero: {
    greeting: '¡Eh, esqueleto! En mi taberna no juzgamos... mucho. ¿Quieres descansar? 20💎 por una cama y comida.',
    options: [{ label: 'Descansar (20💎)', action: 'rest' }],
    info: '🍻 Taberna\n\nDescansa para recuperar toda tu vida. Cuesta 20💎 por descanso. También reabastece la tienda.',
  },
  Viajero: {
    greeting: 'Los caminos son largos y peligrosos, pero yo conozco todos los atajos. ¿A dónde quieres ir?',
    options: [{ label: 'Ver Mapa', action: 'map' }],
    info: '🗺️ Viajero\n\nEl viajero conoce todos los caminos. Úsalo para moverte entre zonas del mapa. Cada zona tiene enemigos y jefes diferentes.',
  },
  Rattlebones: {
    greeting: '¡Hey Barnaby! Siento el ritmo en tus costillas. ¿Te unes al baile?',
    options: [],
    conditionalGreeting: [
      {
        check: (state: any) => state.completedQuests?.includes('rattle_5_baile'),
        text: '¡Barnaby! Cada vez que nos cruzamos, mis huesos vibran. ¿Listo para otro baile? Mis partes son tu recompensa... si puedes ganarlas.',
        extraOptions: [{ label: '💃 Desafiar', action: 'combat', combatTarget: '🕺 Rattlebones', combatIsBoss: true }],
      },
    ],
  },
  Sepulturero: {
    greeting: 'Ah, otro que camina sin aliento... Las catacumbas reclaman a todos. ¿Qué buscas entre los muertos?',
    options: [{ label: 'Ver Forja', action: 'forge' }],
    info: '⛏️ Sepulturero\n\nEl Sepulturero conoce cada tumba y cada hueso de estas catacumbas. Puede forjar piezas con la misma técnica que usa para reparar tumbas. También conoce la historia de la Reina Espectral.',
    conditionalGreeting: [
      {
        check: (state: any) => state.completedQuests?.includes('catacumbas_5_reina'),
        text: 'La Reina ha encontrado la paz... o al menos el silencio. Sus partes descansan contigo ahora. Cuida de ellas, Barnaby.',
        extraOptions: [{ label: '⚔️ Desafiar Reina', action: 'combat', combatTarget: '👑 Reina Espectral', combatIsBoss: true }],
      },
    ],
  },
};

/** Default fallback greeting for unknown NPCs */
const DEFAULT_GREETING = 'Hola, viajero. No solemos ver a muchos de tu... tipo por aquí.';

/**
 * useNPC — Extracts NPC interaction logic from BarnabyGame.tsx.
 * Handles: NPC dialog display, quest delivery, shop/forge/map shortcuts.
 * Uses a data-driven NPC_DIALOGS constant instead of hardcoded if/else.
 */
export function useNPC() {
  const setGameState = useGameStore(s => s.setGameState);
  const addToast = useGameStore(s => s.addToast);
  const setNpcDialog = useGameStore(s => s.setNpcDialog);
  const setActivePanel = useGameStore(s => s.setActivePanel);
  const setShowNpcInfo = useGameStore(s => s.setShowNpcInfo);

  /**
   * Talk to an NPC. Builds dialog with greeting + quest options.
   * Returns a structured dialog object for the UI to render.
   *
   * @param npcName - Name of the NPC to talk to
   * @param playSound - Sound callback from useAudio
   * @param callbacks - Object with side-effect callbacks the hook needs:
   *   - deliverQuest: (questId: string) => void
   *   - restAction: () => void
   *   - startCombat: (enemyName: string, isBoss: boolean) => void
   *   - checkLoreUnlocks: (trigger: string, value: string) => void
   */
  const talkToNpc = useCallback(
    (
      npcName: string,
      playSound: (type: string) => void,
      callbacks: {
        deliverQuest: (questId: string) => void;
        restAction: () => void;
        startCombat: (enemyName: string, isBoss: boolean) => void;
        checkLoreUnlocks: (trigger: string, value: string) => void;
      }
    ) => {
      const state = useGameStore.getState();
      let text = '';
      const rawOptions: any[] = [{ label: 'Adiós', action: () => setNpcDialog(null) }];
      const dialogDef = NPC_DIALOGS[npcName];

      if (dialogDef) {
        text = dialogDef.greeting;

        // Check conditional greetings
        if (dialogDef.conditionalGreeting) {
          for (const cond of dialogDef.conditionalGreeting) {
            if (cond.check(state)) {
              text = cond.text;
              // Add conditional extra options
              for (const opt of cond.extraOptions || []) {
                if (opt.action === 'combat' && opt.combatTarget) {
                  rawOptions.unshift({
                    label: opt.label,
                    action: () => {
                      setNpcDialog(null);
                      callbacks.startCombat(opt.combatTarget!, opt.combatIsBoss || false);
                    },
                  });
                } else if (opt.customAction) {
                  rawOptions.unshift({ label: opt.label, action: () => { opt.customAction!(); } });
                }
              }
              break;
            }
          }
        }

        // Add standard options from definition
        for (const opt of dialogDef.options) {
          switch (opt.action) {
            case 'shop':
              rawOptions.unshift({ label: opt.label, action: () => { setNpcDialog(null); setActivePanel('shop'); } });
              break;
            case 'forge':
              rawOptions.unshift({ label: opt.label, action: () => { setNpcDialog(null); setActivePanel('forge'); } });
              break;
            case 'map':
              rawOptions.unshift({ label: opt.label, action: () => { setNpcDialog(null); setActivePanel('map'); } });
              break;
            case 'rest':
              rawOptions.unshift({ label: opt.label, action: () => { setNpcDialog(null); callbacks.restAction(); } });
              break;
            case 'dismiss':
              rawOptions.unshift({ label: opt.label, action: () => setNpcDialog(null) });
              break;
          }
        }
      } else {
        text = DEFAULT_GREETING;
      }

      // Quest handling — check for active quests from this NPC
      const activeQuest = state.activeQuests.find((q: any) => q.giver === npcName);
      const availableQuest = QST.find(
        (q: any) =>
          q.giver === npcName &&
          !state.activeQuests.find((aq: any) => aq.id === q.id) &&
          !state.completedQuests.includes(q.id) &&
          (!q.reqQuest || state.completedQuests.includes(q.reqQuest))
      );

      if (activeQuest) {
        // Check if quest requirements are met
        let met = false;
        if ((activeQuest as any).boss) {
          if (state.defeatedBosses.includes((activeQuest as any).boss)) met = true;
        } else if (activeQuest.type === 'kill') {
          const progress = state.questProgress?.[activeQuest.id] || 0;
          if (progress >= (activeQuest as any).count) met = true;
        } else if (activeQuest.type === 'boss') {
          if (state.defeatedBosses.includes((activeQuest as any).target)) met = true;
        } else if (activeQuest.type === 'collect') {
          const progress = state.questProgress?.[activeQuest.id] || 0;
          if (progress >= (activeQuest as any).count) met = true;
        } else if (activeQuest.type === 'potion') {
          const progress = state.questProgress?.[activeQuest.id] || 0;
          if (progress >= (activeQuest as any).count) met = true;
        } else if (activeQuest.type === 'equip_set') {
          // Compute active sets inline
          const RARE_PLUS = ['raro', 'epico', 'legendario'];
          const counts: Record<string, number> = {};
          (Object.values(state.equipment) as any[]).forEach(eq => {
            if (eq && eq.id) {
              const item = getItemData(eq.id);
              if (item?.set && RARE_PLUS.includes(eq.rarity)) {
                counts[item.set] = (counts[item.set] || 0) + 1;
              }
            }
          });
          const anySetReady = Object.values(counts).some(c => c >= (activeQuest as any).count);
          if (anySetReady) met = true;
        } else if (activeQuest.type === 'talk') {
          met = true; // talk quests are completed by speaking to the NPC
        }

        if (met) {
          text += `\n\n[Misión: ${activeQuest.name}]\n¡Has cumplido lo que te pedí!`;
          rawOptions.unshift({
            label: `Entregar: ${activeQuest.name}`,
            action: () => {
              callbacks.deliverQuest(activeQuest.id);
              setNpcDialog(null);
            },
          });
        } else {
          text += `\n\n[Misión Activa: ${activeQuest.name}]\n¿Cómo va el progreso? Recuérdalo: ${(activeQuest as any).req}`;
        }
      } else if (availableQuest) {
        rawOptions.unshift({
          label: `Misión: ${availableQuest.name}`,
          action: () => {
            setGameState(prev => ({ ...prev, activeQuests: [...prev.activeQuests, availableQuest] }));
            addToast('Misión aceptada', 'info');
            setNpcDialog(null);
          },
        });
      }

      const info = dialogDef?.info;
      setNpcDialog({ name: npcName, text, options: rawOptions, info });
      setShowNpcInfo(false);
      playSound('click');

      // Unlock lore by NPC interaction
      callbacks.checkLoreUnlocks('npc', npcName);
    },
    [setGameState, addToast, setNpcDialog, setActivePanel, setShowNpcInfo]
  );

  /**
   * Dismiss the NPC dialog.
   */
  const dismissNpcDialog = useCallback(() => {
    setNpcDialog(null);
  }, [setNpcDialog]);

  return { talkToNpc, dismissNpcDialog, NPC_DIALOGS };
}
