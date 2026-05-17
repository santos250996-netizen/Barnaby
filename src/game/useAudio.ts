import { useCallback, useRef, useMemo } from 'react';

export const useAudio = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playSound = useCallback((type: string) => {
    if (!audioCtxRef.current) return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      const t = audioCtxRef.current.currentTime;

      switch (type) {
        case 'hit':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(80, t + 0.1);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.1);
          break;
        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(150, t + 0.15);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);
          break;
        case 'magic':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.linearRampToValueAtTime(800, t + 0.3);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;
        case 'heal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, t);
          osc.frequency.linearRampToValueAtTime(700, t + 0.1);
          osc.frequency.linearRampToValueAtTime(900, t + 0.2);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        case 'shield':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(400, t + 0.2);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        case 'levelup':
          osc.type = 'square';
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.setValueAtTime(500, t + 0.1);
          osc.frequency.setValueAtTime(600, t + 0.2);
          osc.frequency.setValueAtTime(800, t + 0.3);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        case 'gameover':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(100, t + 0.5);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.6);
          osc.start(t);
          osc.stop(t + 0.6);
          break;
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, t);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
          break;

        // === NUEVOS SONIDOS RPG ===

        case 'crit': // Fractura resonante — impacto + eco cavernoso
          osc.type = 'square';
          osc.frequency.setValueAtTime(350, t);
          osc.frequency.linearRampToValueAtTime(60, t + 0.08);
          osc.frequency.linearRampToValueAtTime(40, t + 0.25);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.08);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;

        case 'dodge': // Roce de viento espectral
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.linearRampToValueAtTime(400, t + 0.12);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.12);
          osc.start(t);
          osc.stop(t + 0.12);
          break;

        case 'poison': // Siseo líquido burbujeante
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.setValueAtTime(150, t + 0.05);
          osc.frequency.setValueAtTime(80, t + 0.1);
          osc.frequency.setValueAtTime(160, t + 0.15);
          osc.frequency.setValueAtTime(90, t + 0.2);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;

        case 'bleed': // Goteo rítmico + susurro
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, t);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.03);
          // second drop
          osc.frequency.setValueAtTime(600, t + 0.1);
          gain.gain.setValueAtTime(0.12, t + 0.1);
          gain.gain.linearRampToValueAtTime(0, t + 0.13);
          // third drop
          osc.frequency.setValueAtTime(400, t + 0.22);
          gain.gain.setValueAtTime(0.08, t + 0.22);
          gain.gain.linearRampToValueAtTime(0, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.3);
          break;

        case 'debuff': // Cordón grave opresivo
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.linearRampToValueAtTime(60, t + 0.3);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
          break;

        case 'buff': // Campana cristalina
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.setValueAtTime(1000, t + 0.08);
          osc.frequency.setValueAtTime(1200, t + 0.16);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
          break;

        case 'walk': // Paso sobre tierra seca
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.linearRampToValueAtTime(60, t + 0.06);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.08);
          osc.start(t);
          osc.stop(t + 0.08);
          break;

        case 'coin': // Monedas cayendo (clink-clink)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.04);
          // second coin
          osc.frequency.setValueAtTime(1100, t + 0.07);
          gain.gain.setValueAtTime(0.1, t + 0.07);
          gain.gain.linearRampToValueAtTime(0, t + 0.11);
          // third coin
          osc.frequency.setValueAtTime(900, t + 0.14);
          gain.gain.setValueAtTime(0.07, t + 0.14);
          gain.gain.linearRampToValueAtTime(0, t + 0.18);
          osc.start(t);
          osc.stop(t + 0.2);
          break;

        // === SONIDOS RPG COMPLETOS ===

        case 'boss': // Aparición de boss — trueno + impacto épico
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, t);
          osc.frequency.linearRampToValueAtTime(40, t + 0.15);
          osc.frequency.setValueAtTime(200, t + 0.2);
          osc.frequency.linearRampToValueAtTime(50, t + 0.5);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.linearRampToValueAtTime(0.1, t + 0.15);
          gain.gain.setValueAtTime(0.25, t + 0.2);
          gain.gain.linearRampToValueAtTime(0, t + 0.6);
          osc.start(t);
          osc.stop(t + 0.6);
          break;

        case 'victory': // Victoria solemne — fanfarria corta
          osc.type = 'square';
          osc.frequency.setValueAtTime(523, t);
          osc.frequency.setValueAtTime(659, t + 0.1);
          osc.frequency.setValueAtTime(784, t + 0.2);
          osc.frequency.setValueAtTime(1047, t + 0.35);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.55);
          osc.start(t);
          osc.stop(t + 0.55);
          break;

        case 'forge': // Forjar/reparar — martillo sobre yunque
          osc.type = 'square';
          osc.frequency.setValueAtTime(900, t);
          osc.frequency.linearRampToValueAtTime(300, t + 0.03);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.06);
          // second strike
          osc.frequency.setValueAtTime(700, t + 0.12);
          osc.frequency.linearRampToValueAtTime(200, t + 0.15);
          gain.gain.setValueAtTime(0.15, t + 0.12);
          gain.gain.linearRampToValueAtTime(0, t + 0.18);
          // third strike
          osc.frequency.setValueAtTime(500, t + 0.25);
          osc.frequency.linearRampToValueAtTime(150, t + 0.28);
          gain.gain.setValueAtTime(0.1, t + 0.25);
          gain.gain.linearRampToValueAtTime(0, t + 0.32);
          osc.start(t);
          osc.stop(t + 0.35);
          break;

        case 'graft': // Injertar parte — crujido orgánico + click
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(250, t + 0.05);
          osc.frequency.setValueAtTime(120, t + 0.1);
          osc.frequency.linearRampToValueAtTime(350, t + 0.15);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
          break;

        case 'page': // Pergamino desplegándose
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(600, t + 0.06);
          osc.frequency.linearRampToValueAtTime(300, t + 0.12);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);
          break;

        case 'hover': // Roce óseo sutil
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.linearRampToValueAtTime(500, t + 0.03);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
          break;

        case 'vs': // VS slam — impacto épico al inicio combate
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.linearRampToValueAtTime(50, t + 0.1);
          osc.frequency.setValueAtTime(300, t + 0.12);
          osc.frequency.linearRampToValueAtTime(30, t + 0.35);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
          gain.gain.setValueAtTime(0.3, t + 0.12);
          gain.gain.linearRampToValueAtTime(0, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.4);
          break;

        case 'death': // Desmoronamiento de huesos
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.linearRampToValueAtTime(60, t + 0.3);
          // cascading clicks
          osc.frequency.setValueAtTime(200, t + 0.35);
          osc.frequency.setValueAtTime(100, t + 0.4);
          osc.frequency.setValueAtTime(50, t + 0.45);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.3);
          gain.gain.setValueAtTime(0.1, t + 0.35);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;

        case 'shop': // Comprar en tienda — caja registradora
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.03);
          osc.frequency.setValueAtTime(800, t + 0.05);
          gain.gain.setValueAtTime(0.08, t + 0.05);
          gain.gain.linearRampToValueAtTime(0, t + 0.08);
          osc.frequency.setValueAtTime(1600, t + 0.1);
          gain.gain.setValueAtTime(0.12, t + 0.1);
          gain.gain.linearRampToValueAtTime(0, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.18);
          break;

        case 'quest': // Completar misión — campana + fanfarria
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.setValueAtTime(1100, t + 0.08);
          osc.frequency.setValueAtTime(1320, t + 0.16);
          osc.frequency.setValueAtTime(1760, t + 0.24);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.4);
          break;

        case 'dungeon': // Entrar mazmorra — eco oscuro
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(80, t + 0.2);
          osc.frequency.setValueAtTime(120, t + 0.3);
          osc.frequency.linearRampToValueAtTime(40, t + 0.5);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.linearRampToValueAtTime(0.08, t + 0.2);
          gain.gain.linearRampToValueAtTime(0, t + 0.55);
          osc.start(t);
          osc.stop(t + 0.55);
          break;

        case 'rest': // Descansar en taberna — suspiro cálido
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(400, t + 0.15);
          osc.frequency.linearRampToValueAtTime(350, t + 0.4);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;

        case 'equip': // Equipar item — click + ajuste
          osc.type = 'square';
          osc.frequency.setValueAtTime(500, t);
          osc.frequency.setValueAtTime(700, t + 0.03);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.08);
          osc.start(t);
          osc.stop(t + 0.08);
          break;

        case 'potion': // Usar poción — líquido burbujeante
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(600, t + 0.1);
          osc.frequency.setValueAtTime(500, t + 0.15);
          osc.frequency.linearRampToValueAtTime(700, t + 0.25);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;

        case 'freeze': // Congelar — cristal rompiéndose
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(2000, t);
          osc.frequency.linearRampToValueAtTime(800, t + 0.05);
          osc.frequency.setValueAtTime(1500, t + 0.08);
          osc.frequency.linearRampToValueAtTime(400, t + 0.15);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
          break;

        case 'lifesteal': // Robo de vida — succión espectral
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(600, t + 0.15);
          osc.frequency.linearRampToValueAtTime(300, t + 0.3);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
          break;
      }
    } catch (e) {}
  }, []);

  return useMemo(() => ({ initAudio, playSound }), [initAudio, playSound]);
};

