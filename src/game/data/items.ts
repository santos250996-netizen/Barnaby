import { ItemData } from './types';
import { ENM } from './enemies';
import { LOC } from './locations';
import { SETS } from './sets';
// ARCHETYPE_SKILLS removed — all enemies have explicit parts

export const ARCHETYPE_STATS: Record<string, any> = {
  brute:  { head: {defense:10,attack:8,magicRes:4,speed:3,crit:3,magic:2}, torso: {defense:14,attack:6,magicRes:4,speed:2,crit:2,magic:2}, arm: {attack:14,defense:8,crit:4,speed:2,magicRes:1,magic:1}, leg: {defense:10,speed:8,attack:4,magicRes:4,crit:2,magic:2} },
  agile:  { head: {crit:10,speed:6,attack:5,defense:4,magic:3,magicRes:2}, torso: {speed:10,crit:6,defense:5,attack:4,magicRes:3,magic:2}, arm: {attack:10,crit:8,speed:5,defense:3,magic:2,magicRes:2}, leg: {speed:14,crit:8,defense:3,attack:2,magicRes:2,magic:1} },
  magic:  { head: {magic:10,magicRes:8,attack:4,defense:3,speed:3,crit:2}, torso: {magic:10,defense:8,magicRes:5,speed:3,attack:2,crit:2}, arm: {magic:12,attack:6,magicRes:5,crit:3,speed:2,defense:2}, leg: {magic:8,speed:8,magicRes:5,crit:4,defense:3,attack:2} },
  tank:   { head: {defense:14,magicRes:6,attack:4,speed:2,crit:2,magic:2}, torso: {defense:16,magicRes:4,attack:4,speed:2,crit:2,magic:2}, arm: {defense:14,attack:8,speed:4,crit:2,magicRes:1,magic:1}, leg: {defense:16,speed:6,magicRes:4,attack:2,crit:1,magic:1} },
  beast:  { head: {attack:10,defense:8,crit:4,speed:3,magicRes:3,magic:2}, torso: {defense:12,attack:6,magicRes:4,speed:3,crit:3,magic:2}, arm: {attack:12,crit:6,speed:4,defense:4,magic:2,magicRes:2}, leg: {speed:10,crit:8,defense:4,attack:4,magicRes:2,magic:2} },
};

export const EDB: Record<string, ItemData> = {
    // CABEZAS (Stats + Skill)
    "Cráneo de Trasgo": { slot: "head", stats: { defense: 10, magicRes: 10, attack: 3, crit: 4, magic: 2, speed: 1 }, emoji: "👺", desc: "Un cráneo angular y dentado. Aún conserva el olor a lodo y la malicia del bosque.", rarity: "comun", maxPutrefaccion: 20, skillIds: ["👺 Grito Bestial"], icon: "/game/parts/part-cabeza-trasgo-tontin.png" },
    "Cráneo de Goblin": { slot: "head", stats: { attack: 6, crit: 8, speed: 6, defense: 4, magic: 3, magicRes: 3 }, emoji: "👺", desc: "Un cráneo pequeño y puntiagudo. Su astucia natural permanece en las cuencas.", rarity: "comun", maxPutrefaccion: 20, set: "Goblin", skillIds: ["🔪 Puñalada Trampa"], icon: "/game/parts/part-cabeza-goblin.png" },
    "Cráneo de Jabalí": { slot: "head", stats: { defense: 10, attack: 8, magicRes: 5, magic: 2, crit: 3, speed: 2 }, emoji: "🐗", desc: "Un cráneo de jabalí con colmillos prominentes. Su ferocidad permanece en la mandíbula.", rarity: "raro", maxPutrefaccion: 20, set: "Jabalí", skillIds: ["🐗 Cornada Salvaje"], icon: "/game/parts/part-cabeza-jabali.png" },
    "Cráneo de Serpiente": { slot: "head", stats: { attack: 8, crit: 8, speed: 5, magic: 4, defense: 3, magicRes: 2 }, emoji: "🐍", desc: "Una cabeza de serpiente con capucha de cobra desplegada. Sus ojos amarillos aún hipnotizan.", rarity: "raro", maxPutrefaccion: 20, set: "Serpiente", skillIds: ["🐍 Mordisco Venenoso"], icon: "/game/parts/part-cabeza-serpiente.png" },
    "Cráneo de Lanzahuesos": { slot: "head", stats: { attack: 7, crit: 7, speed: 6, defense: 4, magic: 3, magicRes: 3 }, emoji: "🏹", desc: "Un cráneo cubierto de tatuajes tribales. Los ojos verdes esmeralda aún brillan con astucia.", rarity: "raro", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🏹 Vista Águila"], icon: "/game/parts/part-cabeza-trasgo-lanzahuesos.png" },
    "Cráneo de Rey Trasgo": { slot: "head", stats: { defense: 8, attack: 8, crit: 5, magicRes: 4, magic: 3, speed: 2 }, emoji: "👑", desc: "La corona dorada se fusionó con el cráneo. Sus ojos amarillos spectral imponen autoridad incluso en la muerte.", rarity: "legendario", maxPutrefaccion: 20, set: "Rey Trasgo", skillIds: ["👑 Mirada Dominante"], icon: "/game/parts/part-cabeza-rey-trasgo.png" },

    // TORSOS (Defensa + Skill)
    "Torso de Goblin": { slot: "torso", stats: { speed: 10, defense: 8, crit: 4, magicRes: 3, attack: 3, magic: 2 }, emoji: "👺", desc: "Una caja torácica frágil y apiñada. Ligera como una pluma, perfecta para escurrirse.", rarity: "comun", maxPutrefaccion: 20, set: "Goblin", skillIds: ["💨 Humo Sucio"], icon: "/game/parts/part-torso-goblin.png" },
    "Torso de Jabalí": { slot: "torso", stats: { defense: 14, attack: 6, magicRes: 4, speed: 2, magic: 2, crit: 2 }, emoji: "🐗", desc: "Un torso robusto y macizo. La coraza natural de una bestia que no conoce la rendición.", rarity: "raro", maxPutrefaccion: 20, set: "Jabalí", skillIds: ["🐗 Piel Brutal"], icon: "/game/parts/part-torso-jabali.png" },

    "Torso de Trasgo Tontin": { slot: "torso", stats: { defense: 10, attack: 6, magicRes: 5, speed: 4, magic: 3, crit: 2 }, emoji: "👺", desc: "Un torso rechoncho y cubierto de piel escamosa. Las hombreras con pinchos aún emanan agresividad.", rarity: "comun", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🐾 Zarpazo Trasgo"], icon: "/game/parts/part-torso-trasgo-tontin.png" },
    "Torso de Lanzahuesos": { slot: "torso", stats: { defense: 9, attack: 7, magicRes: 5, speed: 4, magic: 3, crit: 2 }, emoji: "🏹", desc: "Un torso cubierto de tatuajes tribales y una hombrera de bronce. El collar de cráneos aún susurra.", rarity: "raro", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🦴 Lanzamiento Hueso"], icon: "/game/parts/part-torso-trasgo-lanzahuesos.png" },
    "Torso de Rey Trasgo": { slot: "torso", stats: { defense: 12, attack: 5, crit: 3, magicRes: 4, speed: 3, magic: 3 }, emoji: "👑", desc: "La coraza del rey de los trasgos. Acero negro con filigrana dorada y una calavera central que irradiaba autoridad.", rarity: "legendario", maxPutrefaccion: 20, set: "Rey Trasgo", skillIds: ["👑 Aura Necrótica"], icon: "/game/parts/part-torso-rey-trasgo.png" },

    // BRAZOS (Ataque + Skill)
    "Brazos de Trasgo": { slot: "arms", stats: { attack: 12, crit: 5, speed: 4, defense: 4, magic: 3, magicRes: 2 }, emoji: "💪", desc: "Extremidades fibrosas e injertadas, perfectas para ataques rastreros con hacha.", rarity: "comun", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🐾 Golpe Hacha"], icon: "/game/parts/part-brazos-trasgo-tontin.png" },
    "Brazos de Goblin": { slot: "arms", stats: { attack: 10, crit: 8, speed: 5, defense: 3, magic: 2, magicRes: 2 }, emoji: "👺", desc: "Brazos pequeños pero diestros. Sus garras y daga saben dónde cortar.", rarity: "comun", maxPutrefaccion: 20, set: "Goblin", skillIds: ["🗡️ Golpe Bajo"], icon: "/game/parts/part-brazos-goblin.png" },
    "Brazos de Lanzahuesos": { slot: "arms", stats: { attack: 10, crit: 7, speed: 5, defense: 4, magic: 2, magicRes: 2 }, emoji: "🏹", desc: "Brazos tatuados con muñequeras de bronce. El bastón-espada emite un brillo espectral.", rarity: "raro", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🏹 Bastón Espectral"], icon: "/game/parts/part-brazos-trasgo-lanzahuesos.png" },
    "Brazos de Rey Trasgo": { slot: "arms", stats: { attack: 10, crit: 5, magic: 5, speed: 4, defense: 3, magicRes: 3 }, emoji: "👑", desc: "Brazos del rey con guanteletes de acero negro y oro. El cetro de hueso emite energía necrótica pura.", rarity: "legendario", maxPutrefaccion: 20, set: "Rey Trasgo", skillIds: ["👑 Cetro de Hueso"], icon: "/game/parts/part-brazos-rey-trasgo.png" },

    // PIERNAS (Velocidad + Pasivos)
    "Piernas de Goblin": { slot: "legs", stats: { speed: 14, crit: 8, defense: 3, magicRes: 2, attack: 2, magic: 1 }, emoji: "👺", desc: "Piernas cortas pero rápidas. Cada paso es una esquiva en potencia.", rarity: "comun", maxPutrefaccion: 20, set: "Goblin", passive: "evasión", skillIds: ["💨 Retirada Táctica"], icon: "/game/parts/part-piernas-goblin.png" },
    "Piernas de Jabalí": { slot: "legs", stats: { speed: 8, defense: 8, attack: 5, magicRes: 4, crit: 3, magic: 2 }, emoji: "🐗", desc: "Patas traseras de jabalí. Paso pesado y firme como un ariete.", rarity: "comun", maxPutrefaccion: 20, set: "Jabalí", skillIds: ["🐗 Paso Sísmico"], icon: "/game/parts/part-piernas-jabali.png" },
    "Piernas de Serpiente": { slot: "legs", stats: { speed: 12, crit: 8, attack: 4, magic: 2, defense: 2, magicRes: 2 }, emoji: "🐍", desc: "Cola de serpiente naga injertada como piernas. Se mueve con una gracia siniestra.", rarity: "raro", maxPutrefaccion: 20, set: "Serpiente", passive: "evasión", skillIds: ["🐍 Cola Constrictora"], icon: "/game/parts/part-piernas-serpiente.png" },
    "Piernas de Trasgo Tontin": { slot: "legs", stats: { speed: 10, defense: 6, crit: 5, attack: 4, magicRes: 3, magic: 2 }, emoji: "👺", desc: "Piernas cortas y robustas con garras. Pesan más que un ladrillo y pisan igual.", rarity: "comun", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🦶 Emboscada"], icon: "/game/parts/part-piernas-trasgo-tontin.png" },
    "Piernas de Lanzahuesos": { slot: "legs", stats: { speed: 12, crit: 8, defense: 3, attack: 3, magicRes: 2, magic: 2 }, emoji: "🏹", desc: "Piernas tatuadas con pantalones desgarrados. Las runas verdes brillan en la piel expuesta.", rarity: "raro", maxPutrefaccion: 20, set: "Trasgo", skillIds: ["🏹 Paso Rúnico"], icon: "/game/parts/part-piernas-trasgo-lanzahuesos.png" },
    "Piernas de Rey Trasgo": { slot: "legs", stats: { speed: 6, defense: 6, attack: 5, crit: 5, magicRes: 4, magic: 4 }, emoji: "👑", desc: "Grebas de acero negro con oro y espada al cinto con pomo de calavera.", rarity: "legendario", maxPutrefaccion: 20, set: "Rey Trasgo", skillIds: ["👑 Marcha Imperial"], icon: "/game/parts/part-piernas-rey-trasgo.png" },

    // 🕺 RATTLEBONES (4 piezas — epico)
    "Cráneo de Rattlebones": { slot: "head", stats: { crit: 10, speed: 8, attack: 4, magicRes: 3, defense: 3, magic: 2 }, emoji: "🕺", desc: "Un cráneo con sombrero de copia desgastado. Sus cuencas emiten un brillo rítmico cian.", rarity: "epico", maxPutrefaccion: 20, set: "Rattlebones", skillIds: ["💃 Pirueta Espectral"], icon: "/game/parts/part-cabeza-rattlebones.png" },
    "Torso de Rattlebones": { slot: "torso", stats: { speed: 10, defense: 8, crit: 5, attack: 3, magicRes: 2, magic: 2 }, emoji: "🕺", desc: "Una caja torácica con chaleco desgarrado. La médula brilla con energía de danza espectral.", rarity: "epico", maxPutrefaccion: 20, set: "Rattlebones", skillIds: ["🎵 Ritmo Hipnótico"], icon: "/game/parts/part-torso-rattlebones.png" },
    "Brazos de Rattlebones": { slot: "arms", stats: { attack: 10, crit: 8, speed: 5, defense: 3, magic: 2, magicRes: 2 }, emoji: "🕺", desc: "Brazos con guantes sin dedos y energía cian fluyendo de las manos. Percusión ósea letal.", rarity: "epico", maxPutrefaccion: 20, set: "Rattlebones", skillIds: ["🦴 Ráfaga Ósea"], icon: "/game/parts/part-brazos-rattlebones.png" },
    "Piernas de Rattlebones": { slot: "legs", stats: { speed: 12, crit: 8, attack: 3, defense: 3, magicRes: 2, magic: 2 }, emoji: "🕺", desc: "Piernas con pantalones desgarrados y estelas de afterimage cian. Cada paso es una danza.", rarity: "epico", maxPutrefaccion: 20, set: "Rattlebones", passive: "evasión", skillIds: ["🌀 Danza Fantasma"], icon: "/game/parts/part-piernas-rattlebones.png" },

    // ═══════════════════════════════════════════
    // 💀 CATACUMBAS — Esqueleto Guerrero (4 piezas)
    // ═══════════════════════════════════════════
    "Cráneo de Esqueleto Guerrero": { slot: "head", stats: { defense: 12, attack: 8, magicRes: 4, speed: 2, crit: 2, magic: 2 }, emoji: "⚔️", desc: "Un cráneo con yelmo oxidado soldado al hueso. Los ojos brillan con deber incumplido.", rarity: "raro", maxPutrefaccion: 30, set: "Esqueleto Guerrero", skillIds: ["⚔️ Tajo Óseo"], icon: "/game/parts/part-cabeza-esqueleto-guerrero.png" },
    "Torso de Esqueleto Guerrero": { slot: "torso", stats: { defense: 14, attack: 5, magicRes: 4, speed: 3, magic: 2, crit: 2 }, emoji: "⚔️", desc: "Cota de malla oxidada fusionada con la caja torácica. Ni la muerte la separó.", rarity: "raro", maxPutrefaccion: 30, set: "Esqueleto Guerrero", skillIds: ["🛡️ Guardia Ancestral"], icon: "/game/parts/part-torso-esqueleto-guerrero.png" },
    "Brazos de Esqueleto Guerrero": { slot: "arms", stats: { attack: 12, defense: 8, speed: 4, crit: 3, magic: 2, magicRes: 1 }, emoji: "⚔️", desc: "Brazos con guanteletes de hierro y empuñadura fantasmal. La espada es un recuerdo.", rarity: "raro", maxPutrefaccion: 30, set: "Esqueleto Guerrero", skillIds: ["💀 Grito de Batalla"], icon: "/game/parts/part-brazos-esqueleto-guerrero.png" },
    "Piernas de Esqueleto Guerrero": { slot: "legs", stats: { defense: 10, speed: 8, attack: 4, magicRes: 4, crit: 2, magic: 2 }, emoji: "⚔️", desc: "Grebas de acero marchito. El paso marcial persiste más allá de la tumba.", rarity: "raro", maxPutrefaccion: 30, set: "Esqueleto Guerrero", skillIds: ["⚔️ Estocada Mortal"], icon: "/game/parts/part-piernas-esqueleto-guerrero.png" },

    // 👻 FANTASMA (2 piezas)
    "Cráneo de Fantasma": { slot: "head", stats: { magic: 10, magicRes: 8, attack: 5, crit: 3, speed: 2, defense: 2 }, emoji: "👻", desc: "Un cráneo translúcido que emite un brillo verde pálido. Su grito aún resuena.", rarity: "raro", maxPutrefaccion: 30, set: "Fantasma", skillIds: ["👻 Aullido Espectral"], icon: "/game/parts/part-cabeza-fantasma.png" },
    "Piernas de Fantasma": { slot: "legs", stats: { speed: 12, crit: 8, magic: 4, magicRes: 3, defense: 2, attack: 1 }, emoji: "👻", desc: "Piernas etéreas que no tocan el suelo. Flotan entre este mundo y el siguiente.", rarity: "raro", maxPutrefaccion: 30, set: "Fantasma", passive: "evasión", skillIds: ["👻 Toque Gélido"], icon: "/game/parts/part-piernas-fantasma.png" },

    // 🧟 MOMIA (3 piezas)
    "Cráneo de Momia": { slot: "head", stats: { defense: 10, attack: 8, magic: 4, magicRes: 4, speed: 2, crit: 2 }, emoji: "🧟", desc: "Una cabeza envuelta en vendajes con ojos de ámbar ardiente. La ira de un faraón traicionado.", rarity: "raro", maxPutrefaccion: 35, set: "Momia", skillIds: ["🧟 Vendaje Estrangulador"], icon: "/game/parts/part-cabeza-momia.png" },
    "Torso de Momia": { slot: "torso", stats: { defense: 14, magic: 6, magicRes: 4, attack: 3, speed: 2, crit: 1 }, emoji: "🧟", desc: "Vendajes milenarios con marcas rituales. La energía de la tumba aún pulsa dentro.", rarity: "epico", maxPutrefaccion: 35, set: "Momia", skillIds: ["🧟 Ira Faraónica"], icon: "/game/parts/part-torso-momia.png" },
    "Piernas de Momia": { slot: "legs", stats: { defense: 14, speed: 6, magicRes: 4, attack: 3, magic: 2, crit: 1 }, emoji: "🧟", desc: "Piernas vendadas que avanzan con la lentitud implacable de lo eterno.", rarity: "raro", maxPutrefaccion: 35, set: "Momia", skillIds: ["🧟 Marcha Eterna"], icon: "/game/parts/part-piernas-momia.png" },

    // 🪱 GUSANO DE CRIPTA (3 piezas)
    "Cráneo de Gusano de Cripta": { slot: "head", stats: { attack: 12, defense: 8, crit: 4, magicRes: 3, speed: 2, magic: 1 }, emoji: "🪱", desc: "Segmento cefálico con mandíbulas circulares. La roca es alimento.", rarity: "raro", maxPutrefaccion: 30, set: "Gusano Cripta", skillIds: ["🪱 Mordisco Devorador"], icon: "/game/parts/part-cabeza-gusano-cripta.png" },
    "Torso de Gusano de Cripta": { slot: "torso", stats: { defense: 14, attack: 8, magicRes: 3, speed: 2, crit: 2, magic: 1 }, emoji: "🪱", desc: "Segmento muscular con anillos quitinosos. Cada contracción es un terremoto.", rarity: "raro", maxPutrefaccion: 30, set: "Gusano Cripta", skillIds: ["🪱 Terrermoto Subterráneo"], icon: "/game/parts/part-torso-gusano-cripta.png" },
    "Piernas de Gusano de Cripta": { slot: "legs", stats: { defense: 12, speed: 6, attack: 4, magicRes: 4, crit: 2, magic: 2 }, emoji: "🪱", desc: "Segmento caudal viscoso. La babaza protege mejor que cualquier armadura.", rarity: "comun", maxPutrefaccion: 30, set: "Gusano Cripta", skillIds: ["🪱 Caparazón Viscoso"], icon: "/game/parts/part-piernas-gusano-cripta.png" },

    // 🔮 NIGROMANTE (4 piezas)
    "Cráneo de Nigromante": { slot: "head", stats: { magic: 12, magicRes: 8, attack: 4, defense: 3, speed: 2, crit: 1 }, emoji: "🔮", desc: "Un cráneo con máscara de calavera ritual. Los ojos arden con conocimiento prohibido.", rarity: "epico", maxPutrefaccion: 35, set: "Nigromante", skillIds: ["🔮 Drenar Vida"], icon: "/game/parts/part-cabeza-nigromante.png" },
    "Torso de Nigromante": { slot: "torso", stats: { defense: 10, magic: 8, magicRes: 5, speed: 3, attack: 2, crit: 2 }, emoji: "🔮", desc: "Túnica púrpura con runas necróticas bordadas. Los muertos obedecen al que la viste.", rarity: "epico", maxPutrefaccion: 35, set: "Nigromante", skillIds: ["🔮 Maldición de Tumba"], icon: "/game/parts/part-torso-nigromante.png" },
    "Brazos de Nigromante": { slot: "arms", stats: { magic: 12, attack: 6, magicRes: 5, crit: 3, speed: 2, defense: 2 }, emoji: "🔮", desc: "Brazos con guanteletes rituales. El cristal del bastón pulsa con energía verde.", rarity: "epico", maxPutrefaccion: 35, set: "Nigromante", skillIds: ["🔮 Invocar Caído"], icon: "/game/parts/part-brazos-nigromante.png" },
    "Piernas de Nigromante": { slot: "legs", stats: { magic: 8, speed: 8, magicRes: 5, crit: 4, defense: 3, attack: 2 }, emoji: "🔮", desc: "Piernas envueltas en vendajes bajo la túnica. Flotan sobre el suelo de la cripta.", rarity: "raro", maxPutrefaccion: 35, set: "Nigromante", skillIds: ["🔮 Escudo Necrótico"], icon: "/game/parts/part-piernas-nigromante.png" },

    // 👑 REINA ESPECTRAL (4 piezas — legendario)
    "Cráneo de Reina Espectral": { slot: "head", stats: { defense: 8, attack: 7, magic: 7, magicRes: 4, crit: 2, speed: 2 }, emoji: "👑", desc: "La corona fantasmal se funde con el cráneo. Sus ojos de fuego azul imponen obediencia eterna.", rarity: "legendario", maxPutrefaccion: 50, set: "Reina Espectral", skillIds: ["👑 Lamento Real"], icon: "/game/parts/part-cabeza-reina-espectral.png" },
    "Torso de Reina Espectral": { slot: "torso", stats: { defense: 12, magic: 8, magicRes: 5, attack: 2, speed: 2, crit: 1 }, emoji: "👑", desc: "El vestido real hecho ectoplasma. Protege como acero y sana como néctar espectral.", rarity: "legendario", maxPutrefaccion: 50, set: "Reina Espectral", skillIds: ["👑 Corona de Sombras"], icon: "/game/parts/part-torso-reina-espectral.png" },
    "Brazos de Reina Espectral": { slot: "arms", stats: { attack: 12, magic: 8, crit: 5, speed: 2, defense: 2, magicRes: 1 }, emoji: "👑", desc: "Brazos etéreos con joyas espectrales. Un gesto basta para que los muertos obedezcan.", rarity: "legendario", maxPutrefaccion: 50, set: "Reina Espectral", skillIds: ["👑 Mandato Espectral"], icon: "/game/parts/part-brazos-reina-espectral.png" },
    "Piernas de Reina Espectral": { slot: "legs", stats: { speed: 8, defense: 6, attack: 4, magic: 4, magicRes: 4, crit: 4 }, emoji: "👑", desc: "La falda fantasmal arrastra estelas de energía real. Donde pisa, los huesos se inclinan.", rarity: "legendario", maxPutrefaccion: 50, set: "Reina Espectral", skillIds: ["👑 Corte Fantasmal"], icon: "/game/parts/part-piernas-reina-espectral.png" }

    // ═══════════════════════════════════════════
    // 🏜️ PÁRAMO — Buitre Carroñero (3 piezas)
    // ═══════════════════════════════════════════
    ,"Cráneo de Buitre Carroñero": { slot: "head", stats: { crit: 10, attack: 6, speed: 6, defense: 3, magic: 3, magicRes: 2 }, emoji: "🦅", desc: "Un cráneo de buitre con pico ganchudo y plumas podridas. Su mirada sigue moviéndose.", rarity: "raro", maxPutrefaccion: 30, set: "Buitre Carroñero", skillIds: ["🦅 Picotazo Fétido"], icon: "/game/parts/part-cabeza-buitre-carronero.png" }
    ,"Torso de Buitre Carroñero": { slot: "torso", stats: { speed: 10, defense: 8, crit: 4, attack: 3, magicRes: 3, magic: 2 }, emoji: "🦅", desc: "Un torso cubierto de plumas negras y huesos huecos. Ligero y letal.", rarity: "raro", maxPutrefaccion: 30, set: "Buitre Carroñero", skillIds: ["🦅 Aullido del Yermo"], icon: "/game/parts/part-torso-buitre-carronero.png" }
    ,"Piernas de Buitre Carroñero": { slot: "legs", stats: { speed: 14, crit: 8, attack: 3, defense: 2, magicRes: 2, magic: 1 }, emoji: "🦅", desc: "Garras de buitre con plumas afiladas como cuchillas. El viento es su aliado.", rarity: "raro", maxPutrefaccion: 30, set: "Buitre Carroñero", skillIds: ["🦅 Zarpazo de Plumas"], icon: "/game/parts/part-piernas-buitre-carronero.png" }

    // 🦂 HOMBRE ESCORPIÓN (4 piezas)
    ,"Cráneo de Hombre Escorpión": { slot: "head", stats: { defense: 10, attack: 10, magicRes: 4, speed: 2, crit: 2, magic: 2 }, emoji: "🦂", desc: "Un cráneo con mandíbulas de pinza y ojos compuestos ámbar. La furia del desierto cristalizada.", rarity: "raro", maxPutrefaccion: 30, set: "Hombre Escorpión", skillIds: ["🦂 Pinza Trituradora"], icon: "/game/parts/part-cabeza-hombre-escorpion.png" }
    ,"Torso de Hombre Escorpión": { slot: "torso", stats: { defense: 14, attack: 8, magicRes: 4, speed: 2, crit: 1, magic: 1 }, emoji: "🦂", desc: "Un torso con caparazón púrpura quitinoso. Las espinas dorsales aún gotean veneno.", rarity: "raro", maxPutrefaccion: 30, set: "Hombre Escorpión", skillIds: ["🦂 Cola Venenosa"], icon: "/game/parts/part-torso-hombre-escorpion.png" }
    ,"Brazos de Hombre Escorpión": { slot: "arms", stats: { attack: 14, defense: 8, crit: 4, speed: 2, magicRes: 1, magic: 1 }, emoji: "🦂", desc: "Brazos con pinzas naturales de quitina. Aplastan roca como si fuera papel.", rarity: "raro", maxPutrefaccion: 30, set: "Hombre Escorpión", skillIds: ["🦂 Caparazón Púrpura"], icon: "/game/parts/part-brazos-hombre-escorpion.png" }
    ,"Piernas de Hombre Escorpión": { slot: "legs", stats: { defense: 12, speed: 8, attack: 4, magicRes: 3, crit: 2, magic: 1 }, emoji: "🦂", desc: "Piernas articuladas de escorpión con aguijón en la base. Cada paso es una amenaza.", rarity: "raro", maxPutrefaccion: 30, set: "Hombre Escorpión", skillIds: ["🦂 Aguijonazo Letal"], icon: "/game/parts/part-piernas-hombre-escorpion.png" }

    // 🏜️ NÓMADA SOMBRÍO (3 piezas — epico)
    ,"Cráneo de Nómada Sombrío": { slot: "head", stats: { magic: 12, magicRes: 8, attack: 4, speed: 2, defense: 2, crit: 2 }, emoji: "🏜️", desc: "Una cabeza envuelta en vendajes de lino con ojos que arden como brasas del desierto.", rarity: "epico", maxPutrefaccion: 35, set: "Nómada Sombrío", skillIds: ["🏜️ Daga del Yermo"], icon: "/game/parts/part-cabeza-nomada-sombrio.png" }
    ,"Torso de Nómada Sombrío": { slot: "torso", stats: { magic: 10, defense: 8, magicRes: 5, speed: 3, attack: 2, crit: 2 }, emoji: "🏜️", desc: "Túnica raída de nómada con runas de arena bordadas. El desierto responde a quien la viste.", rarity: "epico", maxPutrefaccion: 35, set: "Nómada Sombrío", skillIds: ["🏜️ Maldición de Arena"], icon: "/game/parts/part-torso-nomada-sombrio.png" }
    ,"Brazos de Nómada Sombrío": { slot: "arms", stats: { magic: 12, attack: 8, magicRes: 4, crit: 3, speed: 2, defense: 1 }, emoji: "🏜️", desc: "Brazos con brazaletes de cobre y dagas curvas. La magia de la arena fluye por las manos.", rarity: "epico", maxPutrefaccion: 35, set: "Nómada Sombrío", skillIds: ["🏜️ Paso Fantasma"], icon: "/game/parts/part-brazos-nomada-sombrio.png" }

    // 🏺 GOLEM DE ARENA (3 piezas)
    ,"Cráneo de Golem de Arena": { slot: "head", stats: { defense: 14, attack: 6, magicRes: 4, speed: 2, crit: 2, magic: 2 }, emoji: "🏺", desc: "Un cráneo de roca erosionada por siglos de tormentas. Los ojos son cuevas de oscuridad.", rarity: "raro", maxPutrefaccion: 30, set: "Golem de Arena", skillIds: ["🏺 Puño de Roca"], icon: "/game/parts/part-cabeza-golem-arena.png" }
    ,"Torso de Golem de Arena": { slot: "torso", stats: { defense: 16, attack: 4, magicRes: 4, speed: 3, crit: 2, magic: 1 }, emoji: "🏺", desc: "Un torso masivo de arenisca compactada. El peso de mil años de desierto comprimido.", rarity: "raro", maxPutrefaccion: 30, set: "Golem de Arena", skillIds: ["🏪 Muro de Arena"], icon: "/game/parts/part-torso-golem-arena.png" }
    ,"Piernas de Golem de Arena": { slot: "legs", stats: { defense: 16, speed: 6, magicRes: 4, attack: 2, crit: 1, magic: 1 }, emoji: "🏺", desc: "Piernas de roca que se hunden en la arena con cada paso. Inamovibles como las dunas.", rarity: "raro", maxPutrefaccion: 30, set: "Golem de Arena", skillIds: ["🏺 Terremoto Árido"], icon: "/game/parts/part-piernas-golem-arena.png" }

    // 💨 ESPECTRO DEL DESIERTO (2 piezas)
    ,"Cráneo de Espectro del Desierto": { slot: "head", stats: { magic: 10, magicRes: 6, attack: 6, crit: 4, speed: 2, defense: 2 }, emoji: "💨", desc: "Un cráneo etéreo de arena y polvo. Su aullido congela el alma de los vivientes.", rarity: "raro", maxPutrefaccion: 30, set: "Espectro del Desierto", skillIds: ["💨 Aullido del Yermo"], icon: "/game/parts/part-cabeza-espectro-desierto.png" }
    ,"Piernas de Espectro del Desierto": { slot: "legs", stats: { speed: 12, crit: 8, magic: 4, magicRes: 3, defense: 2, attack: 1 }, emoji: "💨", desc: "Piernas espectrales que se desvanecen en remolinos de arena. Imposibles de atrapar.", rarity: "raro", maxPutrefaccion: 30, set: "Espectro del Desierto", passive: "evasión", skillIds: ["💨 Tormenta de Polvo"], icon: "/game/parts/part-piernas-espectro-desierto.png" }

    // 👑 FARAÓN MALDITO (4 piezas — legendario)
    ,"Cráneo de Faraón Maldito": { slot: "head", stats: { defense: 8, attack: 8, magic: 6, magicRes: 4, crit: 2, speed: 2 }, emoji: "👑", desc: "La corona dorada se fusionó con el cráneo del faraón. Sus ojos arden con el fuego de mil maldiciones.", rarity: "legendario", maxPutrefaccion: 50, set: "Faraón Maldito", skillIds: ["👑 Decreto Faraónico"], icon: "/game/parts/part-cabeza-faraon-maldito.png" }
    ,"Torso de Faraón Maldito": { slot: "torso", stats: { defense: 14, magic: 8, magicRes: 4, attack: 2, speed: 1, crit: 1 }, emoji: "👑", desc: "El pectoral real de oro y lapislázuli emana poder ancestral. Los dioses lo protegieron en vida, y lo maldijeron en muerte.", rarity: "legendario", maxPutrefaccion: 50, set: "Faraón Maldito", skillIds: ["👑 Ira del Nilo"], icon: "/game/parts/part-torso-faraon-maldito.png" }
    ,"Brazos de Faraón Maldito": { slot: "arms", stats: { attack: 15, crit: 8, magic: 3, speed: 2, defense: 1, magicRes: 1 }, emoji: "👑", desc: "Brazos con brazaletes de oro y el cetro ancestral. Un gesto basta para que los muertos obedezcan.", rarity: "legendario", maxPutrefaccion: 50, set: "Faraón Maldito", skillIds: ["👑 Marcha de los Muertos"], icon: "/game/parts/part-brazos-faraon-maldito.png" }
    ,"Piernas de Faraón Maldito": { slot: "legs", stats: { speed: 10, defense: 8, attack: 6, magicRes: 3, crit: 2, magic: 1 }, emoji: "👑", desc: "Grebas de oro macizo con jeroglíficos de poder. Donde el faraón pisa, la arena se convierte en trono.", rarity: "legendario", maxPutrefaccion: 50, set: "Faraón Maldito", skillIds: ["👑 Cetro Ancestral"], icon: "/game/parts/part-piernas-faraon-maldito.png" }
};

export function parseGeneratedItem(itemName: string): { enemyName: string; slot: string } | null {
  if (typeof itemName !== 'string') return null;
  const headMatch = itemName.match(/^Cráneo de (.+)$/);
  if (headMatch) return { enemyName: headMatch[1], slot: 'head' };
  const torsoMatch = itemName.match(/^Torso de (.+)$/);
  if (torsoMatch) return { enemyName: torsoMatch[1], slot: 'torso' };
  const armMatch = itemName.match(/^Brazos de (.+)$/);
  if (armMatch) return { enemyName: armMatch[1], slot: 'arms' };
  const legMatch = itemName.match(/^Piernas de (.+)$/);
  if (legMatch) return { enemyName: legMatch[1], slot: 'legs' };
  return null;
}

// getZoneLevelByEnemyName removed — no longer used

function getEnemyData(name: string): any {
  if (ENM[name]) return ENM[name];
  // Bosses are now in ENM too, so this fallback is rarely needed
  for (const loc of Object.values(LOC) as any[]) {
    if (loc.boss === name) {
      return { archetype: 'brute', emoji: '👑', isBoss: true };
    }
  }
  return null;
}

function getEnemySetKey(name: string): string | null {
  if (SETS[name]) return name;
  for (const key of Object.keys(SETS)) {
    if (name.includes(key)) return key;
  }
  return null;
}

export function generatePartData(itemName: string): any {
  const parsed = parseGeneratedItem(itemName);
  if (!parsed) return null;
  const enemyData = getEnemyData(parsed.enemyName);
  if (!enemyData) return null;

  // If enemy has explicit parts defined, reject any part not in that list
  // (e.g. Serpiente only has head + legs, no torso or arms)
  const eDef = ENM[parsed.enemyName];
  if (eDef?.parts) {
    const validPartNames = eDef.parts.map((p: any) => p.name);
    if (!validPartNames.includes(itemName)) return null;
  }

  const arch = ARCHETYPE_STATS[enemyData.archetype];
  if (!arch) return null;
  const slotKey = parsed.slot === 'arms' ? 'arms' : parsed.slot === 'legs' ? 'legs' : parsed.slot;
  const slotStats = arch[slotKey] || {};
  const scaledStats: Record<string, number> = {};
  const rarities = ['comun','raro','epico','legendario'];
  // Rarity based on whether enemy is boss, not zone
  let rarityIdx = enemyData.isBoss ? 3 : 0; // bosses = legendario base, regular = comun base

  // Tier multiplier: 1.0 for common, 1.5 for boss
  const tierMult = enemyData.isBoss ? 1.5 : 1.0;

  // Scale stats by tier multiplier only (no zone level)
  Object.entries(slotStats).forEach(([stat, val]) => {
    scaledStats[stat] = Math.floor((val as number) * tierMult);
  });

  // No generic skills — all enemies have explicit parts with their own skills

  // Assign set if the enemy has a matching set key
  const setKey = getEnemySetKey(parsed.enemyName);

  const result: any = {
    slot: parsed.slot,
    stats: scaledStats,
    emoji: enemyData.emoji,
    desc: `Parte de ${parsed.enemyName} obtenida en combate.`,
    rarity: rarities[rarityIdx],
    maxPutrefaccion: 20,
    skillIds: undefined // Skills come from explicit EDB entries only
  };
  if (setKey) result.set = setKey;

  // Assign icon based on enemy name and slot
  const iconSlotMap: Record<string, string> = { head: 'cabeza', torso: 'torso', arms: 'brazos', legs: 'piernas' };
  const iconSlot = iconSlotMap[parsed.slot];
  if (iconSlot) {
    const enemyKey = parsed.enemyName.toLowerCase()
      .replace(/\s+de\s+/g, ' ')   // strip Spanish preposition "de" before dashifying
      .replace(/\s+del\s+/g, ' ')  // strip Spanish preposition "del"
      .replace(/\s+la\s+/g, ' ')   // strip Spanish article "la"
      .replace(/\s+el\s+/g, ' ')   // strip Spanish article "el"
      .replace(/\s+/g, '-')
      .replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n');
    result.icon = `/game/parts/part-${iconSlot}-${enemyKey}.png`;
  }

  return result;
}

export function getItemData(itemName: string): any {
  if (EDB[itemName]) return EDB[itemName];
  return generatePartData(itemName);
}
