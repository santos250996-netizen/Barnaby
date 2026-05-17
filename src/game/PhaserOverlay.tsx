'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// --- Zone effect configuration types ---
export type ZoneType = 'city' | 'forest' | 'combat' | 'dungeon' | 'default';

export interface PhaserOverlayProps {
  zone: ZoneType;
  /** Trigger a combat impact effect: slash, bleed, explosion, magic, shield, heal, freeze, debuff */
  combatVfx?: { type: string; target: 'player' | 'enemy' } | null;
  /** Trigger a zone transition flash */
  transitionFlash?: boolean;
  /** Trigger screen shake intensity (0-1) */
  shakeIntensity?: number;
  width?: number;
  height?: number;
}

// Phaser is client-only
let PhaserLib: any = null;

export default function PhaserOverlay({
  zone,
  combatVfx,
  transitionFlash,
  shakeIntensity,
  width,
  height,
}: PhaserOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const propsRef = useRef<PhaserOverlayProps>({ zone });
  propsRef.current = { zone, combatVfx, transitionFlash, shakeIntensity, width, height };

  // ---- Phaser Scene with zone-specific effects ----
  const createScene = useCallback(() => {
    if (!PhaserLib) return null;

    const scene = new PhaserLib.Scene('OverlayScene');

    scene.preload = function () {
      // Generate particle textures procedurally
      const gfx = this.make.graphics({ add: false });

      // Firefly / dust particle (soft glowing circle)
      gfx.fillStyle(0xffff88, 1);
      gfx.fillCircle(8, 8, 8);
      gfx.generateTexture('particle_firefly', 16, 16);
      gfx.clear();

      // Rain drop (thin elongated)
      gfx.fillStyle(0x88bbff, 0.6);
      gfx.fillRect(0, 0, 1, 10);
      gfx.generateTexture('particle_rain', 1, 10);
      gfx.clear();

      // Leaf
      gfx.fillStyle(0x44aa22, 0.8);
      gfx.fillEllipse(6, 3, 12, 6);
      gfx.generateTexture('particle_leaf', 12, 6);
      gfx.clear();

      // Autumn leaf
      gfx.fillStyle(0xcc8822, 0.8);
      gfx.fillEllipse(6, 3, 12, 6);
      gfx.generateTexture('particle_leaf_autumn', 12, 6);
      gfx.clear();

      // Fog cloud
      gfx.fillStyle(0xcccccc, 0.12);
      gfx.fillCircle(40, 40, 40);
      gfx.generateTexture('particle_fog', 80, 80);
      gfx.clear();

      // City spark / dust (warm golden)
      gfx.fillStyle(0xffd700, 0.7);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('particle_spark', 6, 6);
      gfx.clear();

      // City lantern glow (larger warm)
      gfx.fillStyle(0xffaa44, 0.5);
      gfx.fillCircle(10, 10, 10);
      gfx.generateTexture('particle_lantern', 20, 20);
      gfx.clear();

      // Combat: blood
      gfx.fillStyle(0xcc0000, 0.9);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture('particle_blood', 8, 8);
      gfx.clear();

      // Combat: magic blue
      gfx.fillStyle(0x4488ff, 0.8);
      gfx.fillCircle(5, 5, 5);
      gfx.generateTexture('particle_magic', 10, 10);
      gfx.clear();

      // Combat: shield
      gfx.fillStyle(0x44ffaa, 0.6);
      gfx.fillCircle(6, 6, 6);
      gfx.generateTexture('particle_shield', 12, 12);
      gfx.clear();

      // Combat: heal green
      gfx.fillStyle(0x44ff44, 0.7);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture('particle_heal', 8, 8);
      gfx.clear();

      // Combat: freeze ice
      gfx.fillStyle(0x88ddff, 0.7);
      gfx.fillCircle(5, 5, 5);
      gfx.generateTexture('particle_ice', 10, 10);
      gfx.clear();

      // Combat: explosion (orange-red)
      gfx.fillStyle(0xff6600, 0.9);
      gfx.fillCircle(6, 6, 6);
      gfx.generateTexture('particle_explosion', 12, 12);
      gfx.clear();

      // Combat: white flash
      gfx.fillStyle(0xffffff, 0.8);
      gfx.fillCircle(8, 8, 8);
      gfx.generateTexture('particle_flash', 16, 16);
      gfx.clear();

      // Dungeon: torch ember
      gfx.fillStyle(0xff8800, 0.8);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('particle_ember', 6, 6);
      gfx.clear();

      // Dungeon: dust mote (small grey)
      gfx.fillStyle(0x888888, 0.4);
      gfx.fillCircle(2, 2, 2);
      gfx.generateTexture('particle_dust', 4, 4);
      gfx.clear();

      // Snow flake
      gfx.fillStyle(0xffffff, 0.8);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture('particle_snow', 6, 6);
      gfx.clear();

      // Purple magic for debuff
      gfx.fillStyle(0x9944ff, 0.8);
      gfx.fillCircle(5, 5, 5);
      gfx.generateTexture('particle_debuff', 10, 10);
      gfx.clear();

      gfx.destroy();
    };

    scene.create = function () {
      const w = this.scale.width;
      const h = this.scale.height;
      sceneRef.current = this;

      // Zone emitters (created once, toggled by zone)
      this.zoneEmitters = {};

      // ============================================================
      // CITY: Floating golden sparks + warm lantern glow
      // ============================================================
      this.zoneEmitters.city = [];

      // Floating dust motes
      this.zoneEmitters.city.push(
        this.add.particles(0, 0, 'particle_spark', {
          x: { min: 0, max: w },
          y: { min: 0, max: h },
          lifespan: 5000,
          speedY: { min: -6, max: -2 },
          speedX: { min: -1.5, max: 1.5 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.6, end: 0 },
          frequency: 250,
          quantity: 1,
          blendMode: 'ADD',
        })
      );

      // Warm lantern glow (occasional)
      this.zoneEmitters.city.push(
        this.add.particles(0, 0, 'particle_lantern', {
          x: { min: 0, max: w },
          y: { min: h * 0.4, max: h },
          lifespan: 3000,
          speedY: { min: -3, max: -1 },
          speedX: { min: -0.5, max: 0.5 },
          scale: { start: 0.4, end: 0.1 },
          alpha: { start: 0.3, end: 0 },
          frequency: 800,
          quantity: 1,
          blendMode: 'ADD',
        })
      );

      // ============================================================
      // FOREST: Fireflies + rain + leaves + fog (layered atmosphere)
      // ============================================================
      this.zoneEmitters.forest = [];

      // Fireflies (scattered, slow pulsing glow)
      this.zoneEmitters.forest.push(
        this.add.particles(0, 0, 'particle_firefly', {
          x: { min: 0, max: w },
          y: { min: 0, max: h },
          lifespan: 6000,
          speedY: { min: -4, max: 4 },
          speedX: { min: -4, max: 4 },
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.9, end: 0 },
          frequency: 400,
          quantity: 1,
          blendMode: 'ADD',
        })
      );

      // Rain (continuous, angled)
      this.zoneEmitters.forest.push(
        this.add.particles(0, 0, 'particle_rain', {
          x: { min: -50, max: w + 50 },
          y: -10,
          lifespan: 1500,
          speedY: { min: 400, max: 600 },
          speedX: { min: -30, max: -15 },
          scale: { start: 0.8, end: 0.3 },
          alpha: { start: 0.25, end: 0 },
          frequency: 8,
          quantity: 2,
        })
      );

      // Falling leaves (mix of green and autumn)
      this.zoneEmitters.forest.push(
        this.add.particles(0, 0, 'particle_leaf', {
          x: { min: 0, max: w },
          y: -10,
          lifespan: 10000,
          speedY: { min: 12, max: 25 },
          speedX: { min: -8, max: 8 },
          rotate: { start: 0, end: 360 },
          scale: { start: 0.7, end: 0.2 },
          alpha: { start: 0.5, end: 0 },
          frequency: 1200,
          quantity: 1,
        })
      );

      // Autumn leaves (less frequent)
      this.zoneEmitters.forest.push(
        this.add.particles(0, 0, 'particle_leaf_autumn', {
          x: { min: 0, max: w },
          y: -10,
          lifespan: 10000,
          speedY: { min: 10, max: 20 },
          speedX: { min: -12, max: 5 },
          rotate: { start: 0, end: -360 },
          scale: { start: 0.6, end: 0.2 },
          alpha: { start: 0.4, end: 0 },
          frequency: 2500,
          quantity: 1,
        })
      );

      // Fog clouds drifting (low layer)
      this.zoneEmitters.forest.push(
        this.add.particles(0, 0, 'particle_fog', {
          x: { min: -200, max: w + 200 },
          y: { min: h * 0.5, max: h + 50 },
          lifespan: 15000,
          speedX: { min: 4, max: 12 },
          speedY: { min: -0.5, max: 0.5 },
          scale: { start: 1.5, end: 2.5 },
          alpha: { start: 0.08, end: 0 },
          frequency: 3000,
          quantity: 1,
        })
      );

      // ============================================================
      // COMBAT: Ambient embers + external VFX triggers
      // ============================================================
      this.zoneEmitters.combat = [];

      // Floating battle embers
      this.zoneEmitters.combat.push(
        this.add.particles(0, 0, 'particle_ember', {
          x: { min: 0, max: w },
          y: { min: 0, max: h },
          lifespan: 3000,
          speedY: { min: -8, max: -2 },
          speedX: { min: -2, max: 2 },
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.4, end: 0 },
          frequency: 200,
          quantity: 1,
          blendMode: 'ADD',
        })
      );

      // Subtle smoke wisps
      this.zoneEmitters.combat.push(
        this.add.particles(0, 0, 'particle_fog', {
          x: { min: 0, max: w },
          y: { min: h * 0.6, max: h },
          lifespan: 4000,
          speedY: { min: -5, max: -2 },
          speedX: { min: -1, max: 1 },
          scale: { start: 0.5, end: 1.2 },
          alpha: { start: 0.04, end: 0 },
          frequency: 1500,
          quantity: 1,
        })
      );

      // ============================================================
      // DUNGEON: Torch embers + dust motes + cold fog
      // ============================================================
      this.zoneEmitters.dungeon = [];

      // Torch embers (rising from bottom)
      this.zoneEmitters.dungeon.push(
        this.add.particles(0, 0, 'particle_ember', {
          x: { min: 0, max: w },
          y: h + 10,
          lifespan: 4000,
          speedY: { min: -18, max: -8 },
          speedX: { min: -3, max: 3 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.5, end: 0 },
          frequency: 120,
          quantity: 1,
          blendMode: 'ADD',
        })
      );

      // Dust motes (slow floating)
      this.zoneEmitters.dungeon.push(
        this.add.particles(0, 0, 'particle_dust', {
          x: { min: 0, max: w },
          y: { min: 0, max: h },
          lifespan: 8000,
          speedY: { min: -1, max: 1 },
          speedX: { min: -1, max: 1 },
          scale: { start: 0.8, end: 0.2 },
          alpha: { start: 0.25, end: 0 },
          frequency: 300,
          quantity: 1,
        })
      );

      // Cold floor fog
      this.zoneEmitters.dungeon.push(
        this.add.particles(0, 0, 'particle_fog', {
          x: { min: -200, max: w + 200 },
          y: { min: h * 0.7, max: h + 50 },
          lifespan: 12000,
          speedX: { min: -2, max: 2 },
          speedY: { min: -0.5, max: 0.5 },
          scale: { start: 1.8, end: 2.8 },
          alpha: { start: 0.05, end: 0 },
          frequency: 4000,
          quantity: 1,
        })
      );

      // ============================================================
      // DEFAULT: minimal
      // ============================================================
      this.zoneEmitters.default = [];

      // ---- Zone switching ----
      this.setZone = (newZone: string) => {
        const allZones = Object.keys(this.zoneEmitters);
        for (const z of allZones) {
          const emitters = this.zoneEmitters[z];
          for (const em of emitters) {
            if (em && em.setVisible) em.setVisible(z === newZone);
          }
        }
      };

      this.setZone(propsRef.current.zone);

      // ---- Transition flash overlay (black rectangle) ----
      this.flashOverlay = this.add.rectangle(w / 2, h / 2, w * 2, h * 2, 0x000000, 0).setDepth(100);

      // ---- Combat VFX tracking ----
      this._lastVfxId = null;
    };

    scene.update = function (_time: number, _delta: number) {
      // Check for flash trigger
      if (propsRef.current.transitionFlash && this.flashOverlay) {
        this.flashOverlay.setPosition(this.scale.width / 2, this.scale.height / 2);
        this.flashOverlay.setSize(this.scale.width * 2, this.scale.height * 2);
        this.tweens.add({
          targets: this.flashOverlay,
          alpha: { from: 1, to: 0 },
          duration: 500,
          ease: 'Power2',
        });
        propsRef.current.transitionFlash = false;
      }

      // Check for screen shake
      if (propsRef.current.shakeIntensity && propsRef.current.shakeIntensity > 0) {
        this.cameras.main.shake(200, propsRef.current.shakeIntensity * 0.01);
        propsRef.current.shakeIntensity = 0;
      }

      // Check for combat VFX (use id to deduplicate)
      const vfx = propsRef.current.combatVfx;
      if (vfx && (vfx as any).id !== this._lastVfxId) {
        this._lastVfxId = (vfx as any).id;
        this.triggerCombatVfx(vfx);
      }
    };

    scene.triggerCombatVfx = function (vfx: { type: string; target: string; id?: string }) {
      const w = this.scale.width;
      const h = this.scale.height;

      // Target position: enemy = center (main visual), player = bottom edge (just a health bar)
      const x = vfx.target === 'enemy' ? w * 0.5 : w * 0.5;
      const y = vfx.target === 'enemy' ? h * 0.38 : h * 0.92;

      switch (vfx.type) {
        case 'slash': {
          // Blood splash
          const emitter = this.add.particles(x, y, 'particle_blood', {
            speed: { min: 60, max: 180 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            lifespan: 700,
            gravityY: 250,
            quantity: 15,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(15);
          this.time.delayedCall(1000, () => emitter.destroy());
          break;
        }
        case 'bleed': {
          const emitter = this.add.particles(x, y, 'particle_blood', {
            speed: { min: 20, max: 70 },
            angle: { min: 200, max: 340 },
            scale: { start: 0.9, end: 0 },
            lifespan: 900,
            gravityY: 300,
            quantity: 10,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(10);
          this.time.delayedCall(1100, () => emitter.destroy());
          break;
        }
        case 'explosion': {
          // Fire ring
          const fireEmitter = this.add.particles(x, y, 'particle_explosion', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.8, end: 0 },
            lifespan: 900,
            gravityY: 80,
            quantity: 25,
            blendMode: 'ADD',
            emitting: false,
          });
          fireEmitter.explode(25);

          // White flash at center
          const flashEmitter = this.add.particles(x, y, 'particle_flash', {
            speed: { min: 10, max: 40 },
            scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            quantity: 3,
            blendMode: 'ADD',
            emitting: false,
          });
          flashEmitter.explode(3);

          this.time.delayedCall(1200, () => { fireEmitter.destroy(); flashEmitter.destroy(); });
          // Screen shake for explosions
          this.cameras.main.shake(400, 0.02);
          break;
        }
        case 'magic': {
          // Blue magic spiral
          const emitter = this.add.particles(x, y, 'particle_magic', {
            speed: { min: 40, max: 120 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1200,
            quantity: 18,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(18);

          // Secondary sparkle
          const sparkle = this.add.particles(x, y, 'particle_spark', {
            speed: { min: 20, max: 60 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 800,
            quantity: 8,
            blendMode: 'ADD',
            emitting: false,
          });
          sparkle.explode(8);

          this.time.delayedCall(1400, () => { emitter.destroy(); sparkle.destroy(); });
          break;
        }
        case 'shield': {
          // Shield particles forming a barrier
          const emitter = this.add.particles(x, y, 'particle_shield', {
            speed: { min: 15, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 14,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(14);
          this.time.delayedCall(1200, () => emitter.destroy());
          break;
        }
        case 'heal': {
          // Rising green particles
          const emitter = this.add.particles(x, y, 'particle_heal', {
            speed: { min: 20, max: 70 },
            angle: { min: 230, max: 310 },
            scale: { start: 1, end: 0 },
            lifespan: 1200,
            gravityY: -80,
            quantity: 12,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(12);

          // Golden sparkle
          const sparkle = this.add.particles(x, y, 'particle_spark', {
            speed: { min: 10, max: 30 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 900,
            quantity: 6,
            blendMode: 'ADD',
            emitting: false,
          });
          sparkle.explode(6);

          this.time.delayedCall(1400, () => { emitter.destroy(); sparkle.destroy(); });
          break;
        }
        case 'freeze': {
          // Ice shards burst
          const emitter = this.add.particles(x, y, 'particle_ice', {
            speed: { min: 50, max: 140 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            lifespan: 1000,
            quantity: 18,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(18);

          // Player freeze: persistent ice overlay with pulsing
          if (vfx.target === 'player') {
            // Blue screen tint that pulses for 2 seconds
            if (this.flashOverlay) {
              this.flashOverlay.setFillStyle(0x4488ff, 0.4);
              this.flashOverlay.setPosition(this.scale.width / 2, this.scale.height / 2);
              this.flashOverlay.setSize(this.scale.width * 2, this.scale.height * 2);
              this.tweens.add({
                targets: this.flashOverlay,
                alpha: { from: 0.4, to: 0.1 },
                duration: 500,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                  this.flashOverlay!.setFillStyle(0x000000, 0);
                }
              });
            }
            // Extra ice shards raining down on player
            const iceRain = this.add.particles(x, y - 50, 'particle_ice', {
              speed: { min: 30, max: 80 },
              angle: { min: 220, max: 320 },
              scale: { start: 0.8, end: 0 },
              lifespan: 1500,
              gravityY: 100,
              quantity: 10,
              blendMode: 'ADD',
              emitting: false,
            });
            iceRain.explode(10);
            this.time.delayedCall(1800, () => iceRain.destroy());
          } else {
            // Enemy freeze: blue flash overlay
            if (this.flashOverlay) {
              this.flashOverlay.setFillStyle(0x4488ff, 0.35);
              this.tweens.add({
                targets: this.flashOverlay,
                alpha: { from: 0.35, to: 0 },
                duration: 350,
              });
            }
          }

          this.time.delayedCall(1200, () => emitter.destroy());
          break;
        }
        case 'debuff': {
          // Purple poison cloud
          const emitter = this.add.particles(x, y, 'particle_debuff', {
            speed: { min: 15, max: 50 },
            angle: { min: 180, max: 360 },
            scale: { start: 0.8, end: 0 },
            lifespan: 1400,
            quantity: 12,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(12);
          this.time.delayedCall(1500, () => emitter.destroy());
          break;
        }
        case 'crit': {
          // Massive explosion + screen shake + white flash
          // Ring of fire
          const fireRing = this.add.particles(x, y, 'particle_explosion', {
            speed: { min: 150, max: 350 },
            angle: { min: 0, max: 360 },
            scale: { start: 2.0, end: 0 },
            lifespan: 800,
            gravityY: 60,
            quantity: 30,
            blendMode: 'ADD',
            emitting: false,
          });
          fireRing.explode(30);

          // Blood splash
          const critBlood = this.add.particles(x, y, 'particle_blood', {
            speed: { min: 80, max: 220 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            lifespan: 600,
            gravityY: 280,
            quantity: 20,
            blendMode: 'ADD',
            emitting: false,
          });
          critBlood.explode(20);

          // White flash
          const flashEmitter = this.add.particles(x, y, 'particle_flash', {
            speed: { min: 20, max: 60 },
            scale: { start: 3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 5,
            blendMode: 'ADD',
            emitting: false,
          });
          flashEmitter.explode(5);

          // Screen shake
          this.cameras.main.shake(500, 0.03);

          // White flash overlay
          if (this.flashOverlay) {
            this.flashOverlay.setFillStyle(0xffffff, 0.5);
            this.tweens.add({
              targets: this.flashOverlay,
              alpha: { from: 0.5, to: 0 },
              duration: 250,
            });
          }

          this.time.delayedCall(1500, () => { fireRing.destroy(); critBlood.destroy(); flashEmitter.destroy(); });
          break;
        }
        case 'poison': {
          // Purple-green bubbles rising from bottom
          const emitter = this.add.particles(x, y + 40, 'particle_debuff', {
            speed: { min: 10, max: 40 },
            angle: { min: 250, max: 290 },
            scale: { start: 0.6, end: 1.2 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1800,
            gravityY: -30,
            quantity: 14,
            blendMode: 'ADD',
            emitting: false,
          });
          emitter.explode(14);
          this.time.delayedCall(2000, () => emitter.destroy());
          break;
        }
        case 'fury': {
          // Orange flames pulsating around target
          const flame1 = this.add.particles(x - 30, y, 'particle_explosion', {
            speed: { min: 20, max: 60 },
            angle: { min: 240, max: 300 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1200,
            gravityY: -40,
            quantity: 8,
            blendMode: 'ADD',
            emitting: false,
          });
          flame1.explode(8);

          const flame2 = this.add.particles(x + 30, y, 'particle_explosion', {
            speed: { min: 20, max: 60 },
            angle: { min: 240, max: 300 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1400,
            gravityY: -40,
            quantity: 8,
            blendMode: 'ADD',
            emitting: false,
          });
          flame2.explode(8);

          // Central ember burst
          const ember = this.add.particles(x, y, 'particle_ember', {
            speed: { min: 30, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 1000,
            quantity: 12,
            blendMode: 'ADD',
            emitting: false,
          });
          ember.explode(12);

          this.time.delayedCall(1600, () => { flame1.destroy(); flame2.destroy(); ember.destroy(); });
          break;
        }
        case 'death': {
          // Crumbling: bone fragments falling
          const fragments = this.add.particles(x, y, 'particle_flash', {
            speed: { min: 40, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0.3 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 2000,
            gravityY: 200,
            quantity: 25,
            emitting: false,
          });
          fragments.explode(25);

          // Dust cloud
          const dust = this.add.particles(x, y, 'particle_fog', {
            speed: { min: 10, max: 30 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 2.0 },
            alpha: { start: 0.15, end: 0 },
            lifespan: 3000,
            quantity: 5,
            emitting: false,
          });
          dust.explode(5);

          // Red flash overlay
          if (this.flashOverlay) {
            this.flashOverlay.setFillStyle(0xcc0000, 0.3);
            this.tweens.add({
              targets: this.flashOverlay,
              alpha: { from: 0.3, to: 0 },
              duration: 600,
            });
          }

          this.cameras.main.shake(600, 0.02);
          this.time.delayedCall(3000, () => { fragments.destroy(); dust.destroy(); });
          break;
        }
      }
    };

    return scene;
  }, []);

  // Initialize Phaser game
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const initPhaser = async () => {
      try {
        PhaserLib = (await import('phaser')).default;
      } catch {
        console.warn('Phaser failed to load');
        return;
      }

      const container = containerRef.current!;
      const parentEl = container.parentElement;
      const w = width || parentEl?.offsetWidth || 680;
      const h = height || parentEl?.offsetHeight || 600;

      const scene = createScene();
      if (!scene) return;

      const config = {
        type: PhaserLib.CANVAS, // Use canvas for better transparency/overlay support
        width: w,
        height: h,
        parent: container,
        transparent: true,
        physics: {
          default: 'arcade',
          arcade: { gravity: { y: 0 } },
        },
        scene,
        scale: {
          mode: PhaserLib.Scale.RESIZE,
          autoCenter: PhaserLib.Scale.CENTER_BOTH,
        },
        input: {
          keyboard: false,
          mouse: false,
          touch: false,
        },
        audio: { noAudio: true },
        render: {
          pixelArt: false,
          antialias: true,
        },
        fps: {
          target: 30, // Lower FPS for overlay (saves battery)
          forceSetTimeOut: false,
        },
      };

      gameRef.current = new PhaserLib.Game(config);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update zone when it changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (scene && scene.setZone) {
      scene.setZone(zone);
    }
  }, [zone]);

  // Update combat VFX
  useEffect(() => {
    const scene = sceneRef.current;
    if (scene && combatVfx) {
      // _lastVfxId is checked in update() against combatVfx.id
    }
  }, [combatVfx]);

  // Update shake
  useEffect(() => {
    const scene = sceneRef.current;
    if (scene && shakeIntensity && shakeIntensity > 0) {
      scene.cameras?.main?.shake(200, shakeIntensity * 0.01);
    }
  }, [shakeIntensity]);

  // Update flash
  useEffect(() => {
    const scene = sceneRef.current;
    if (scene && transitionFlash && scene.flashOverlay) {
      scene.flashOverlay.setPosition(scene.scale.width / 2, scene.scale.height / 2);
      scene.flashOverlay.setSize(scene.scale.width * 2, scene.scale.height * 2);
      scene.tweens.add({
        targets: scene.flashOverlay,
        alpha: { from: 1, to: 0 },
        duration: 500,
        ease: 'Power2',
      });
    }
  }, [transitionFlash]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const game = gameRef.current;
      if (game && containerRef.current?.parentElement) {
        const w = width || containerRef.current.parentElement.offsetWidth;
        const h = height || containerRef.current.parentElement.offsetHeight;
        game.scale.resize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[3] overflow-hidden"
      style={{ imageRendering: 'auto' }}
    />
  );
}
