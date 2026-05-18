/**
 * Travel Event System (G1-A)
 * Events trigger 30% of the time when traveling between zones.
 * Each event has comedic dialogue options and varied outcomes.
 */

export interface TravelEventOption {
  label: string;
  outcome: {
    text: string;
    effect?: TravelEventEffect;
  };
}

export interface TravelEventEffect {
  shards?: number;
  pieces?: number;        // heal/damage
  potions?: number;
  addItem?: { id: string; rarity: string; skillRarities: Record<string, string> };
}

export interface TravelEvent {
  id: string;
  zone: string[];        // which zones this can appear in (empty = any)
  title: string;
  description: string;
  options: TravelEventOption[];
}

// ═══ EVENT POOLS ═══

const ANY_ZONE = ['🌲 Bosque', 'Catacumbas', 'Paramo', 'Cienaga', 'Volcan', 'Trono'];
const FOREST = ['🌲 Bosque'];
const CATACOMBS = ['Catacumbas'];
const WILDS = ['Paramo', 'Cienaga'];
const DEEP = ['Volcan', 'Trono'];

export const TRAVEL_EVENTS: TravelEvent[] = [
  // ═══ BOSQUE ═══
  {
    id: 'wolf_hurt',
    zone: FOREST,
    title: '🐺 Lobo Herido',
    description: 'Un lobo yace junto al camino, una pata atrapada en una trampa oxidada. Te mira con esos ojos que dicen "no soy peligroso... hoy".',
    options: [
      {
        label: 'Ayudar al lobo',
        outcome: {
          text: 'Liberas su pata con cuidado. El lobo te lame la mano (o lo que sea que tengas por mano) y desaparece entre los arbustos. Encuentras 💎 que dejó caer un cazador asustado.',
          effect: { shards: 25 },
        },
      },
      {
        label: 'Ignorar y seguir',
        outcome: {
          text: 'Pasas de largo. El lobo aúlla tristemente. Un búho te mira con desaprobación desde una rama. Sientes que hasta los árboles te juzgan.',
          effect: {},
        },
      },
      {
        label: 'Robar la trampa',
        outcome: {
          text: 'Desmontas la trampa ante la mirada confusa del lobo. "Eso es metal gratis, amigo." El lobo te sigue por 10 pasos y luego se da cuenta de que eres un esqueleto. Sale corriendo.',
          effect: { shards: 15, pieces: 10 },
        },
      },
      {
        label: 'Intentar domesticar al lobo',
        outcome: {
          text: 'Te agachas y silbas. El lobo muerde tu fémur... pero como no tienes carne, se confunde y se va. Al menos te dejaste un trofeo: colmillo de lobo.',
          effect: {} ,
        },
      },
    ],
  },
  {
    id: 'mushroom_glow',
    zone: FOREST,
    title: '🍄 Seta Brillante',
    description: 'Un grupo de setas emite un resplandor azulado en la oscuridad del bosque. Parecen comestibles... si "comestible" incluye alucinaciones de verte con carne.',
    options: [
      {
        label: 'Recolectar las setas',
        outcome: {
          text: 'Las recoges con cuidado. Resultan ser fragmentos de cristal natural. Tu estructura ósea vibra de satisfacción. O eso, o es el veneno.',
          effect: { shards: 15 },
        },
      },
      {
        label: 'Comer una seta',
        outcome: {
          text: 'Le das un mordisco. El mundo gira. Ves a Barnaby con carne... ¡Y CON ROPA! Vuelves a la realidad con la boca llena de tierra y fragmentos de cristal entre los dientes.',
          effect: { pieces: -15 },
        },
      },
      {
        label: 'Pisar las setas',
        outcome: {
          text: 'Las aplastas con tu bota ósea. Una nube de esporas te envuelve. No pasa nada... hasta que te das cuenta de que brillas en la oscuridad. Estiloso pero inútil.',
          effect: { shards: 5 },
        },
      },
      {
        label: 'Estudiarlas desde lejos',
        outcome: {
          text: 'Observas científicamente. Determinas que son... setas. Brillantes. Tu carrera como micólogo se ha estancado, pero encuentras monedas alrededor.',
          effect: { shards: 20 },
        },
      },
    ],
  },
  {
    id: 'lost_hunter',
    zone: FOREST,
    title: '🏹 Cazador Perdido',
    description: 'Un cazador vaga en círculos, murmurando "Juraba que el norte era hacia la derecha." Lleva una bolsa que suena a cristales.',
    options: [
      {
        label: 'Guiar al cazador',
        outcome: {
          text: 'Lo guías hasta el camino. "¡Gracias, esqueleto... whatever!" Te lanza un puñado de shards como propina.',
          effect: { shards: 30 },
        },
      },
      {
        label: 'Asustar al cazador',
        outcome: {
          text: 'Sales de detrás de un árbol: "¡BUUU!" El cazador grita, tropieza, y su bolsa se abre. Los cristales vuelan. Agarras los que puedes antes de que se levante.',
          effect: { shards: 15, potions: 1 },
        },
      },
      {
        label: 'Pedir dirección también',
        outcome: {
          text: '"¿Tú también estás perdido?" Se ríe. "¡Al menos yo tengo excusa, soy de ciudad!" Se van juntos en la dirección equivocada. Encuentran pociones abandonadas.',
          effect: { potions: 2 },
        },
      },
      {
        label: 'Intercambiar información',
        outcome: {
          text: '"Te digo dónde está el pueblo si me dices dónde está... lo que sea que estás buscando." "Soy un esqueleto andante." "...Ok, no quiero saber. Toma shards y adiós."',
          effect: { shards: 20 },
        },
      },
    ],
  },
  {
    id: 'fairy_trick',
    zone: FOREST,
    title: '✨ Hada Bromista',
    description: 'Un hada diminuta vuela frente a tu cráneo. "¡Oye, calavera! ¿Quieres un deseo? Solo tienes que... dejarme ver tu inventario. No es sospechoso, lo prometo."',
    options: [
      {
        label: 'Aceptar el trato',
        outcome: {
          text: 'El hada revoltea tus bolsillos. Roba 10 shards pero accidentalmente te cura con polvo de hada. "¡Ups! Se me escapó la magia buena."',
          effect: { shards: -10, pieces: 25 },
        },
      },
      {
        label: 'Rechazar con educación',
        outcome: {
          text: '"No, gracias." El hada buféa: "¡Aburrido!" y se va. Pero deja caer una gota de esencia mágica al marcharse.',
          effect: { shards: 15 },
        },
      },
      {
        label: 'Intentar atrapar al hada',
        outcome: {
          text: 'Chasqueas tus dedos óseos. El hada los esquiva fácilmente. "¡Lento!" Te lanza polvo picante en los ojos... bueno, en las cuencas. Te pica pero encuentras fragmentos brillantes en el suelo.',
          effect: { shards: 20 },
        },
      },
      {
        label: 'Contar un chiste',
        outcome: {
          text: '"¿Qué le dijo un hueso a otro? ¡Nos vemos en la cena!" El hada ríe tanto que suelta shards. "¡Ok, ok! ¡Ese era bueno!"',
          effect: { shards: 25 },
        },
      },
    ],
  },

  // ═══ CATACUMBAS ═══
  {
    id: 'sealed_tomb',
    zone: CATACOMBS,
    title: '⚰️ Tumba Sellada',
    description: 'Una tumba antigua con runas en la puerta. Las runas dicen: "No abrir. En serio. No." La puerta tiene una grieta tentadora.',
    options: [
      {
        label: 'Abrir la tumba',
        outcome: {
          text: 'Forzas la puerta. Una explosión de polvo milenario te envuelve. Encuentras restos de un guerrero... y su bolsa de shards. Él ya no la necesita.',
          effect: { shards: 40, pieces: -10 },
        },
      },
      {
        label: 'Respetar la advertencia',
        outcome: {
          text: 'Te alejas respetuosamente. Una voz susurra desde dentro: "Gracias... ten esto." Una moneda rueda por debajo de la puerta. ¡Educación paga!',
          effect: { shards: 10 },
        },
      },
      {
        label: 'Leer las runas en voz alta',
        outcome: {
          text: 'Pronuncias las runas antiguas. Se iluminan. La puerta se abre... sola. Un esqueleto dentro te saluda: "¡Vecino! ¿Tienes fragmentos prestados?" Te da shards por las molestias.',
          effect: { shards: 35 },
        },
      },
      {
        label: 'Tocar la puerta y correr',
        outcome: {
          text: 'Tocas la puerta y sales corriendo. Algo ruge adentro. Algo pesado choca contra la puerta. Pero se cae un colgante con shards por la grieta. ¡Ganancia!',
          effect: { shards: 30 },
        },
      },
    ],
  },
  {
    id: 'ancestral_spirit',
    zone: CATACOMBS,
    title: '👻 Espíritu Ancestral',
    description: 'Un espíritu translúcido flota frente a ti. "¡Por fin! Alguien que entiende la vida después de la muerte... bueno, más o menos." Te ofrece un trato.',
    options: [
      {
        label: 'Ofrecer fragmentos',
        outcome: {
          text: 'Depositas fragmentos de cristal en el suelo. El espíritu los absorbe: "¡Mmm, energía!" Te bendice con poder espectral. Te sientes más fuerte.',
          effect: { shards: 30 },
        },
      },
      {
        label: 'Desafiar al espíritu',
        outcome: {
          text: '"¿Quieres pelea? ¡Soy un esqueleto!" El espíritu ríe: "Admiro tu actitud." Te da un fragmento de poder espectral. Duele un poco.',
          effect: { pieces: -20, shards: 50 },
        },
      },
      {
        label: 'Pedir consejos de muerto',
        outcome: {
          text: '"¿Consejos? No mueras. Ya ves cómo termina." Te señala a sí mismo. Luego se pone serio: "En la siguiente cámara hay algo valioso. Te marco el camino."',
          effect: { shards: 20 },
        },
      },
      {
        label: 'Invitar al espíritu a tu cuerpo',
        outcome: {
          text: '"¿Puedo... poseerte?" Entras en tu cuerpo... bueno, EN tu esqueleto. "¡Vaya, qué cómodo!" Te da poder antes de salir. "Gracias por el test drive."',
          effect: { pieces: 15, shards: 30 },
        },
      },
    ],
  },
  {
    id: 'secret_passage',
    zone: CATACOMBS,
    title: '🚪 Pasaje Secreto',
    description: 'Un pasaje oculto se revela cuando tropiezas con un ladrillo suelto. Se escucha el sonido de agua corriendo y... ¿monedas?',
    options: [
      {
        label: 'Explorar el pasaje',
        outcome: {
          text: 'Avanzas a tientas. Resbalas en moho, caes en un charco, pero aterrizas sobre... ¡una colección de monedas olvidadas! Duele la caída pero vale la pena.',
          effect: { shards: 45, pieces: -15 },
        },
      },
      {
        label: 'Lanzar una piedra primero',
        outcome: {
          text: 'Lanzas un hueso suelto (no tuyo). Se escucha un splash y luego un rugido. Decides que el pasaje puede esperar. Encuentras shards en el ladrillo.',
          effect: { shards: 15 },
        },
      },
      {
        label: 'Tapar el pasaje',
        outcome: {
          text: 'Empujas el ladrillo de vuelta. Se cierra con un click satisfactorio. Una trampa oculta se activa y dispara monedas. ¡Arquitectura antigua defectuosa a tu favor!',
          effect: { shards: 25 },
        },
      },
      {
        label: 'Marcar la ubicación y seguir',
        outcome: {
          text: 'Rascas una X en la pared. "Volveré con equipo." Al girarte, encuentras un esqueleto anterior que hizo lo mismo... pero nunca volvió. Sus bolsillos tienen shards.',
          effect: { shards: 15 },
        },
      },
    ],
  },
  {
    id: 'bone_collector',
    zone: CATACOMBS,
    title: '🦴 Coleccionista de Huesos',
    description: 'Un viejo encorvado con una bolsa llena de huesos te mira con ojos brillantes. "¡Oh! ¡Un espécimen AUTOPOYÉTICO! ¿Me dejarías examinar... esto?" Señala a todo tú.',
    options: [
      {
        label: 'Permitir el examen',
        outcome: {
          text: 'Te palpa, te mide, te golpea como a un melón. "¡Fascinante articulación!" Te paga por tu tiempo y te arregla un hueso flojo que ni sabías que tenías.',
          effect: { shards: 20, pieces: 30 },
        },
      },
      {
        label: 'Cobrar por hueso suelto',
        outcome: {
          text: '"¿Cuánto por un dedo?" "¡NO SE VENDEN PARTES!" grita. Pero te compra el polvo de hueso que tenías en el bolsillo. "¡Esto es oro para mí!"',
          effect: { shards: 35 },
        },
      },
      {
        label: 'Intercambiar huesos',
        outcome: {
          text: 'Le ofreces un hueso que encontraste. Él te da fragmentos a cambio. "¡Negocio justo!" Los dos se van felices. Es como un mercado de pulgas pero más... mórbido.',
          effect: { shards: -10 },
        },
      },
      {
        label: 'Huir despacio',
        outcome: {
          text: 'Caminas hacia atrás lentamente. Él te sigue. "¡Solo una mirada!" Empiezas a correr. Tropezar con una urna. La urna tiene shards. La suerte del principiante.',
          effect: { shards: 20 },
        },
      },
    ],
  },

  // ═══ PÁRAMO / CIÉNAGA ═══
  {
    id: 'abandoned_fire',
    zone: WILDS,
    title: '🔥 Fogata Abandonada',
    description: 'Una fogata aún humeante junto a un carro volcado. Alguien salió corriendo hace poco. Quedan provisiones y... ¿esas son marcas de garras?',
    options: [
      {
        label: 'Buscar provisiones',
        outcome: {
          text: 'Registras el carro. Encuentras pociones y shards. Las marcas de garras en la madera te dicen que el dueño tuvo una cita con algo grande y peludo. Mejor irse.',
          effect: { shards: 25, potions: 1 },
        },
      },
      {
        label: 'Descansar junto al fuego',
        outcome: {
          text: 'Te sientas. El calor no te afecta (no tienes piel) pero la vibra es agradable. Encuentras fragmentos de cristal en las cenizas. ¿Quién tira cristales al fuego? Gente rara.',
          effect: { pieces: 20 },
        },
      },
      {
        label: 'Seguir las huellas',
        outcome: {
          text: 'Sigues las marcas de garras. Encuentras el campamento de la bestia... y su colección de monedas. Robas rápido antes de que vuelva. El corazón no te late pero la emoción es real.',
          effect: { shards: 50, pieces: -20 },
        },
      },
      {
        label: 'Apagar el fuego y esconderse',
        outcome: {
          text: 'Apagas la fogata con tu bota y te escondes. Nada pasa. Absolutamente nada. 10 minutos después, sigues solo. Pero encuentras una bolsa enterrada bajo las brasas.',
          effect: { shards: 30 },
        },
      },
    ],
  },
  {
    id: 'shady_merchant',
    zone: WILDS,
    title: '🧥 Mercader Sombrio',
    description: 'Una figura envuelta en harapos emerge de la niebla. "Psst. ¿Interesado en... mercancía especial? Todo es 100% robado — quiero decir, LEGAL." Abre su abrigo. Hay de todo.',
    options: [
      {
        label: 'Comprar pociones (20💎)',
        outcome: {
          text: '"¡Trato hecho!" Te da una poción que brilla sospechosamente. "Es de calidad, confía." La bebes. Funciona. O al menos no te has muerto. Todavía.',
          effect: { shards: -20, potions: 2 },
        },
      },
      {
        label: 'Comprar fragmentos (30💎)',
        outcome: {
          text: '"Fragmentos premium, directo de... no hagas preguntas." Te los da. Son cristales brillantes en una bolsa sin etiqueta. ¿Qué podría salir mal? Absorbes: sabor a poder. Buen signo.',
          effect: { shards: -30 },
        },
      },
      {
        label: 'Regatear agresivamente',
        outcome: {
          text: '"¿20 shards? Te doy 5 y una sonrisa." "¡Eso es robo!" "Potasio, llamar potasio al turron..." Se va ofendido pero deja caer algo. Lo recoges. Ganancia.',
          effect: { shards: 15 },
        },
      },
      {
        label: 'Amenazar con huesos',
        outcome: {
          text: 'Chasqueas tus costillas amenazadoramente. "¡No me asustas!" Pero cuando sacas tu cráneo como lunes de carnaval, sale corriendo y deja todo. Gratis es el mejor precio.',
          effect: { shards: 10, potions: 1 },
        },
      },
    ],
  },
  {
    id: 'dark_ritual',
    zone: WILDS,
    title: '🔮 Ritual Oscuro',
    description: 'Un círculo de velas negras en un claro. En el centro, un altar con runas que pulsan. El aire huele a azufre y... ¿esas son galletas? Magia oscura con catering.',
    options: [
      {
        label: 'Sacrificar piezas (sangre ósea)',
        outcome: {
          text: 'Dejas caer fragmentos de ti mismo en el altar. Las llamas se ponen verdes. Una voz ruge: "¡ACEPTADO!" Sientes poder recorrer tu estructura. Duele pero el altar te recompensa con shards.',
          effect: { pieces: -30, shards: 60 },
        },
      },
      {
        label: 'Romper el círculo',
        outcome: {
          text: 'Pisas las velas. El ritual se interrumpe. Una explosión de energía dispersa shards por todo el claro. Recoges los que puedes antes de que aparezca el dueño.',
          effect: { shards: 40 },
        },
      },
      {
        label: 'Unirse al ritual',
        outcome: {
          text: 'Te sientas en el círculo y canturreas. Las velas se apagan. Nada pasa. Luego... ¡shards aparecen de la nada! "A veces la ignorancia es poder." — El ritual, aparentemente.',
          effect: { shards: 20, pieces: -10 },
        },
      },
      {
        label: 'Robar las galletas',
        outcome: {
          text: 'Agarras las galletas del catering. Son de cristal molido. DELICIOSAS. El altar zumba molesto pero qué le va a hacer, no tiene manos. Tú sí (óseas, pero funcionan).',
          effect: {} ,
        },
      },
    ],
  },

  // ═══ VOLCÁN / TRONO ═══
  {
    id: 'lake_fire',
    zone: DEEP,
    title: '🌋 Lago de Lava',
    description: 'Un río de lava atraviesa el camino. En medio, una isla con un cofre que brilla. El calor es tan intenso que hasta un esqueleto siente... incomodidad existencial.',
    options: [
      {
        label: 'Cruzar por las rocas',
        outcome: {
          text: 'Saltas de roca en roca. Una se hunde. Casi caes. Llegas al cofre: shards y una poción. El viaje de vuelta es peor, pero sobrevives. Los esqueletos no sentimos dolor, ¿verdad?',
          effect: { shards: 55, potions: 1, pieces: -25 },
        },
      },
      {
        label: 'Usar un hueso como puente',
        outcome: {
          text: 'Sacas un hueso extra y lo tiendes. Se incendia inmediatamente. "Ok, plan B." Encuentras un atajo alrededor con menos lava y más monedas.',
          effect: { shards: 30 },
        },
      },
      {
        label: 'Patear el cofre desde aquí',
        outcome: {
          text: 'Lanzas una piedra al cofre. Se cae de la isla y... se funde en la lava. Buen intento. Pero la onda expansiva revela un escondite cerca con menos drama.',
          effect: { shards: 20 },
        },
      },
      {
        label: 'Ignorar y seguir',
        outcome: {
          text: 'La prudencia es la madre de la victoria. O eso te dices mientras miras el cofre con tristeza. Encuentras shards en el camino de todos modos. La lava no tiene el monopolio del brillo.',
          effect: { shards: 15 },
        },
      },
    ],
  },
  {
    id: 'ancient_guardian',
    zone: DEEP,
    title: '🗿 Guardián Ancestral',
    description: 'Una estatua colosal bloquea el paso. Sus ojos se encienden al acercarte. "SOLO LOS DIGNOS PASAN. DEMUESTRA TU VALOR O RETÍRATE." Tiene vibra de profesor estricto.',
    options: [
      {
        label: 'Demostrar fuerza',
        outcome: {
          text: 'Golpeas el suelo con tu puño óseo. Se rompe. El puño, no el suelo. Pero la estatua se impresiona con tu determinación. "Puntos por esfuerzo." Te deja pasar con un regalo.',
          effect: { pieces: -15, shards: 45 },
        },
      },
      {
        label: 'Demostrar sabiduría',
        outcome: {
          text: '"¿Qué es más fuerte, el hueso o la carne?" La estatúa piensa. "La carne perece, el hueso perdura." "¡CORRECTO!" Te da la recompensa del sabio: una lluvia de shards.',
          effect: { shards: 50 },
        },
      },
      {
        label: 'Demostrar paciencia',
        outcome: {
          text: 'Te sientas en el suelo y esperas. 1 hora. 2 horas. La estatúa se aburre. "OK, OK, PASA. Eres el primero que no se rinde." Te da tu premio por ser tedioso.',
          effect: { shards: 35 },
        },
      },
      {
        label: 'Decir un chiste de huesos',
        outcome: {
          text: '"¿Por qué el esqueleto cruzó la calle? ¡Porque no tenía cuerpo que lo detuviera!" La estatúa ríe tanto que se le cae un fragmento. ¡Fragmento con shards dentro!',
          effect: { shards: 30, pieces: 10 },
        },
      },
    ],
  },
  {
    id: 'shadow_dealer',
    zone: DEEP,
    title: '🖤 Trato en las Sombras',
    description: 'Una voz sin cuerpo susurra desde la oscuridad: "Te ofrezco poder... a cambio de un pequeño sacrificio. Nada importante. Solo un poco de... integridad estructural."',
    options: [
      {
        label: 'Aceptar el trato',
        outcome: {
          text: 'Sientes cómo parte de tu estructura se desintegra. Doloroso. Pero la voz te compensa con shards. "Todo tiene un precio, calavera."',
          effect: { pieces: -40, shards: 80 },
        },
      },
      {
        label: 'Negociar mejores términos',
        outcome: {
          text: '"¿Integridad estructural? ¿No tienes ojos?" Silencio. "...Tienes un punto." La voz te da algo sin cobrar tanto. "No le digas a nadie que cedí."',
          effect: { pieces: -15, shards: 25 },
        },
      },
      {
        label: 'Rechazar con dignidad',
        outcome: {
          text: '"Mis huesos no están en venta." La voz respeta tu decisión. "Pocos se resisten. Toma esto por tu integridad." Un objeto cae del vacío. Cortesía del abismo.',
          effect: { shards: 15, potions: 1 },
        },
      },
      {
        label: 'Contrapropuesta siniestra',
        outcome: {
          text: '"¿Y si TE doy algo de oscuridad a cambio?" La voz se impresiona. "Me gustas, esqueleto." Intercambian favores. Negocio oscuro pero rentable.',
          effect: { shards: 35, pieces: -10 },
        },
      },
    ],
  },

  // ═══ ANY ZONE ═══
  {
    id: 'wandering_bard',
    zone: ANY_ZONE,
    title: '🎵 Bardo Errante',
    description: 'Un bardo con un laúd roto canta desafinado. "¡Oh, esqueleto valiente! ¿Quieres oír mi canción? Solo acepto propinas... o huesos. Principalmente huesos."',
    options: [
      {
        label: 'Escuchar la canción',
        outcome: {
          text: 'Canta una balada sobre un esqueleto que conquistó el mundo. "El héroe eras TÚ." Te conmueves. Los esqueletos no lloran, pero tus cuencas sudan. Te sientes inspirado y encuentras shards tirados.',
          effect: { shards: 20, pieces: 10 },
        },
      },
      {
        label: 'Dar propina (10💎)',
        outcome: {
          text: 'Le das shards. "¡Generoso!" Toca una canción de curación. Te sientes mejor. "La música es la mejor medicina. Bueno, la segunda. La primera son los fragmentos."',
          effect: { shards: -10, pieces: 25 },
        },
      },
      {
        label: 'Arreglar el laúd',
        outcome: {
          text: 'Usas un hueso suelto como clavija. "¡Funciona!" Toca una melodía épica. Los monstruos cercanos huyen del sonido. La paz temporal es reconfortante.',
          effect: { shards: 20 },
        },
      },
      {
        label: 'Pedir que se calle',
        outcome: {
          text: '"¡SHHH!" El bardo se ofende. "¡Nadie le dice silencio a Roberto Melodía!" Se va, pero tropieza y deja caer todo. Recoges shards del suelo. Cortesía de la torpeza.',
          effect: { shards: 15 },
        },
      },
    ],
  },
  {
    id: 'bone_pile',
    zone: ANY_ZONE,
    title: '🦴 Montón de Huesos',
    description: 'Un montículo de huesos en el camino. Podría ser un antiguo cementerio... o el resultado de una fiesta muy salvaje. Algunos huesos brillan con un resplandor sospechoso.',
    options: [
      {
        label: 'Buscar entre los huesos',
        outcome: {
          text: 'Hurgas entre restos ajenos. Encuentras shards incrustados y más fragmentos brillantes. "¿Es saqueo si ya están muertos?" te preguntas. La respuesta es sí, pero gratis es gratis.',
          effect: { shards: 20 },
        },
      },
      {
        label: 'Pagar respetos',
        outcome: {
          text: 'Haces una reverencia. "Descansen en paz, colegas." Un viento misterioso sopla y te sana. "Los huesos cuidan a los huesos." Profundo.',
          effect: { pieces: 25 },
        },
      },
      {
        label: '¿Son familiares?',
        outcome: {
          text: 'Examinas los huesos. "Ese fémur... podría ser mi primo." "Esa costilla... ¿tía Marta?" Rezas por ellos. Un fragmento de su esencia te fortalece.',
          effect: { pieces: 15, shards: 10 },
        },
      },
      {
        label: 'Reclutar huesos',
        outcome: {
          text: '"¡Vengan conmigo, hermanos!" Nada pasa. Obviamente. Eres un esqueleto, no un nigromante. Pero encuentras un hueso hueco con shards adentro. ¡Mejor que nada!',
          effect: { shards: 25 },
        },
      },
    ],
  },
  {
    id: 'treasure_chest',
    zone: ANY_ZONE,
    title: '📦 Cofre Abandonado',
    description: 'Un cofre solitario en medio de la nada. Podría ser una mina de oro o una trampa mortal. También podría ser el baúl de alguien que olvidó dónde lo dejó. La tercera es más probable.',
    options: [
      {
        label: 'Abrir con cuidado',
        outcome: {
          text: 'Lo abres lentamente. ¡Shards! Y una nota: "Si encuentras esto, es tuyo. — Un aventurero optimista." También hay fragmentos extra. El aventurero era previsor.',
          effect: { shards: 30 },
        },
      },
      {
        label: 'Patear el cofre',
        outcome: {
          text: 'Le das una patada. Se rompe la cerradura. El cofre se abre... y dispara una trampa. Una flecha te da. Duele. Pero los contenidos valen la pena. Callo a callo...',
          effect: { shards: 25, pieces: -15 },
        },
      },
      {
        label: 'Sospechar que es un monstruo',
        outcome: {
          text: 'Lo miras con desconfianza. "Eres un mimic, ¿verdad?" No se mueve. Lo tocas. Nada. Es un cofre normal. ¡QUE ABURRICIÓN! Pero tiene cosas adentro.',
          effect: { shards: 15, potions: 1 },
        },
      },
      {
        label: 'Dejarlo y marcar el mapa',
        outcome: {
          text: '"Volveré con más espacio." Al darte la vuelta, oyes un click. El cofre se abre solo. Algo se cae. Lo recoges y sigues. El cofre se cierra. Magia perezosa.',
          effect: { shards: 20 },
        },
      },
    ],
  },
];

/**
 * Get a random travel event for a given zone.
 * Returns null if no event triggers (70% chance).
 */
export function rollTravelEvent(currentZone: string): TravelEvent | null {
  // 30% chance to trigger
  if (Math.random() > 0.30) return null;

  const eligible = TRAVEL_EVENTS.filter(e => e.zone.includes(currentZone));
  if (eligible.length === 0) return null;

  return eligible[Math.floor(Math.random() * eligible.length)];
}
