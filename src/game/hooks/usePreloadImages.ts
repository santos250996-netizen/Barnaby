'use client';

import { useEffect, useRef, useCallback } from 'react';
import { LOC, ENM, TDB, getItemData } from '@/game/data';

// ─────────────────────────────────────────────────
// Image preloading cache — avoids duplicate loads
// ─────────────────────────────────────────────────
const preloadedUrls = new Set<string>();

function preloadUrl(url: string, priority: 'high' | 'low' = 'low') {
  if (!url || preloadedUrls.has(url)) return;
  preloadedUrls.add(url);

  const link = document.createElement('link');
  link.rel = priority === 'high' ? 'preload' : 'prefetch';
  link.as = 'image';
  link.href = url;
  // Don't block the main thread for low-priority prefetches
  if (priority === 'low') {
    link.fetchPriority = 'low';
  }
  document.head.appendChild(link);
}

// ─────────────────────────────────────────────────
// Enemy image map (matches EnemyCard.tsx)
// ─────────────────────────────────────────────────
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
};

// ─────────────────────────────────────────────────
// Zone adjacency map — which zone to prefetch next
// ─────────────────────────────────────────────────
const ZONE_ADJACENCY: Record<string, string[]> = {
  '🏙️ Ciudad': ['🌲 Bosque'],
  '🌲 Bosque': ['🏙️ Ciudad'],
  // Future zones — add adjacency as they get content
  'Catacumbas': ['🏙️ Ciudad', '🌲 Bosque'],
  'Paramo': ['Catacumbas', 'Cienaga'],
  'Cienaga': ['Paramo', 'Volcan'],
  'Volcan': ['Cienaga', 'Trono'],
  'Trono': ['Volcan'],
};

// ─────────────────────────────────────────────────
// Collect all images needed for a specific location
// ─────────────────────────────────────────────────
function getLocationImages(locationKey: string): string[] {
  const locData = LOC[locationKey];
  if (!locData) return [];

  const images: string[] = [];

  // Background
  if (locData.bgImage) images.push(locData.bgImage);

  // Map icon
  if (locData.mapIcon) images.push(locData.mapIcon);

  // NPC icons
  if (locData.npcIcons) {
    Object.values(locData.npcIcons).forEach(icon => {
      if (icon) images.push(icon);
    });
  }

  // Interact icons (explorar, jefe, mazmorra, viajar)
  if (locData.interactIcons) {
    Object.values(locData.interactIcons).forEach(icon => {
      if (icon) images.push(icon);
    });
  }

  // Enemy images for this zone
  if (locData.enemies) {
    locData.enemies.forEach((ename: string) => {
      const enemyImg = ENEMY_IMAGES[ename];
      if (enemyImg) images.push(enemyImg);

      // Also preload enemy part icons (loot)
      const eDef = ENM[ename];
      if (eDef?.parts) {
        eDef.parts.forEach((part: any) => {
          const partData = getItemData(part.name);
          if (partData?.icon) images.push(partData.icon);
        });
      }

      // And enemy skill icons (intent pattern)
      if (eDef?.intentPattern) {
        eDef.intentPattern.forEach((skillId: string) => {
          const tech = (TDB as any)[skillId];
          if (tech?.icon) images.push(tech.icon);
        });
      }

      // Master skill
      if (eDef?.masterSkill) {
        const tech = (TDB as any)[eDef.masterSkill];
        if (tech?.icon) images.push(tech.icon);
      }
    });
  }

  // Boss image
  if (locData.boss) {
    const bossImg = ENEMY_IMAGES[locData.boss];
    if (bossImg) images.push(bossImg);

    const bossDef = ENM[locData.boss];
    if (bossDef?.intentPattern) {
      bossDef.intentPattern.forEach((skillId: string) => {
        const tech = (TDB as any)[skillId];
        if (tech?.icon) images.push(tech.icon);
      });
    }
    if (bossDef?.masterSkill) {
      const tech = (TDB as any)[bossDef.masterSkill];
      if (tech?.icon) images.push(tech.icon);
    }
    // Boss part icons (loot)
    if (bossDef?.parts) {
      bossDef.parts.forEach((part: any) => {
        const partData = getItemData(part.name);
        if (partData?.icon) images.push(partData.icon);
      });
    }
  }

  return images;
}

// ─────────────────────────────────────────────────
// Collect player skill icons currently equipped
// ─────────────────────────────────────────────────
function getPlayerSkillImages(equipment: Record<string, any>): string[] {
  const images: string[] = [];
  // Innate skills
  const innateSkills = [
    '💀 Cabezazo Barnaby', '🛡️ Costillas Enrejadas',
    '🦾 Puño Óseo', '👻 Voluntad Post-Mortel',
  ];
  innateSkills.forEach(id => {
    const tech = (TDB as any)[id];
    if (tech?.icon) images.push(tech.icon);
  });

  // Equipped item skills
  Object.values(equipment).forEach((slot: any) => {
    if (!slot?.id) return;
    const itemData = getItemData(slot.id);
    if (itemData?.icon) images.push(itemData.icon);
    if (itemData?.skillIds) {
      itemData.skillIds.forEach((skillId: string) => {
        const tech = (TDB as any)[skillId];
        if (tech?.icon) images.push(tech.icon);
      });
    }
  });

  return images;
}

// ─────────────────────────────────────────────────
// HOOK 1: usePreloadContext
// Preloads all images needed for the current game context
// ─────────────────────────────────────────────────
export function usePreloadContext(
  currentLocation: string,
  isCombat: boolean,
  equipment: Record<string, any>,
) {
  // Preload current location images when location changes
  useEffect(() => {
    const images = getLocationImages(currentLocation);
    images.forEach(url => preloadUrl(url, 'high'));
  }, [currentLocation]);

  // Preload player skill icons on mount
  useEffect(() => {
    const images = getPlayerSkillImages(equipment);
    images.forEach(url => preloadUrl(url, 'high'));
  }, []); // Only once on mount — skills change rarely

  // When entering combat, ensure enemy + skill images are hot
  useEffect(() => {
    if (!isCombat) return;
    const images = getPlayerSkillImages(equipment);
    images.forEach(url => preloadUrl(url, 'high'));
  }, [isCombat]);
}

// ─────────────────────────────────────────────────
// HOOK 2: usePrefetchAdjacent
// Prefetches images for adjacent zones in the background
// ─────────────────────────────────────────────────
export function usePrefetchAdjacent(currentLocation: string) {
  const prevLocationRef = useRef<string>('');

  useEffect(() => {
    // Only run when location actually changes
    if (currentLocation === prevLocationRef.current) return;
    prevLocationRef.current = currentLocation;

    const adjacent = ZONE_ADJACENCY[currentLocation];
    if (!adjacent) return;

    // Delay prefetch to not compete with current zone loading
    const timer = setTimeout(() => {
      adjacent.forEach(zoneKey => {
        const images = getLocationImages(zoneKey);
        images.forEach(url => preloadUrl(url, 'low'));
      });
    }, 2000); // 2s after entering a zone, start prefetching adjacent

    return () => clearTimeout(timer);
  }, [currentLocation]);
}

// ─────────────────────────────────────────────────
// Utility: Preload a specific enemy's images (for combat transitions)
// ─────────────────────────────────────────────────
export function preloadEnemyImages(enemyName: string) {
  const enemyImg = ENEMY_IMAGES[enemyName];
  if (enemyImg) preloadUrl(enemyImg, 'high');

  const eDef = ENM[enemyName];
  if (eDef?.intentPattern) {
    eDef.intentPattern.forEach((skillId: string) => {
      const tech = (TDB as any)[skillId];
      if (tech?.icon) preloadUrl(tech.icon, 'high');
    });
  }
  if (eDef?.masterSkill) {
    const tech = (TDB as any)[eDef.masterSkill];
    if (tech?.icon) preloadUrl(tech.icon, 'high');
  }
}
