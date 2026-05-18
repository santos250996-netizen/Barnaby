import { SetData } from './types';

export const SETS: Record<string, SetData> = {
    "Goblin": {
        name: "Agilidad Goblin",
        bonus2: { stats: { speed: 5, crit: 5, defense: 1, magic: 1 }, desc: "+5 Vel, +5% Crit, +1 Def, +1 Mag" },
        bonus4: { stats: { speed: 12, crit: 10, attack: 8, defense: 6, magicRes: 5, magic: 4 }, desc: "+12 Vel, +10% Crit, +8 Atk, +6 Def, +5 Mag Res, +4 Mag", effect: "Ráfaga" }
    },
    "Jabalí": {
        name: "Furia del Jabalí",
        bonus2: { stats: { defense: 6, attack: 4, magicRes: 2 }, desc: "+6 Def, +4 Atk, +2 Mag Res" },
        bonus3: { stats: { defense: 12, attack: 6, speed: 3, magicRes: 2, crit: 1 }, desc: "+12 Def, +6 Atk, +3 Vel, +2 Mag Res, +1% Crit", effect: "Cornada" }
    },
    "Serpiente": {
        name: "Veneno de la Serpiente",
        bonus2: { stats: { crit: 7, speed: 4, attack: 2 }, desc: "+7% Crit, +4 Vel, +2 Atk", effect: "Naga" }
    },
    "Trasgo": {
        name: "Horda Trasgo",
        bonus2: { stats: { attack: 5, defense: 4, speed: 2, crit: 1 }, desc: "+5 Atk, +4 Def, +2 Vel, +1% Crit" },
        bonus4: { stats: { attack: 12, defense: 8, crit: 8, speed: 6, magicRes: 6, magic: 5 }, desc: "+12 Atk, +8 Def, +8% Crit, +6 Vel, +6 Mag Res, +5 Mag", effect: "Furia" }
    },
    "Rey Trasgo": {
        name: "Corona del Rey Trasgo",
        bonus2: { stats: { attack: 5, defense: 4, magic: 2, magicRes: 2, crit: 1 }, desc: "+5 Atk, +4 Def, +2 Mag, +2 Mag Res, +1% Crit" },
        bonus4: { stats: { attack: 14, defense: 10, crit: 8, speed: 6, magic: 6, magicRes: 6 }, desc: "+14 Atk, +10 Def, +8% Crit, +6 Vel, +6 Mag, +6 Mag Res", effect: "Dominación" }
    },
    "Rattlebones": {
        name: "Danza Eterna",
        bonus2: { stats: { speed: 6, crit: 5, attack: 1 }, desc: "+6 Vel, +5% Crit, +1 Atk" },
        bonus4: { stats: { speed: 14, crit: 12, attack: 6, defense: 5, magicRes: 4, magic: 4 }, desc: "+14 Vel, +12% Crit, +6 Atk, +5 Def, +4 Mag Res, +4 Mag", effect: "Cadencia" }
    },
    "Esqueleto Guerrero": {
        name: "Guardia de Cripta",
        bonus2: { stats: { defense: 7, attack: 3, magicRes: 2 }, desc: "+7 Def, +3 Atk, +2 Mag Res" },
        bonus4: { stats: { defense: 14, attack: 10, crit: 6, speed: 5, magicRes: 5, magic: 5 }, desc: "+14 Def, +10 Atk, +6% Crit, +5 Vel, +5 Mag Res, +5 Mag", effect: "Legión" }
    },
    "Fantasma": {
        name: "Eco Espectral",
        bonus2: { stats: { attack: 4, speed: 5, magic: 2, magicRes: 2 }, desc: "+4 Atk, +5 Vel, +2 Mag, +2 Mag Res", effect: "Eco" }
    },
    "Momia": {
        name: "Ira Faraónica",
        bonus2: { stats: { defense: 7, attack: 2, magicRes: 2, crit: 1 }, desc: "+7 Def, +2 Atk, +2 Mag Res, +1% Crit" },
        bonus3: { stats: { defense: 12, attack: 6, magic: 3, magicRes: 2, crit: 1 }, desc: "+12 Def, +6 Atk, +3 Mag, +2 Mag Res, +1% Crit", effect: "Faraón" }
    },
    "Gusano Cripta": {
        name: "Fauces Subterráneas",
        bonus2: { stats: { attack: 6, defense: 4, speed: 2 }, desc: "+6 Atk, +4 Def, +2 Vel" },
        bonus3: { stats: { attack: 12, defense: 6, speed: 3, crit: 2, magic: 1 }, desc: "+12 Atk, +6 Def, +3 Vel, +2% Crit, +1 Mag", effect: "Devorar" }
    },
    "Nigromante": {
        name: "Arte Prohibida",
        bonus2: { stats: { magic: 6, attack: 3, magicRes: 3, crit: 1 }, desc: "+6 Mag, +3 Atk, +3 Mag Res, +1% Crit" },
        bonus4: { stats: { magic: 14, attack: 8, defense: 5, magicRes: 6, speed: 6, crit: 6 }, desc: "+14 Mag, +8 Atk, +5 Def, +6 Mag Res, +6 Vel, +6% Crit", effect: "Plaga" }
    },
    "Reina Espectral": {
        name: "Corona de la Muerte",
        bonus2: { stats: { attack: 4, defense: 3, magic: 3, magicRes: 2, speed: 1, crit: 1 }, desc: "+4 Atk, +3 Def, +3 Mag, +2 Mag Res, +1 Vel, +1% Crit" },
        bonus4: { stats: { attack: 12, defense: 8, magic: 10, magicRes: 8, speed: 7, crit: 7 }, desc: "+12 Atk, +8 Def, +10 Mag, +8 Mag Res, +7 Vel, +7% Crit", effect: "Dominación" }
    },
    "Buitre Carroñero": {
        name: "Carroña del Yermo",
        bonus2: { stats: { attack: 5, speed: 4, crit: 2, magic: 1 }, desc: "+5 Atk, +4 Vel, +2% Crit, +1 Mag" },
        bonus3: { stats: { attack: 10, speed: 6, crit: 5, defense: 2, magic: 1 }, desc: "+10 Atk, +6 Vel, +5% Crit, +2 Def, +1 Mag", effect: "Carroña" }
    },
    "Hombre Escorpión": {
        name: "Veneno Escorpión",
        bonus2: { stats: { attack: 6, defense: 4, crit: 2 }, desc: "+6 Atk, +4 Def, +2% Crit" },
        bonus4: { stats: { attack: 14, defense: 8, crit: 8, speed: 6, magicRes: 5, magic: 4 }, desc: "+14 Atk, +8 Def, +8% Crit, +6 Vel, +5 Mag Res, +4 Mag", effect: "Veneno" }
    },
    "Nómada Sombrío": {
        name: "Sombra del Desierto",
        bonus2: { stats: { magic: 6, attack: 2, magicRes: 3, speed: 2 }, desc: "+6 Mag, +2 Atk, +3 Mag Res, +2 Vel" },
        bonus3: { stats: { magic: 10, attack: 6, speed: 4, magicRes: 2, crit: 2 }, desc: "+10 Mag, +6 Atk, +4 Vel, +2 Mag Res, +2% Crit", effect: "Sombra" }
    },
    "Golem de Arena": {
        name: "Fortaleza Árida",
        bonus2: { stats: { defense: 10, attack: 3 }, desc: "+10 Def, +3 Atk" },
        bonus3: { stats: { defense: 16, attack: 5, magicRes: 2, crit: 1 }, desc: "+16 Def, +5 Atk, +2 Mag Res, +1% Crit", effect: "Fortaleza" }
    },
    "Espectro del Desierto": {
        name: "Tormenta de Polvo",
        bonus2: { stats: { attack: 4, speed: 6, magic: 2, magicRes: 2 }, desc: "+4 Atk, +6 Vel, +2 Mag, +2 Mag Res", effect: "Tormenta" }
    },
    "Faraón Maldito": {
        name: "Divinidad Maldita",
        bonus2: { stats: { attack: 5, defense: 5, magic: 2, magicRes: 2, crit: 1 }, desc: "+5 Atk, +5 Def, +2 Mag, +2 Mag Res, +1% Crit" },
        bonus4: { stats: { attack: 14, defense: 10, magic: 10, magicRes: 8, speed: 7, crit: 6 }, desc: "+14 Atk, +10 Def, +10 Mag, +8 Mag Res, +7 Vel, +6% Crit", effect: "Divinidad" }
    }
};
