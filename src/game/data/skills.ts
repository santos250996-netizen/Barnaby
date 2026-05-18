import { Technique } from './types';

export const TDB: Record<string, Technique> = {
    // ═══════════════════════════════════════════
    // INNATAS (Barnaby Inicial)
    // ═══════════════════════════════════════════
    "💀 Cabezazo Barnaby":     { cost:2,  damage:14, heal:0,  emoji:"💀", name:"Cabezazo",    damageRange:"14-18",   type:"basic", desc:"Tu cráneo retumba contra el enemigo. No hay magia, solo impacto puro.", icon:"/game/skills/skill-cabezazo-barnaby.png" },
    "🛡️ Costillas Enrejadas": { cost:2,  damage:0,  heal:0,  emoji:"🛡️", name:"Enrejadas",  damageRange:"-40% Daño",type:"defense", desc:"Entrelazas tus costillas como una reja. Cada hueco absorbe la fuerza del golpe.", shield:0.4, icon:"/game/skills/skill-costillas-enrejadas.png" },
    "🦾 Puño Óseo":            { cost:3,  damage:18, heal:0,  emoji:"🦾", name:"Puño Óseo",  damageRange:"18-22",   type:"basic", desc:"Un solo puño, pero con toda la furia de quien ya no siente dolor.", icon:"/game/skills/skill-puno-oseo.png" },
    "👻 Voluntad Post-Mortem":{ cost:3,  damage:0,  heal:5,  emoji:"👻", name:"Voluntad",   damageRange:"Buf+Cura",type:"magic", desc:"No deberías estar vivo. No lo estás. Pero te mueves igual, y eso asusta hasta a los muertos.", fury:true, icon:"/game/skills/skill-voluntad-post-mortem.png" },

    // ═══════════════════════════════════════════
    // 🐍 SERPIENTE (2 habilidades)
    // ═══════════════════════════════════════════
    "🐍 Mordisco Venenoso":    { cost:4,  damage:20, heal:0,  emoji:"🐍", name:"Mordisco",   damageRange:"20-24",   type:"bleed", desc:"Un mordisco que inyecta un veneno paralizante en la sangre del objetivo.", bleed:3, icon:"/game/skills/skill-mordisco-venenoso.png" },
    "🐍 Cola Constrictora":    { cost:3,  damage:16, heal:0,  emoji:"🐍", name:"Constrictora",damageRange:"16-20",   type:"basic", desc:"Enrollas tu cola naga alrededor del enemigo, aplastando y ralentizando sus movimientos.", debuff:0.7, icon:"/game/skills/skill-cola-constrictora.png" },

    // ═══════════════════════════════════════════
    // 🐗 JABALÍ (3 habilidades)
    // ═══════════════════════════════════════════
    "🐗 Cornada Salvaje":      { cost:3,  damage:18, heal:0,  emoji:"🐗", name:"Cornada",     damageRange:"18-22",   type:"basic", desc:"El jabalí embiste con sus colmillos, buscando desgarrar carne y fracturar huesos.", armorPen:0.3, icon:"/game/skills/skill-cornada-salvaje.png" },
    "🐗 Piel Brutal":          { cost:2,  damage:0,  heal:0,  emoji:"🐗", name:"Piel Brutal", damageRange:"-40% Daño",type:"defense", desc:"Endureces tu torso como el cuero de un jabalí. Los golpes rebotan sin efecto.", shield:0.4, icon:"/game/skills/skill-piel-brutal.png" },
    "🐗 Paso Sísmico":         { cost:3,  damage:14, heal:0,  emoji:"🐗", name:"Paso Sísmico",damageRange:"14-18",   type:"basic", desc:"Golpeas el suelo con la fuerza de un jabalí. El temblor desestabiliza al enemigo.", freeze:true, icon:"/game/skills/skill-paso-sismico.png" },

    // ═══════════════════════════════════════════
    // 👺 GOBLIN (4 habilidades)
    // ═══════════════════════════════════════════
    "🔪 Puñalada Trampa":     { cost:2,  damage:10, heal:0,  emoji:"🔪", name:"Puñalada",    damageRange:"10-14",   type:"basic", desc:"Un tajo rápido y sucio por debajo de la guardia. Los goblins no luchan limpio.", armorPen:0.3, icon:"/game/skills/skill-punalada-trampa.png" },
    "💨 Humo Sucio":          { cost:3,  damage:0,  heal:0,  emoji:"💨", name:"Humo",       damageRange:"Evasión", type:"magic", desc:"Escupe una nube de polvo y mierda. Desaparece un instante, difícil de apuntar.", fury:true, icon:"/game/skills/skill-humo-sucio.png" },
    "🗡️ Golpe Bajo":          { cost:3,  damage:12, heal:0,  emoji:"🗡️", name:"Golpe Bajo", damageRange:"12-16",   type:"basic", desc:"Un golpe sucio que desestabiliza las defensas del enemigo, dejándolo vulnerable.", debuff:0.7, icon:"/game/skills/skill-golpe-bajo.png" },
    "💨 Retirada Táctica":    { cost:2,  damage:0,  heal:4,  emoji:"💨", name:"Retirada",   damageRange:"Escudo+Cura",type:"defense", desc:"Retrocedes con agilidad goblin, ganando posición defensiva mientras recuperas fuerzas.", shield:0.3, icon:"/game/skills/skill-retirada-tactica.png" },

    // ═══════════════════════════════════════════
    // 👺 TRASGO TONTÍN (4 habilidades)
    // ═══════════════════════════════════════════
    "🐾 Zarpazo Trasgo":       { cost:4,  damage:24, heal:0,  emoji:"🐾", name:"Zarpazo",     damageRange:"24-30",   type:"bleed", desc:"Un corte rápido y rastrero, típico de los que han aprendido a luchar por sobras en el lodo.", icon:"/game/skills/skill-zarpazo-trasgo.png" },
    "👺 Grito Bestial":        { cost:3,  damage:0,  heal:0,  emoji:"👺", name:"Grito",       damageRange:"Buf Furia",type:"magic", desc:"Un alarido primitivo que despierta el instinto depredador en tus huesos.", fury:true, icon:"/game/skills/skill-grito-bestial.png" },
    "🐾 Golpe Hacha":          { cost:4,  damage:26, heal:0,  emoji:"🐾", name:"Hacha",       damageRange:"26-32",   type:"basic", desc:"Un hachazo brutal y directo. Sin florituras, solo fuerza salvaje.", armorPen:0.2, icon:"/game/skills/skill-golpe-hacha.png" },
    "🦶 Emboscada":            { cost:2,  damage:0,  heal:0,  emoji:"🦶", name:"Emboscada",   damageRange:"Evasión+Buf",type:"defense", desc:"Te escondes en las sombras y reapareces con ventaja, esquivo y letal.", shield:0.3, fury:true, icon:"/game/skills/skill-emboscada.png" },

    // ═══════════════════════════════════════════
    // 🏹 TRASGO LANZAHUESOS (4 habilidades)
    // ═══════════════════════════════════════════
    "🦴 Lanzamiento Hueso":    { cost:6,  damage:35, heal:0,  emoji:"🦴", name:"Lanzamiento", damageRange:"35-45",   type:"magic", desc:"Desprendes un fémur prescindible y lo lanzas con una trayectoria balística perfecta.", icon:"/game/skills/skill-lanzamiento-hueso.png" },
    "🏹 Vista Águila":         { cost:2,  damage:0,  heal:0,  emoji:"🏹", name:"Vista Águila",damageRange:"Buf Crítico",type:"magic", desc:"Tus ojos tatuados brillan con precisión sobrenatural, encontrando cada punto débil.", fury:true, icon:"/game/skills/skill-vista-aguila.png" },
    "🏹 Bastón Espectral":     { cost:4,  damage:20, heal:0,  emoji:"🏹", name:"Bastón",      damageRange:"20-24",   type:"magic", desc:"Canalizas energía espectral a través del bastón, debilitando al enemigo con cada impacto.", debuff:0.7, icon:"/game/skills/skill-baston-espectral.png" },
    "🏹 Paso Rúnico":          { cost:2,  damage:0,  heal:0,  emoji:"🏹", name:"Paso Rúnico", damageRange:"Evasión", type:"defense", desc:"Las runas de tus piernas brillan y te desplazas como un fantasma entre ataques.", shield:0.3, icon:"/game/skills/skill-paso-runico.png" },

    // ═══════════════════════════════════════════
    // 👑 REY TRASGO (4 habilidades)
    // ═══════════════════════════════════════════
    "👑 Mirada Dominante":     { cost:4,  damage:18, heal:0,  emoji:"👑", name:"Mirada",      damageRange:"18-22 + Stun",type:"magic", desc:"Tus ojos espectrales paralizan al enemigo. La corona impone incluso en la muerte.", freeze:true, icon:"/game/skills/skill-mirada-dominante.png" },
    "👑 Aura Necrótica":       { cost:3,  damage:0,  heal:3,  emoji:"👑", name:"Aura",        damageRange:"Escudo+Reflejo",type:"defense", desc:"Una aura de energía necrótica emana de tu coraza, protegiéndote y dañando quien te toque.", shield:0.4, icon:"/game/skills/skill-aura-necrotica.png" },
    "👑 Cetro de Hueso":       { cost:5,  damage:28, heal:0,  emoji:"👑", name:"Cetro",       damageRange:"28-34",   type:"basic", desc:"El cetro real canaliza poder necrótico puro. Cada golpe drena la vida del enemigo.", lifesteal:0.15, icon:"/game/skills/skill-cetro-de-hueso.png" },
    "👑 Marcha Imperial":      { cost:2,  damage:0,  heal:0,  emoji:"👑", name:"Marcha",      damageRange:"Evasión+Buf",type:"defense", desc:"Avanzas con la autoridad de un rey. Los enemigos retroceden mientras tus fuerzas crecen.", shield:0.3, fury:true, icon:"/game/skills/skill-marcha-imperial.png" },

    // ═══════════════════════════════════════════
    // 🕺 RATTLEBONES (4 habilidades)
    // ═══════════════════════════════════════════
    "💃 Pirueta Espectral":    { cost:3,  damage:16, heal:0,  emoji:"💃", name:"Pirueta",     damageRange:"16-20+Evasión",type:"basic", desc:"Giras con gracia espectral, golpeando al pasar. El viento de tu danza desvía los contraataques.", shield:0.25, icon:"/game/skills/skill-pirueta-espectral.png" },
    "🎵 Ritmo Hipnótico":      { cost:2,  damage:0,  heal:4,  emoji:"🎵", name:"Ritmo",       damageRange:"Curación+Debuff",type:"defense", desc:"Tus huesos chocan con una cadencia hipnótica que confunde al enemigo y restaura tu estructura.", shield:0.2, debuff:0.7, icon:"/game/skills/skill-ritmo-hipnotico.png" },
    "🦴 Ráfaga Ósea":          { cost:4,  damage:10, heal:0,  emoji:"🦴", name:"Ráfaga",      damageRange:"10x3",    type:"basic", desc:"Lanzas fragmentos de hueso en tres ráfagas rápidas. La percusión de tus huesos es tu arma.", multi:3, icon:"/game/skills/skill-rafaga-osea.png" },
    "🌀 Danza Fantasma":       { cost:2,  damage:0,  heal:0,  emoji:"🌀", name:"Danza",       damageRange:"Evasión+Buf",type:"defense", desc:"Te desvaneces en una danza espectral. Los ataques te atraviesan mientras acumulas poder.", shield:0.35, fury:true, icon:"/game/skills/skill-danza-fantasma.png" },

    // ═══════════════════════════════════════════
    // 🌟 HABILIDADES MAESTRAS (1 por enemigo)
    // ═══════════════════════════════════════════
    "🌟 Sangre Tóxica":        { cost:0,  damage:8,  heal:0,  emoji:"🐍", name:"Sangre Tóxica",damageRange:"8+Veneno",type:"bleed", desc:"La serpiente segrega toxinas concentradas. El veneno corre por tus articulaciones, disolviendo los fragmentos.", bleed:5, icon:"/game/skills/skill-sangre-toxica.png" },
    "🌟 Furia Bestial":        { cost:0,  damage:0,  heal:0,  emoji:"🐗", name:"Furia Bestial",damageRange:"Buf x2",  type:"magic", desc:"El jabalí entra en un frenesí incontrolable. Sus músculos se hinchan y su próximo ataque será devastador.", fury:true, icon:"/game/skills/skill-furia-bestial.png" },
    "🌟 Horda Trasga":         { cost:0,  damage:12, heal:0,  emoji:"👺", name:"Horda Trasga", damageRange:"12x2",   type:"basic", desc:"El trasgo chilla y un pequeño aliado se une al ataque. Dos goldes por el precio de uno.", multi:2, icon:"/game/skills/skill-horda-trasga.png" },
    "🌟 Lluvia de Huesos":     { cost:0,  damage:10, heal:0,  emoji:"🏹", name:"Lluvia Huesos",damageRange:"10x3",   type:"magic", desc:"El lanzahuesos desentierra un depósito de proyectiles óseos y los lanza en ráfaga. Una tormenta de fragmentos.", multi:3, icon:"/game/skills/skill-lluvia-de-huesos.png" },
    "🌟 Trampa Sucia":         { cost:0,  damage:8,  heal:0,  emoji:"👺", name:"Trampa Sucia", damageRange:"8+Robo",  type:"steal", desc:"El goblin coloca una trampa oculta. Te pisa los dedos y roba fragmentos mientras te desangras.", steal:5, debuff:0.7, icon:"/game/skills/skill-trampa-sucia.png" },
    "🌟 Decreto Real":         { cost:0,  damage:30, heal:0,  emoji:"👑", name:"Decreto Real", damageRange:"30+Stun", type:"ultimate", desc:"El Rey Trasgo pronuncia una sentencia inapelable. El suelo tiembla, el aire se congela, y el castigo cae.", freeze:true, icon:"/game/skills/skill-decreto-real.png" },
    "🌟 Cadencia Mortal":      { cost:0,  damage:18, heal:0,  emoji:"🕺", name:"Cadencia",     damageRange:"18x2+Stun",type:"ultimate", desc:"Rattlebones ejecuta su baile final. Cada paso es un golpe, cada giro una sentencia. La danza de la muerte.", multi:2, freeze:true, icon:"/game/skills/skill-cadencia-mortal.png" },

    // ═══════════════════════════════════════════
    // 💀 ESQUELETO GUERRERO — Catacumbas (4 habilidades)
    // ═══════════════════════════════════════════
    "⚔️ Tajo Óseo":           { cost:3,  damage:20, heal:0,  emoji:"⚔️", name:"Tajo Óseo",    damageRange:"20-26",   type:"basic", desc:"Un corte lateral con la espada oxidada. El filo mordió piedra durante siglos y ahora muerde carne.", armorPen:0.2, icon:"/game/skills/skill-tajo-oseo.png" },
    "🛡️ Guardia Ancestral":   { cost:2,  damage:0,  heal:0,  emoji:"🛡️", name:"Guardia",      damageRange:"-40% Daño",type:"defense", desc:"Levanta el escudo agrietado con la determinación de quien defendió estas criptas en vida y en muerte.", shield:0.4, icon:"/game/skills/skill-guardia-ancestral.png" },
    "💀 Grito de Batalla":    { cost:3,  damage:0,  heal:0,  emoji:"💀", name:"Grito Batalla", damageRange:"Buf Furia",type:"magic", desc:"Un alarido que resuena entre las tumbas. Los huesos vibran con la memoria de mil batallas olvidadas.", fury:true, icon:"/game/skills/skill-grito-batalla.png" },
    "⚔️ Estocada Mortal":     { cost:4,  damage:28, heal:0,  emoji:"⚔️", name:"Estocada",     damageRange:"28-34",   type:"basic", desc:"Una estocada directa al corazón. El esqueleto recuerda dónde clavar la hoja.", armorPen:0.3, icon:"/game/skills/skill-estocada-mortal.png" },

    // ═══════════════════════════════════════════
    // 👻 FANTASMA — Catacumbas (2 habilidades)
    // ═══════════════════════════════════════════
    "👻 Aullido Espectral":   { cost:3,  damage:22, heal:0,  emoji:"👻", name:"Aullido",      damageRange:"22-28",   type:"magic", desc:"Un grito que traspasa el alma. El sonido de la agonía eterna hecho arma.", debuff:0.7, icon:"/game/skills/skill-aullido-espectral.png" },
    "👻 Toque Gélido":        { cost:2,  damage:0,  heal:0,  emoji:"👻", name:"Toque Gélido", damageRange:"Stun",    type:"magic", desc:"La mano espectral atraviesa el pecho y congela el corazón un instante. El miedo paraliza.", freeze:true, icon:"/game/skills/skill-toque-gelido.png" },

    // ═══════════════════════════════════════════
    // 🧟 MOMIA — Catacumbas (3 habilidades)
    // ═══════════════════════════════════════════
    "🧟 Vendaje Estrangulador":{ cost:3, damage:16, heal:0,  emoji:"🧟", name:"Vendaje",     damageRange:"16-20+Aplast",type:"basic", desc:"Los vendajes se extienden como serpientes y estrangulan al objetivo con fuerza milenaria.", debuff:0.7, icon:"/game/skills/skill-vendaje-estrangulador.png" },
    "🧟 Ira Faraónica":       { cost:2,  damage:0,  heal:0,  emoji:"🧟", name:"Ira Faraónica",damageRange:"Buf Furia",type:"magic", desc:"Los ojos de la momia arden con furia antigua. La cólera de un gobernante traicionado despierta.", fury:true, icon:"/game/skills/skill-ira-faraonica.png" },
    "🧟 Marcha Eterna":       { cost:2,  damage:0,  heal:4,  emoji:"🧟", name:"Marcha",       damageRange:"Escudo+Cura",type:"defense", desc:"La momia avanza implacable. Sus vendajes se regeneran mientras camina, eterna como la muerte.", shield:0.3, icon:"/game/skills/skill-marcha-eterna.png" },

    // ═══════════════════════════════════════════
    // 🪱 GUSANO DE CRIPTA — Catacumbas (3 habilidades)
    // ═══════════════════════════════════════════
    "🪱 Mordisco Devorador":  { cost:4,  damage:24, heal:4,  emoji:"🪱", name:"Mordisco",     damageRange:"24-30",   type:"basic", desc:"Las mandíbulas circulares se cierran con fuerza suficiente para triturar hueso y piedra.", lifesteal:0.15, icon:"/game/skills/skill-mordisco-devorador.png" },
    "🪱 Terrermoto Subterráneo":{ cost:3, damage:18, heal:0, emoji:"🪱", name:"Terremoto",   damageRange:"18-22+Stun",type:"basic", desc:"El gusano golpea el suelo desde abajo. Las criptas tiemblan y los sepulcros se derrumban.", freeze:true, icon:"/game/skills/skill-terremoto-subterraneo.png" },
    "🪱 Caparazón Viscoso":   { cost:2,  damage:0,  heal:0,  emoji:"🪱", name:"Caparazón",    damageRange:"-30% Daño",type:"defense", desc:"La piel viscosa y pálida del gusano absorbe impactos como si nada hubiera pasado.", shield:0.3, icon:"/game/skills/skill-caparazon-viscoso.png" },

    // ═══════════════════════════════════════════
    // 🔮 NIGROMANTE — Catacumbas (4 habilidades)
    // ═══════════════════════════════════════════
    "🔮 Drenar Vida":         { cost:3,  damage:18, heal:5,  emoji:"🔮", name:"Drenar",       damageRange:"18-22+Cura",type:"magic", desc:"Energía verde sale del cristal del bastón y absorbe la vitalidad del enemigo para restaurar la propia.", lifesteal:0.2, icon:"/game/skills/skill-drenar-vida.png" },
    "🔮 Maldición de Tumba":  { cost:2,  damage:0,  heal:0,  emoji:"🔮", name:"Maldición",    damageRange:"Debuff",  type:"magic", desc:"Susurra una maldición en lengua muerta. Los huesos del enemigo se vuelven quebradizos y lentos.", debuff:0.6, icon:"/game/skills/skill-maldicion-tumba.png" },
    "🔮 Invocar Caído":       { cost:4,  damage:14, heal:0,  emoji:"🔮", name:"Invocar",      damageRange:"14x2",    type:"magic", desc:"Las manos esqueléticas emergen del suelo y arañan al enemigo mientras el nigromante ríe.", multi:2, icon:"/game/skills/skill-invocar-caido.png" },
    "🔮 Escudo Necrótico":    { cost:2,  damage:0,  heal:3,  emoji:"🔮", name:"Escudo",       damageRange:"Escudo+Cura",type:"defense", desc:"Un muro de energía necrótica protege al nigromante. Los ataques se pudren al tocarlo.", shield:0.35, icon:"/game/skills/skill-escudo-necrotico.png" },

    // ═══════════════════════════════════════════
    // 👑 REINA ESPECTRAL — Boss Catacumbas (4 habilidades)
    // ═══════════════════════════════════════════
    "👑 Lamento Real":        { cost:4,  damage:24, heal:0,  emoji:"👑", name:"Lamento",      damageRange:"24-30+Stun",type:"magic", desc:"El llanto de la reina resuena en las criptas. El dolor de mil años de encierro se hace arma.", freeze:true, icon:"/game/skills/skill-lamento-real.png" },
    "👑 Corona de Sombras":   { cost:3,  damage:0,  heal:4,  emoji:"👑", name:"Corona",       damageRange:"Escudo+Cura",type:"defense", desc:"Las sombras de su corona se extienden como un manto protector, sanando su forma etérea.", shield:0.4, icon:"/game/skills/skill-corona-sombras.png" },
    "👑 Mandato Espectral":   { cost:5,  damage:32, heal:0,  emoji:"👑", name:"Mandato",      damageRange:"32-40",   type:"magic", desc:"La reina ordena y los muertos obedecen. Una descarga de poder espectral arrasa todo a su paso.", armorPen:0.3, icon:"/game/skills/skill-mandato-espectral.png" },
    "👑 Corte Fantasmal":     { cost:2,  damage:0,  heal:0,  emoji:"👑", name:"Corte",        damageRange:"Buf+Debuff",type:"defense", desc:"Invoca a su corte de espectros menores que protegen a su reina y debilitan a los intrusos.", shield:0.25, debuff:0.7, icon:"/game/skills/skill-corte-fantasmal.png" },

    // ═══════════════════════════════════════════
    // 🌟 HABILIDADES MAESTRAS — Catacumbas
    // ═══════════════════════════════════════════
    "🌟 Legión de Huesos":    { cost:0,  damage:12, heal:0,  emoji:"⚔️", name:"Legión",       damageRange:"12x3",    type:"ultimate", desc:"El esqueleto guerrero convoca a sus camaradas caídos. Tres estocadas simultáneas de la terna eterna.", multi:3, icon:"/game/skills/skill-legion-huesos.png" },
    "🌟 Posesión":            { cost:0,  damage:0,  heal:0,  emoji:"👻", name:"Posesión",     damageRange:"Stun+Debuff",type:"ultimate", desc:"El fantasma se funde con el cuerpo del enemigo y lo paraliza desde dentro. Tu cuerpo ya no es tuyo.", freeze:true, debuff:0.5, icon:"/game/skills/skill-posesion.png" },
    "🌟 Juicio Faraónico":    { cost:0,  damage:28, heal:0,  emoji:"🧟", name:"Juicio",       damageRange:"28+Veneno",type:"ultimate", desc:"La momia pronuncia la sentencia de los dioses antiguos. El castigo es lento, doloroso e inevitable.", bleed:5, icon:"/game/skills/skill-juicio-faraonico.png" },
    "🌟 Engullir":            { cost:0,  damage:15, heal:8,  emoji:"🪱", name:"Engullir",     damageRange:"15+Cura8",type:"ultimate", desc:"El gusano traga al enemigo parcialmente, drenando su esencia antes de escupirlo. Nutrición subterránea.", lifesteal:0.3, icon:"/game/skills/skill-engullir.png" },
    "🌟 Plaga Necrótica":     { cost:0,  damage:10, heal:0,  emoji:"🔮", name:"Plaga",        damageRange:"10x3+Veneno",type:"ultimate", desc:"El nigromante desata su mayor pestilencia. Tres ráfagas de energía pútrida que corrompen hueso y alma.", multi:3, bleed:3, icon:"/game/skills/skill-plaga-necrotica.png" },
    "🌟 Decreto Espectral":   { cost:0,  damage:20, heal:0,  emoji:"👑", name:"Decreto",      damageRange:"20x2+Stun",type:"ultimate", desc:"La Reina Espectral pronuncia su decreto final. Dos golpes espectrales y el silencio eterno.", multi:2, freeze:true, icon:"/game/skills/skill-decreto-espectral.png" },

    // ═══════════════════════════════════════════
    // 🦅 BUITRE CARROÑERO — Páramo (3 habilidades)
    // ═══════════════════════════════════════════
    "🦅 Picotazo Fétido":      { cost:0,  damage:8,  heal:0,  emoji:"🦅", name:"Picotazo",     damageRange:"8-10",    type:"basic", desc:"Un picotazo con pico podrido que infecta la herida.", icon:"/game/skills/skill-picotazo-fetido.png" },
    "🦅 Aullido del Yermo":    { cost:0,  damage:5,  heal:0,  emoji:"🦅", name:"Aullido",      damageRange:"5+Stun",  type:"magic", desc:"El grito del buitre paraliza de terror.", freeze:true, icon:"/game/skills/skill-aullido-del-yermo.png" },
    "🦅 Zarpazo de Plumas":    { cost:0,  damage:7,  heal:0,  emoji:"🦅", name:"Zarpazo",      damageRange:"7-9",     type:"basic", desc:"Garras afiladas como cuchillos de hueso.", icon:"/game/skills/skill-zarpazo-de-plumas.png" },
    "🌟 Carroña Implacable":   { cost:0,  damage:12, heal:0,  emoji:"🦅", name:"Carroña",      damageRange:"12x2",    type:"ultimate", desc:"Dos picotazos salvajes. El segundo a 50% de fuerza.", multi:2, icon:"/game/skills/skill-carrona-implacable.png" },

    // ═══════════════════════════════════════════
    // 🦂 HOMBRE ESCORPIÓN — Páramo (4 habilidades)
    // ═══════════════════════════════════════════
    "🦂 Pinza Trituradora":    { cost:0,  damage:9,  heal:0,  emoji:"🦂", name:"Pinza",        damageRange:"9-11",    type:"basic", desc:"Una pinza que aplasta huesos sin esfuerzo.", icon:"/game/skills/skill-pinza-trituradora.png" },
    "🦂 Cola Venenosa":        { cost:0,  damage:6,  heal:0,  emoji:"🦂", name:"Cola",         damageRange:"6+Veneno",type:"bleed", desc:"El aguijón inyecta veneno que corroe por dentro.", bleed:4, icon:"/game/skills/skill-cola-venenosa.png" },
    "🦂 Caparazón Púrpura":    { cost:0,  damage:0,  heal:0,  emoji:"🦂", name:"Caparazón",    damageRange:"-40% Daño",type:"defense", desc:"El caparazón se endurece absorbiendo daño.", shield:0.4, icon:"/game/skills/skill-caparazon-purpura.png" },
    "🦂 Aguijonazo Letal":     { cost:0,  damage:10, heal:0,  emoji:"🦂", name:"Aguijonazo",   damageRange:"10-12",   type:"basic", desc:"Un golpe devastador con la cola completa.", icon:"/game/skills/skill-aguijonazo-letal.png" },
    "🌟 Veneno Escorpión":     { cost:0,  damage:5,  heal:0,  emoji:"🦂", name:"Veneno",       damageRange:"5+Veneno6",type:"ultimate", desc:"Veneno concentrado que drena la vida por 3 turnos.", bleed:6, icon:"/game/skills/skill-veneno-escorpion.png" },

    // ═══════════════════════════════════════════
    // 🏜️ NÓMADA SOMBRÍO — Páramo (3 habilidades)
    // ═══════════════════════════════════════════
    "🏜️ Daga del Yermo":       { cost:0,  damage:8,  heal:0,  emoji:"🏜️", name:"Daga",        damageRange:"8-10",    type:"basic", desc:"Una daga curva envenenada con toxinas del desierto.", icon:"/game/skills/skill-daga-del-yermo.png" },
    "🏜️ Maldición de Arena":   { cost:0,  damage:4,  heal:0,  emoji:"🏜️", name:"Maldición",   damageRange:"4+Debuff",type:"magic", desc:"Una maldición que debilita al enemigo.", debuff:3, icon:"/game/skills/skill-maldicion-de-arena.png" },
    "🏜️ Paso Fantasma":        { cost:0,  damage:0,  heal:0,  emoji:"🏜️", name:"Paso",        damageRange:"-30% Daño",type:"defense", desc:"El nómada se funde con las sombras de la arena.", shield:0.3, icon:"/game/skills/skill-paso-fantasma.png" },
    "🌟 Tormenta de Arena":    { cost:0,  damage:7,  heal:0,  emoji:"🏜️", name:"Tormenta",    damageRange:"7+Stun",  type:"ultimate", desc:"Una tormenta de arena que ciega y paraliza.", freeze:true, icon:"/game/skills/skill-tormenta-de-arena.png" },

    // ═══════════════════════════════════════════
    // 🏺 GOLEM DE ARENA — Páramo (3 habilidades)
    // ═══════════════════════════════════════════
    "🏺 Puño de Roca":          { cost:0,  damage:10, heal:0,  emoji:"🏺", name:"Puño",        damageRange:"10-12",   type:"basic", desc:"Un puño de roca que hace temblar el suelo.", icon:"/game/skills/skill-puno-de-roca.png" },
    "🏪 Muro de Arena":          { cost:0,  damage:0,  heal:0,  emoji:"🏪", name:"Muro",        damageRange:"-40% Daño",type:"defense", desc:"Arena se compacta formando un muro protector.", shield:0.4, icon:"/game/skills/skill-muro-de-arena.png" },
    "🏺 Terremoto Árido":       { cost:0,  damage:7,  heal:0,  emoji:"🏺", name:"Terremoto",   damageRange:"7-9",     type:"basic", desc:"El suelo tiembla bajo los pies del enemigo.", icon:"/game/skills/skill-terremoto-arido.png" },
    "🌟 Arena Viva":            { cost:0,  damage:8,  heal:0,  emoji:"🏺", name:"Arena Viva",  damageRange:"8x3",     type:"ultimate", desc:"Tres golpes de arena animada. Los segundos a 50%.", multi:3, icon:"/game/skills/skill-arena-viva.png" },

    // ═══════════════════════════════════════════
    // 💨 ESPECTRO DEL DESIERTO — Páramo (2 habilidades)
    // ═══════════════════════════════════════════
    "💨 Aullido del Yermo":     { cost:0,  damage:7,  heal:0,  emoji:"💨", name:"Aullido",     damageRange:"7-9",     type:"magic", desc:"Un aullido que congela el alma del viviente.", icon:"/game/skills/skill-aullido-del-yermo-2.png" },
    "💨 Tormenta de Polvo":     { cost:0,  damage:5,  heal:0,  emoji:"💨", name:"Tormenta",    damageRange:"5+Debuff",type:"magic", desc:"Arena maldita que ciega y debilita.", debuff:2, icon:"/game/skills/skill-tormenta-de-polvo.png" },
    "🌟 Posesión Arenosa":     { cost:0,  damage:6,  heal:0,  emoji:"💨", name:"Posesión",    damageRange:"6+Stun+Robo",type:"ultimate", desc:"El espectro posee al enemigo y roba sus shards.", freeze:true, steal:15, icon:"/game/skills/skill-posesion-arenosa.png" },

    // ═══════════════════════════════════════════
    // 👑 FARAÓN MALDITO — Boss Páramo (4 habilidades)
    // ═══════════════════════════════════════════
    "👑 Decreto Faraónico":     { cost:0,  damage:8,  heal:0,  emoji:"👑", name:"Decreto",     damageRange:"8+Stun",  type:"magic", desc:"La palabra del faraón es ley. Y la ley es muerte.", freeze:true, icon:"/game/skills/skill-decreto-faraonico.png" },
    "👑 Ira del Nilo":          { cost:0,  damage:10, heal:0,  emoji:"👑", name:"Ira",         damageRange:"10-12",   type:"magic", desc:"La furia de un dios desatada en arena y fuego.", icon:"/game/skills/skill-ira-del-nilo.png" },
    "👑 Marcha de los Muertos": { cost:0,  damage:6,  heal:0,  emoji:"👑", name:"Marcha",      damageRange:"6-8",     type:"basic", desc:"Los muertos marchan al compás del faraón.", icon:"/game/skills/skill-marcha-de-los-muertos.png" },
    "👑 Cetro Ancestral":       { cost:0,  damage:9,  heal:0,  emoji:"👑", name:"Cetro",       damageRange:"9-11",    type:"basic", desc:"El cetro canaliza mil años de poder maldito.", icon:"/game/skills/skill-cetro-ancestral.png" },
    "🌟 Juicio de Anubis":     { cost:0,  damage:12, heal:0,  emoji:"👑", name:"Juicio",      damageRange:"12+Sangre+Debuff",type:"ultimate", desc:"Anubis juzga al viviente: sangra, sufre y perece.", bleed:5, debuff:3, icon:"/game/skills/skill-juicio-de-anubis.png" },
};
