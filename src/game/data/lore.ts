import { LoreEntry } from './types';

export const LORE_DATA: LoreEntry[] = [
  // ═══ ORIGEN — Desbloqueado al iniciar el juego ═══
  {
    id: 'origen-1',
    title: 'El Despertar de Barnaby',
    date: 'Hace 3 ciclos',
    zone: 'origen',
    unlockCondition: 'start', // siempre desbloqueado
    excerpt: '¿Cómo un esqueleto sin magia puede caminar?',
    content: 'Barnaby no fue alzado por un nigromante. Su despertar fue un error en el código de la realidad, un fragmento de voluntad pura que se negó a disolverse. Mientras otros esqueletos yacían inertes esperando órdenes que nunca llegarían, algo en el interior de Barnaby — un eco de quien fue, o tal vez algo completamente nuevo — lo empujó a ponerse de pie. No tenía memoria, no tenía dueño, no tenía propósito. Solo tenía la terquedad de seguir existiendo.'
  },
  {
    id: 'origen-2',
    title: 'El Analfabetismo Óseo',
    date: 'Hace 3 ciclos',
    zone: 'origen',
    unlockCondition: 'start',
    excerpt: 'Los esqueletos no tienen cerebro. ¿Cómo piensa Barnaby?',
    content: 'Nadie sabe cómo funciona la conciencia de Barnaby. Los eruditos de la ciudad lo llaman "anomalía ontológica", los sacerdotes dicen que es posesión, y los taberneros simplemente le sirven cerveza para que no rompa cosas. La teoría más aceptada es que su voluntad se aloja en la propia estructura ósea, como si cada hueso fuera una neurona de un cerebro repartido por todo el cuerpo. Lo único seguro: Barnaby piensa, siente curiosidad, y a veces incluso tiene mal genio.'
  },
  // ═══ CIUDAD — Desbloqueado al visitar la ciudad ═══
  {
    id: 'ciudad-1',
    title: 'La Ciudad de los Vivos',
    date: 'Ciclo actual',
    zone: 'ciudad',
    unlockCondition: 'location:🏙️ Ciudad',
    excerpt: 'Una ciudad donde los esqueletos no son bien recibidos, pero tolerados.',
    content: 'La Ciudad es el último refugio de la civilización en un reino que se desmorona. Sus muros de piedra protegen a mercaderes, artesanos y aventureros de los peligros del exterior. Para Barnaby, la ciudad es un lugar incómodo: los guardias lo vigilan, los niños le tiran piedras, y el tabernero le cobra el doble. Pero aquí está el herrero que repara sus huesos, el mercader que le vende pociones, y Morgana, la nigromante exiliada que parece entenderlo mejor que nadie.'
  },
  {
    id: 'ciudad-2',
    title: 'Morgana la Exiliada',
    date: 'Ciclo actual',
    zone: 'ciudad',
    unlockCondition: 'npc:Morgana',
    excerpt: 'La única nigromante que no quiere controlar a los muertos.',
    content: 'Morgana fue expulsada del Círculo Nigromántico por negarse a esclavizar a los no-muertos. "Los muertos merecen descansar o elegir", fue su herejía. Ahora vive en las afueras de la ciudad, vendiendo pociones y consejos a quien se atreva a visitarla. Fue ella quien encontró a Barnaby vagando por el cementerio, y en lugar de intentar controlarlo, le enseñó a hablar, a contar monedas, y a no morder a los clientes. Le debe más de lo que cualquier hueso podría pagar.'
  },
  {
    id: 'ciudad-3',
    title: 'El Herrero de Huesos',
    date: 'Ciclo actual',
    zone: 'ciudad',
    unlockCondition: 'npc:Herrero',
    excerpt: 'El único herrero que trabaja con fragmentos en vez de hierro.',
    content: 'El herrero de la ciudad es un viejo artesano que descubrió, por accidente, que los huesos de criaturas mágicas se pueden forjar como metal. Su yunque está lleno de marcas de mordidas y quemaduras ácidas — recuerdos de piezas que no cooperaron. Cobra caro, pero su trabajo es impecable. "Si vas a morir de nuevo", dice, "al menos hazlo con buen equipamiento". Es el único en la ciudad que trata a Barnaby como un cliente normal, no como una anomalía.'
  },
  // ═══ BOSQUE — Desbloqueado al visitar el bosque ═══
  {
    id: 'bosque-1',
    title: 'El Bosque Susurrante',
    date: 'Hace 2 ciclos',
    zone: 'bosque',
    unlockCondition: 'location:🌲 Bosque',
    excerpt: 'Los árboles murmullan. Los esqueletos escuchan.',
    content: 'El Bosque que rodea la ciudad no es un lugar natural. Los árboles crecen en espiral, las raíces se mueven cuando nadie mira, y de noche se escuchan susurros que no provienen de garganta alguna. Los trasgos lo llaman hogar, las serpientes lo usan como nido, y los jabalíes lo defienden como si fuera su madre. Los ancianos de la ciudad dicen que el Bosque fue plantado por los primeros nigromantes como un jardín de componentes — cada criatura una pieza, cada parte un recurso. Barnaby siente algo extraño al entrar: como si los árboles lo reconocieran.'
  },
  {
    id: 'bosque-2',
    title: 'El Rey Trasgo',
    date: 'Hace 2 ciclos',
    zone: 'bosque',
    unlockCondition: 'boss:👑 Rey Trasgo',
    excerpt: 'Un trono de basura, una corona de huesos robados.',
    content: 'En lo profundo del Bosque, entre escombros y trampas cochambrosas, gobierna el Rey Trasgo. Nadie sabe su nombre real — quizás él tampoco. Lo que sí se sabe es que unificó a las tribus trasgas y goblins bajo una única bandera: la del saqueo organizado. Su corona está hecha de huesos robados a esqueletos caídos, y su cetro canaliza energía necrótica que no debería existir en un trasgo. Los rumores dicen que alguien le enseñó nigromancia. Los rumores también dicen que ese alguien se arrepintió.'
  },
  {
    id: 'bosque-3',
    title: 'Rattlebones el Bailarín',
    date: 'Hace 2 ciclos',
    zone: 'bosque',
    unlockCondition: 'npc:Rattlebones',
    excerpt: 'Un esqueleto que eligió la danza sobre la guerra.',
    content: 'Rattlebones es un esqueleto como Barnaby, pero su despertar fue diferente. En lugar de terquedad, encontró ritmo. Baila entre los árboles del Bosque, y sus huesos chocan con una cadencia hipnótica que confunde a los trasgos y atrae a las serpientes. No lucha — baila. Y su danza es tan desorientadora que los enemigos terminan tropezando con sus propios pies. Morgana lo envió al Bosque como explorador, y allí se quedó, contento con su audiencia de criaturas confundidas.'
  },
  {
    id: 'catacumbas-1',
    title: 'Las Catacumbas Olvidadas',
    date: 'Hace 5 ciclos',
    zone: 'catacumbas',
    unlockCondition: 'zone:Catacumbas',
    excerpt: 'Bajo la ciudad, los muertos no descansan. Ni siquiera los que quieren.',
    content: 'Las Catacumbas se extienden bajo la ciudad como las raíces de un árbol muerto. Fueron construidas por una civilización olvidada que enterraba a sus reyes con sus ejércitos, creyendo que la muerte era solo otro campo de batalla. Los siglos transformaron los pasillos en laberintos, y los muertos en guardianes sin memoria. El Sepulturero, el único ser consciente que queda allí, mantiene las tumbas como puede, pero algo ha cambiado. Los muertos se agitan. Algo los despierta.'
  },
  {
    id: 'catacumbas-2',
    title: 'La Reina Espectral',
    date: 'Hace 5 ciclos',
    zone: 'catacumbas',
    unlockCondition: 'boss:👑 Reina Espectral',
    excerpt: 'Una corona de lamento gobierna las criptas.',
    content: 'La Reina Espectral fue la última gobernante de la civilización que construyó las catacumbas. Traicionada por su corte y sellada viva en la cámara del trono, su furia y dolor trascendieron la muerte. Ahora existe como un espectro de poder inmenso, y su lamento mantiene despiertos a todos los muertos de las catacumbas. Los esqueletos guerreros patrullan por instinto, los fantasmas aúllan por compasión, y las momias despiertan por simpatía con su ira. Solo derrotándola se restaurará el silencio eterno que las tumbas merecen.'
  },
  {
    id: 'catacumbas-3',
    title: 'El Sepulturero',
    date: 'Hace 5 ciclos',
    zone: 'catacumbas',
    unlockCondition: 'npc:Sepulturero',
    excerpt: 'El cuidador de los muertos que nunca pidió el trabajo.',
    content: 'El Sepulturero no recuerda cómo llegó a las catacumbas, ni cuánto tiempo lleva allí. Lo único que sabe es que cada tumba tiene un nombre, cada hueso una historia, y alguien tiene que mantener el orden. Cuando la Reina despertó y los muertos comenzaron a levantarse, él fue el único que no perdió la calma. Aferrado a su pala y a su conocimiento de cada pasaje secreto, observa y espera. Si alguien puede poner fin al lamento eterno, ese alguien necesita un guía. Y él conoce cada rincón de la oscuridad.'
  }
];
