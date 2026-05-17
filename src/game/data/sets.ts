import { SetData } from './types';

export const SETS: Record<string, SetData> = {
    "Goblin": {
        name: "Agilidad Goblin",
        bonus2: { stats: { speed: 3, crit: 2 }, desc: "+3 Vel, +2% Crit" },
        bonus4: { stats: { speed: 10, defense: 4, attack: 3, crit: 6 }, desc: "+10 Vel, +4 Def, +3 Atk, +6% Crit", effect: "Ráfaga" }
    },
    "Jabalí": {
        name: "Furia del Jabalí",
        bonus2: { stats: { defense: 5, attack: 2 }, desc: "+5 Def, +2 Atk" },
        bonus3: { stats: { defense: 12, attack: 6, speed: 3 }, desc: "+12 Def, +6 Atk, +3 Vel", effect: "Cornada" }
    },
    "Serpiente": {
        name: "Veneno de la Serpiente",
        bonus2: { stats: { crit: 8, speed: 4, attack: 3 }, desc: "+8% Crit, +4 Vel, +3 Atk", effect: "Naga" }
    },
    "Trasgo": {
        name: "Horda Trasgo",
        bonus2: { stats: { attack: 3, defense: 2 }, desc: "+3 Atk, +2 Def" },
        bonus4: { stats: { attack: 8, defense: 5, crit: 4 }, desc: "+8 Atk, +5 Def, +4% Crit", effect: "Furia" }
    },
    "Rey Trasgo": {
        name: "Corona del Rey Trasgo",
        bonus2: { stats: { attack: 6, defense: 5 }, desc: "+6 Atk, +5 Def" },
        bonus4: { stats: { attack: 18, defense: 12, crit: 8, speed: 4 }, desc: "+18 Atk, +12 Def, +8% Crit, +4 Vel", effect: "Dominación" }
    },
    "Rattlebones": {
        name: "Danza Eterna",
        bonus2: { stats: { speed: 5, crit: 4 }, desc: "+5 Vel, +4% Crit" },
        bonus4: { stats: { speed: 12, crit: 10, attack: 5 }, desc: "+12 Vel, +10% Crit, +5 Atk", effect: "Cadencia" }
    },
    "Esqueleto Guerrero": {
        name: "Guardia de Cripta",
        bonus2: { stats: { defense: 6, attack: 3 }, desc: "+6 Def, +3 Atk" },
        bonus4: { stats: { defense: 14, attack: 8, crit: 4 }, desc: "+14 Def, +8 Atk, +4% Crit", effect: "Legión" }
    },
    "Fantasma": {
        name: "Eco Espectral",
        bonus2: { stats: { attack: 5, speed: 4 }, desc: "+5 Atk, +4 Vel", effect: "Eco" }
    },
    "Momia": {
        name: "Ira Faraónica",
        bonus2: { stats: { defense: 7, attack: 3 }, desc: "+7 Def, +3 Atk" },
        bonus3: { stats: { defense: 16, attack: 8, magic: 4 }, desc: "+16 Def, +8 Atk, +4 Mag", effect: "Faraón" }
    },
    "Gusano Cripta": {
        name: "Fauces Subterráneas",
        bonus2: { stats: { attack: 5, defense: 3 }, desc: "+5 Atk, +3 Def" },
        bonus3: { stats: { attack: 12, defense: 6, speed: 3 }, desc: "+12 Atk, +6 Def, +3 Vel", effect: "Devorar" }
    },
    "Nigromante": {
        name: "Arte Prohibida",
        bonus2: { stats: { magic: 6, attack: 3 }, desc: "+6 Mag, +3 Atk" },
        bonus4: { stats: { magic: 14, attack: 8, defense: 4 }, desc: "+14 Mag, +8 Atk, +4 Def", effect: "Plaga" }
    },
    "Reina Espectral": {
        name: "Corona de la Muerte",
        bonus2: { stats: { attack: 8, defense: 6 }, desc: "+8 Atk, +6 Def" },
        bonus4: { stats: { attack: 22, defense: 16, magic: 8, speed: 6 }, desc: "+22 Atk, +16 Def, +8 Mag, +6 Vel", effect: "Dominación" }
    },
    "Buitre Carroñero": {
        name: "Carroña del Yermo",
        bonus2: { stats: { attack: 5, speed: 3 }, desc: "+5 Atk, +3 Vel" },
        bonus3: { stats: { attack: 10, speed: 6, crit: 4 }, desc: "+10 Atk, +6 Vel, +4% Crit", effect: "Carroña" }
    },
    "Hombre Escorpión": {
        name: "Veneno Escorpión",
        bonus2: { stats: { attack: 6, defense: 4 }, desc: "+6 Atk, +4 Def" },
        bonus4: { stats: { attack: 14, defense: 8, crit: 6 }, desc: "+14 Atk, +8 Def, +6% Crit", effect: "Veneno" }
    },
    "Nómada Sombrío": {
        name: "Sombra del Desierto",
        bonus2: { stats: { magic: 5, attack: 3 }, desc: "+5 Mag, +3 Atk" },
        bonus3: { stats: { magic: 10, attack: 6, speed: 4 }, desc: "+10 Mag, +6 Atk, +4 Vel", effect: "Sombra" }
    },
    "Golem de Arena": {
        name: "Fortaleza Árida",
        bonus2: { stats: { defense: 10, attack: 3 }, desc: "+10 Def, +3 Atk" },
        bonus3: { stats: { defense: 18, attack: 6 }, desc: "+18 Def, +6 Atk", effect: "Fortaleza" }
    },
    "Espectro del Desierto": {
        name: "Tormenta de Polvo",
        bonus2: { stats: { attack: 8, speed: 6 }, desc: "+8 Atk, +6 Vel", effect: "Tormenta" }
    },
    "Faraón Maldito": {
        name: "Divinidad Maldita",
        bonus2: { stats: { attack: 10, defense: 8 }, desc: "+10 Atk, +8 Def" },
        bonus4: { stats: { attack: 24, defense: 18, magic: 10, speed: 6 }, desc: "+24 Atk, +18 Def, +10 Mag, +6 Vel", effect: "Divinidad" }
    }
};
