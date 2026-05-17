# 🧠 BARNABY RPG — Patrones de Diseño por Zona

> **Referencia para crear nuevas zonas.** Basado en el Bosque (zona 1).
> Cada zona nueva debe seguir este patrón.

---

## 📋 Checklist por Zona

| Elemento | Cantidad | Ejemplo Bosque |
|----------|----------|----------------|
| Enemigos regulares | 4-5 | Goblin, Tontin, Serpiente, Lanzahuesos, Jabalí |
| Boss | 1 | Rey Trasgo |
| Partes por enemigo | 2-4 | head, torso, arms, legs (algunos sin todos los slots) |
| Skills por enemigo | = partes | Cada parte → 1 skill en TDB |
| Master skill | 1 por enemigo | ★ Único, con mecánica especial (multi-hit, steal, freeze, fury, bleed, etc.) |
| Set bonus | 1 por familia | bonus2 + bonus4 (o bonus3 si solo 3 partes) |
| Quests story | 5 | Kill progresivo → boss final |
| Quests side | 3-4 | collect, essence, potion, equip_set |
| NPC | 1-2 | Rattlebones, Mercader, etc. |
| ZoneLvl | 1-5 | Sube con quests story (order = next zoneLvl) |
| Location en LOC | 1 entrada | Con enemies[], boss, interactPositions, npcPositions |

---

## 📐 Escalado de Dificultad por Zona

| Zona | LevelReq | ATK base enemigos | HP base enemigos | Boss HP |
|------|----------|--------------------|-------------------|---------|
| 🌲 Bosque | 1 | 5-10 | 50-90 | 150 |
| 💀 Catacumbas | 5 | 12-18 | 100-160 | 250 |
| 🏜️ Páramo | 10 | 20-28 | 180-280 | 400 |
| 🐊 Ciénaga | 15 | 28-38 | 260-400 | 550 |
| 🌋 Volcán | 20 | 38-50 | 380-550 | 750 |
| 👑 Trono | 25 | 50-65 | 550-750 | 1000 |

---

## ⚙️ Reglas Fijas de Combat System

### Nivel del Enemigo
- **Regular**: random entre 1 y `zoneLvl`
- **Boss**: siempre `zoneLvl + 1`
- `enemyLevel = isBoss ? Math.min(zoneLvl + 1, 6) : Math.floor(Math.random() * zoneLvl) + 1`

### Scaling por Nivel
- **+15% HP/ATK** por nivel de enemigo
- `lvlMult = 1 + (enemyLevel - 1) * 0.15`

### Scaling por Bestiary (kills)
- **+10% HP/ATK** por kill acumulado
- **Cap x2.0** (máximo 10 kills cuentan)
- `bestMult = 1 + Math.min(kills * 0.1, 1.0)`

### Skill Damage (ENEMIGO)
- Usa el **ATK completo escalado** (con level + bestiary)
- `atkScale = enemyData.attack / 10`
- `skillDmg = skillRef.damage > 0 ? Math.floor(skillRef.damage * atkScale) : baseAtk`
- Esto asegura que la dificultad SUBE de verdad, no solo más HP

### Recompensas por Nivel
- **+20% shards/exp** por nivel de enemigo
- `rewardMult = 1 + (enemyLevel - 1) * 0.2`

### Anti-Farm
- Si `player.level >= enemyLevel` → exp = 0

---

## 🌟 Master Skills — Sistema

### Trigger
- Turnos 3, 7, 11, 15... (cada 4 turnos, empezando en 3)
- `turn >= 3 && turn % 4 === 3`
- **65% probabilidad** de aparecer en turnos elegibles

### Mecánicas Disponibles
| Tipo | Propiedad | Efecto | Ejemplo |
|------|-----------|--------|---------|
| Multi-hit | `multi: N` | N golpes, segundos a 50% | Horda Trasga (2x), Lluvia Huesos (3x) |
| Steal | `steal: N` | Roba N shards | Trampa Sucia |
| Freeze | `freeze: true` | Skip turno del jugador | Decreto Real, Mirada Dominante |
| Fury | `fury: true` | +50% daño 2 turnos | Furia Bestial |
| Bleed | `bleed: N` | N daño/turno por 3 turnos | Sangre Tóxica |
| Debuff | `debuff: N` | -30% daño jugador 2 turnos | (combinado con steal) |

### Display
- Icono: 🌟
- Borde dorado + glow
- Nombre con prefijo ★

---

## 🛡️ Sistema de Escudos Enemigos

Cuando el enemigo usa skill de defensa (`intentCategory === "defend"`):
- Se aplica `enemyShield: true` + `enemyShieldValue` (0.3 o 0.4)
- Reduce daño del jugador: `dmg = dmg * (1 - shieldValue)`
- Se resetea al final del turno del jugador
- Skills con heal también curan al enemigo
- Skills con fury también aplican buff

---

## ❄️ Sistema de Freeze (Stun)

1. Enemigo usa skill con `freeze: true`
2. Se aplica `playerFrozen: true`
3. Se muestra "Barnaby está paralizado"
4. Enemigo obtiene turno extra inmediatamente
5. Se calcula NUEVA intención y se pasa como `overrideIntent` a `enemyTurn()`
6. Al terminar el turno extra, se resetea `playerFrozen`
7. **Importante**: `enemyTurn` acepta `overrideIntent` para evitar stale state

---

## 🎨 Estructura de Datos por Enemigo

```typescript
// ENM (Enemy Database)
"Nombre Enemigo": {
  hp: number,           // Base HP (ver tabla escalado)
  attack: number,       // Base ATK (ver tabla escalado)
  reward: { shards, exp, essence? },
  emoji: string,
  archetype: "brute"|"agile"|"magic"|"tank"|"beast",
  lootChance: 0.15-0.35,
  possibleLoot: [{ item: "Nombre Parte", rarity }],
  intentPattern: ["skill1", "skill2", ...],  // Todas las skills de partes
  masterSkill: "🌟 Nombre Master",
  speed?: number,        // Para determinar quién ataca primero
  parts: [
    { name: "Nombre Parte", skill: "Skill ID" }
  ]
}
```

```typescript
// TDB (Technique Database) — Skills de enemigo
"emoji Nombre Skill": {
  cost: 0,              // Enemigos no pagan coste
  damage: number,
  heal: number,
  emoji: string,
  name: string,
  levelReq: 1,
  damageRange: string,
  type: "basic"|"bleed"|"steal"|"magic"|"defense"|"ultimate",
  desc: string,
  icon: "/game/skills/skill-nombre.png",
  // Efectos especiales (opcionales):
  bleed?: number,
  debuff?: number,
  shield?: number,
  fury?: boolean,
  multi?: number,
  freeze?: boolean,
  armorPen?: number,
  lifesteal?: number,
  steal?: number,
}
```

```typescript
// EDB (Equipment Database) — Partes de enemigo
"Nombre Parte": {
  slot: "head"|"torso"|"arms"|"legs",
  stats: { attack?, defense?, speed?, crit? },
  emoji: string,
  desc: string,
  rarity: "comun"|"raro"|"epico"|"legendario",
  maxPutrefaccion: 20-50,  // comun=20, raro=30-35, legendario=50
  set: "Nombre Set",
  skillIds: ["Skill ID"],
  icon: "/game/parts/part-slot-enemigo.png"
}
```

```typescript
// SETS — Bonus de set
"Nombre Set": {
  name: "Nombre Bonito",
  bonus2: { stats: { ... }, desc: "..." },
  bonus4: { stats: { ... }, desc: "...", effect?: "Nombre" }
  // o bonus3 si solo hay 3 partes
}
```

---

## 🗺️ Orden de Implementación por Zona (Visual-First)

> Lo que el jugador VE primero, se crea primero. De afuera hacia adentro.

### FASE 1 — La Zona (lo primero que ve el jugador)
1. Crear **Location** en `LOC` (nombre, levelReq, description, comedyLine, mapPosition)
2. Generar **Background** de la zona (`/game/locations/zona-bg.png`)
3. Crear **Botones de interacción** con iconos — **REGLA OBLIGATORIA: circular estilizado** (ver abajo):
   - Explorar: `/game/locations/zona-explorar.png`
   - Jefe: `/game/locations/zona-jefe.png`
   - Mazmorra: `/game/locations/zona-mazmorra.png`
   - Viajar: `/game/locations/zona-viajar.png`
4. Crear **NPCs** con iconos y posiciones (`npcPositions`, `npcIcons`) — **REGLA OBLIGATORIA: circular estilizado** (ver abajo)
5. Definir `interactPositions` (dónde aparecen los botones en el bg)

### FASE 2 — Los Enemigos (lo segundo que ve al explorar)
6. Diseñar 4-5 enemigos (nombre, emoji, archetype, tema visual)
7. Generar **imágenes de enemigos** (`/game/enemies/enemy-nombre.png`)
8. Crear enemigos en **ENM** (hp, attack, reward, lootChance, possibleLoot, archetype, speed)
9. Crear **boss** con imagen propia (`/game/enemies/enemy-boss.png`)
10. Registrar boss en **LOC** (boss data + loot + intentPattern + masterSkill)

### FASE 3 — Las Partes (lo que obtiene al matar)
11. Diseñar partes por enemigo (2-4 slots: head, torso, arms, legs)
12. Generar **iconos de partes** (`/game/parts/part-slot-enemigo.png`)
13. Crear partes en **EDB** (slot, stats, rarity, maxPutrefaccion, set, skillIds, icon)
14. Crear **set bonuses** en **SETS** (bonus2, bonus3 o bonus4)

### FASE 4 — Las Skills (lo que hacen las partes)
15. Diseñar skills por parte + 1 master skill por enemigo
16. Generar **iconos de skills** (`/game/skills/skill-nombre.png`) — **REGLA OBLIGATORIA: marco circular** (ver abajo)
17. Crear skills en **TDB** (damage, type, efectos especiales, icon)
18. Vincular: ENM.intentPattern ← skills de partes, ENM.masterSkill ← skill master
19. Vincular: EDB.skillIds ← skill de esa parte

### FASE 5 — Contenido de Progresión
20. Crear **Quests story** en **QST** (5 quests: kill progresivo → boss)
21. Crear **Quests side** en **QST** (3-4: collect, essence, potion, equip_set)
22. Desbloquear zona en `unlockedLocations` (via quest o nivel)

### FASE 6 — Vinculación Global
23. Conectar iconos al **Bestiario** (enemy images + drop list)
24. Conectar partes al **Inventario** (icon display, putrefacción)
25. Conectar skills al **Sistema de Combate** (player + enemy)
26. Conectar sets al **Panel de Personaje** (active set bonuses)
27. Testear combate contra cada enemigo (verificar balance)

---

### 📁 Estructura de Archivos por Zona

```
public/game/
├── locations/
│   ├── zona-bg.png              ← Background
│   ├── zona-explorar.png        ← Botón explorar
│   ├── zona-jefe.png            ← Botón jefe
│   ├── zona-mazmorra.png        ← Botón mazmorra
│   └── zona-viajar.png          ← Botón viajar
├── enemies/
│   ├── enemy-enemigo1.png       ← Imagen combate
│   ├── enemy-enemigo2.png
│   └── enemy-boss.png
├── parts/
│   ├── part-cabeza-enemigo1.png ← Icono parte
│   ├── part-torso-enemigo1.png
│   ├── part-brazos-enemigo1.png
│   └── part-piernas-enemigo1.png
├── skills/
│   ├── skill-skill1.png         ← Icono skill
│   ├── skill-skill2.png
│   └── skill-master-enemigo1.png
└── npcs/
    └── npc-nombre.png           ← Icono NPC
```

---

## 🎯 REGLA OBLIGATORIA: Iconos de Skills con Marco Circular

> **Todas las skills DEBEN cumplir DOS reglas visuales:**
> 1. **Marco circular sólido** — borde grueso oscuro, arte dentro del círculo, esquinas negras
> 2. **Sin texto** — cero letras, palabras, números o caracteres de ningún idioma
>
> Estas reglas son innegociables. Todo icono de skill que no las cumpla debe ser regenerado.

### Especificación del Patrón

| Elemento | Regla |
|----------|-------|
| **Forma** | Círculo perfecto centrado en canvas cuadrado (1024×1024) |
| **Borde** | Anillo circular visible, grosor 2-4px, color oscuro (negro/gris oscuro) |
| **Esquinas** | Zona fuera del círculo = negro sólido (0,0,0) |
| **Radio del arte** | ~88-90% del half-size (~450px en 1024×1024) |
| **Fondo interior** | Oscuro con textura sutil (negro, marrón oscuro, gris oscuro) |
| **Sujeto** | Centrado, dinámico, iluminación dramática |
| **Efectos** | Chispas, humo, brillos o partículas que refuercen la acción |
| **Estilo** | Ilustración digital estilizada, alto contraste |
| **Texto** | PROHIBIDO — cero texto, letras, números, kanji, caracteres de cualquier idioma |
| **Formato** | PNG 1024×1024, RGBA (con transparencia opcional) |

### Ejemplos de Referencia (buenos)
- `skill-cabezazo-barnaby.png` — Marco circular con cráneo y explosión
- `skill-golpe-hacha.png` — Hacha con chispas en marco circular
- `skill-mordisco-venenoso.png` — Serpiente con baba tóxica en marco circular
- `skill-cornada-salvaje.png` — Jabalí con chispas en marco circular
- `skill-puno-oseo.png` — Puño óseo con impacto en marco circular
- `skill-rafaga-osea.png` — Fragmentos óseos en marco circular
- `skill-sangre-toxica.png` — Veneno verde en marco circular

### Anti-patrones (LO QUE NO SE DEBE HACER)
- ❌ Marco rectangular o cuadrado (ej: la vieja `skill-cornada-salvaje.png`)
- ❌ Viñeta/gradiente oscuro sin borde circular sólido (ej: la vieja `skill-puno-oseo.png`)
- ❌ Diseño decorativo sin anillo circular (ej: la vieja `skill-rafaga-osea.png`)
- ❌ Texto de cualquier tipo dentro del icono (ej: las viejas `skill-lluvia-de-huesos.png`, `skill-sangre-toxica.png`, `skill-trampa-sucia.png`, `skill-golpe-bajo.png`)
- ❌ Arte que ocupa todo el canvas sin círculo
- ❌ Fondo blanco o claro en esquinas
- ❌ Estilo realista vintage (debe ser ilustración estilizada)

### Checklist de Verificación (para cada nuevo icono)
- [ ] ¿Tiene un borde circular grueso y oscuro visible?
- [ ] ¿Las esquinas fuera del círculo son negras sólidas?
- [ ] ¿El arte está contenido dentro del círculo?
- [ ] ¿No hay NINGÚN texto, letra o número?
- [ ] ¿El sujeto es dinámico con iluminación dramática?
- [ ] ¿Tiene efectos secundarios (chispas, humo, brillos)?
- [ ] ¿Es 1024×1024 PNG?

### Pipeline de Generación (con IA)
1. **Generar** con `z-ai-generate` usando prompt que incluya:
   - `"circular framed"` / `"dark border ring"` / `"black corners"`
   - `"NO TEXT NO LETTERS NO WORDS"` (repetir para reforzar)
   - Descripción del sujeto basada en `TDB[skillId].desc`
2. **Post-procesar** con Python/Pillow (circle from EDGE, NO margin):
   ```python
   from PIL import Image, ImageDraw, ImageFilter
   img = Image.open(src).convert('RGBA')
   w, h = img.size; cx, cy = w//2, h//2
   radius = int(min(w,h)//2 - 1)  # Circle starts 1px from edge
   mask = Image.new('L', (w, h), 0)
   ImageDraw.Draw(mask).ellipse([cx-radius, cy-radius, cx+radius, cy+radius], fill=255)
   mask = mask.filter(ImageFilter.GaussianBlur(radius=1))
   # Black background fills corners from pixel 0 (no gaps)
   result = Image.new('RGBA', (w, h), (0, 0, 0, 255))
   result.paste(img, (0, 0), mask)
   # Dark circular border ring at edge
   draw = ImageDraw.Draw(result)
   for i in range(4):
       r = 1 + i
       draw.ellipse([r, r, w-r, h-r], outline=(30,28,25,255), width=1)
   # Inner subtle ring
   draw.ellipse([6, 6, w-6, h-6], outline=(50,45,38,200), width=2)
   result.save(dst, 'PNG')
   ```
4. **Comprimir** con `compress_to_limit()` (ver regla de 200KB) — verificar que el archivo final ≤ 200KB
5. **Verificar** con VLM: confirmar marco circular + sin texto

### Historial de Correcciones
| Fecha | Skill | Problema | Acción |
|-------|-------|----------|--------|
| 2026-05-16 | skill-cornada-salvaje | Marco rectangular ornamental | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-puno-oseo | Viñeta sin borde circular | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-rafaga-osea | Diseño azul sin borde circular | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-lluvia-de-huesos | Texto "Lluvia de Huesos" | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-sangre-toxica | Texto "Sangre Toxica" | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-trampa-sucia | Texto "Trampa-Sucia" | Regenerada con IA + post-proceso |
| 2026-05-16 | skill-golpe-bajo | Texto japonés "弱点攻撃" | Regenerada con IA + post-proceso |

---

## 🎯 REGLA OBLIGATORIA: Iconos de NPCs — Circular Estilizado

> **Todos los NPCs DEBEN seguir el mismo patrón visual circular estilizado.** La consistencia entre NPCs es innegociable — el jugador debe reconocer instantáneamente que un icono es un NPC por su estilo.

### Especificación del Patrón

| Elemento | Regla |
|----------|-------|
| **Forma** | Círculo perfecto centrado en canvas cuadrado (1024×1024) |
| **Borde** | Borde circular fino y limpio, uniforme, sin ornamentos |
| **Esquinas** | Zona fuera del círculo = pergamino envejecido o textura vintage |
| **Fondo interior** | Oscuro y atmosférico, complementa el rol del NPC (fuego=forja, niebla=maga, bosque=viajero) |
| **Sujeto** | Personaje centrado, busto o cuerpo completo, con **prop temático** (martillo, orbe, mapa, etc.) |
| **Estilo** | Ilustración detallada y pintoresca, equilibrio entre realismo y fantasía |
| **Iluminación** | Dramática y direccional, refuerza el rol del NPC |
| **Composición** | Simétrica, personaje central con prop, espacio negativo equilibrado |
| **Texto** | PROHIBIDO — cero texto, letras o números |
| **Formato** | PNG 1024×1024, RGB |

### Ejemplos de Referencia (buenos)
- `npc-herrero.png` — Forja con fuego, martillo, iluminación cálida
- `npc-morgana.png` — Orbe mágico, niebla, iluminación fría
- `npc-viajero.png` — Mapa, bosque, iluminación natural
- `npc-mercader.png` — Monedas, goods, iluminación dorada
- `npc-tabernero.png` — Jarra, interior taberna, iluminación ámbar
- `npc-rattlebones.png` — Pose de baile, estilo esquelético

### Anti-patrones
- ❌ Marco rectangular o bordes ornamentales
- ❌ Estilo cartoon simple (debe ser pintoresco/detallado)
- ❌ Sin prop temático (cada NPC debe sostener/interactuar con un objeto de su rol)
- ❌ Fondo interior genérico sin relación con el rol
- ❌ Texto de cualquier tipo

### Checklist de Verificación
- [ ] ¿Marco circular con borde fino?
- [ ] ¿Fondo exterior estilo pergamino/textura vintage?
- [ ] ¿Fondo interior atmosférico relacionado con el rol?
- [ ] ¿Personaje central con prop temático?
- [ ] ¿Iluminación dramática direccional?
- [ ] ¿Sin texto?
- [ ] ¿1024×1024 PNG?

### Pipeline de Generación
1. **Generar** con `z-ai-generate`:
   - `"circular framed NPC portrait"` / `"thin clean circular border"` / `"parchment background corners"`
   - `"dark atmospheric inner background"` / `"character with [prop]"` / `"NO TEXT"`
   - Descripción del rol basada en el diálogo/NPC_INFO del juego
2. **Post-procesar** con Python/Pillow: enmascarar a círculo, aplicar borde fino
3. **Comprimir** con `compress_to_limit()` (ver regla de 200KB) — verificar que el archivo final ≤ 200KB
4. **Verificar** con VLM: confirmar marco circular + prop temático + sin texto

---

## 🎯 REGLA OBLIGATORIA: Botones de Zona — Circular Estilizado

> **Todos los botones de acción de zona (explorar, jefe, mazmorra, viajar) DEBEN seguir el mismo patrón visual circular estilizado.** El jugador debe distinguir los botones de acción por su símbolo interior, no por diferencias de forma o estilo.

### Especificación del Patrón

| Elemento | Regla |
|----------|-------|
| **Forma** | Círculo perfecto centrado en canvas cuadrado (1024×1024) |
| **Borde** | Borde doble: línea exterior clara (beige/crema) + línea interior oscura (marrón), estilo vintage |
| **Esquinas** | Zona fuera del círculo = color neutro oscuro o transparente |
| **Fondo interior** | Tonos tierra cálidos (marrón, sepia) con textura vintage (piedra, pergamino, mapa) |
| **Sujeto** | Símbolo central que comunica la acción claramente |
| **Estilo** | Ilustración estilizada, lineas limpias, colores planos con sombreado sutil |
| **Iluminación** | Sutil y deliberada — refuerza el tema (misterio=mazmorra, exploración=viajar) |
| **Composición** | Simétrica y equilibrada, símbolo central focal, elementos secundarios armónicos |
| **Texto** | PROHIBIDO — cero texto, letras o números (el símbolo comunica la acción) |
| **Formato** | PNG 1024×1024, RGB |

### Símbolos por Acción
| Acción | Símbolo Central | Elementos Secundarios |
|--------|----------------|----------------------|
| **Explorar** | Calavera/antorcha/espada | Hojas, niebla, huellas |
| **Jefe** | Corona/calavera con corona | Espadas cruzadas, estandarte |
| **Mazmorra** | Arco de mazmorra/calavera en cueva | Huesos, piedras, sombras |
| **Viajar** | Brújula/rosa de los vientos | Líneas de mapa, pergamino |

### Ejemplos de Referencia (buenos)
- `forest-mazmorra.png` — Arco de mazmorra con calavera, borde doble, textura piedra
- `forest-viajar.png` — Brújula con mapa, borde doble, textura pergamino

### Anti-patrones
- ❌ Marco rectangular con bordes desgarrados (ej: las viejas `forest-explorar.png`, `forest-jefe.png`)
- ❌ Estilo pintoresco realista (debe ser estilizado, lineas limpias)
- ❌ Texto de cualquier tipo
- ❌ Sin símbolo claro que comunique la acción
- ❌ Iluminación dramática excesiva (debe ser sutil)

### Checklist de Verificación
- [ ] ¿Marco circular con borde doble (claro+oscuro)?
- [ ] ¿Fondo interior con tonos tierra y textura vintage?
- [ ] ¿Símbolo central que comunica la acción sin texto?
- [ ] ¿Composición simétrica y equilibrada?
- [ ] ¿Estilo estilizado (no pintoresco realista)?
- [ ] ¿Sin texto?
- [ ] ¿1024×1024 PNG?

### Pipeline de Generación
1. **Generar** con `z-ai-generate`:
   - `"circular framed zone action button"` / `"double border outer light inner dark"` / `"vintage earth tones"`
   - `"stylized illustration clean linework"` / `"symmetrical composition"`
   - `"NO TEXT NO LETTERS"` + descripción del símbolo según la tabla arriba
2. **Post-procesar** con Python/Pillow: enmascarar a círculo, aplicar borde doble, rellenar esquinas con fondo oscuro opaco
3. **Comprimir** con `compress_to_limit()` (ver regla de 200KB) — verificar que el archivo final ≤ 200KB
4. **Verificar** con VLM: confirmar marco circular + símbolo claro + sin texto

---

## 🎯 REGLA OBLIGATORIA: Imágenes de Enemigos — Sin Texto

> **Todas las imágenes de enemigos (combate) DEBEN estar libres de texto.** La IA tiende a agregar nombres/títulos sobre la ilustración. Esto es inaceptable y debe verificarse siempre.

### Especificación

| Elemento | Regla |
|----------|-------|
| **Texto** | PROHIBIDO — cero letras, números, nombres, títulos, captions de cualquier idioma |
| **Sujeto** | Enemigo en pose dinámica, iluminación dramática |
| **Estilo** | Ilustración digital, alto contraste, dark fantasy |
| **Fondo** | Oscuro y atmosférico, relacionado con la zona del enemigo |
| **Formato** | PNG 1024×1024, RGB |

### Pipeline de Generación
1. **Generar** con `z-ai-generate`:
   - Describir al enemigo sin mencionar su nombre como texto
   - Siempre incluir: `"THIS IS A PURE ILLUSTRATION WITH ZERO TEXT. DO NOT ADD ANY WRITING TITLE NAME LABEL OR CAPTION. THE IMAGE MUST CONTAIN ONLY VISUAL ART NO LETTERS WHATSOEVER."`
   - Si la IA insiste con texto, regenerar con prompt más agresivo
2. **Comprimir** con `compress_to_limit()` (ver regla de 200KB) — verificar que el archivo final ≤ 200KB
3. **Verificar** con VLM: `"Does this image contain ANY text, letters, numbers, or characters? Answer YES or NO only."`
   - Si responde YES → regenerar hasta que responda NO

### Checklist de Verificación
- [ ] ¿No hay NINGÚN texto, letra o número?
- [ ] ¿El enemigo es reconocible visualmente?
- [ ] ¿Pose dinámica y iluminación dramática?
- [ ] ¿El archivo pesa ≤ 200KB?
- [ ] ¿1024×1024 PNG?

### Historial de Correcciones
| Fecha | Enemigo | Problema | Acción |
|-------|---------|----------|--------|
| 2026-05-16 | enemy-rattlebones.png | Texto "Battlebores the Dancing Spieeton" | Regenerada con prompt sin texto |
| 2026-05-16 | enemy-rattlebones.png | Texto "Rattlebomes the Dancing Skieeton" | Regenerada con prompt agresivo sin texto |

---

## 🎯 REGLA OBLIGATORIA: Cobertura de Arte por Categoría

> **Ningún icono debe tener márgenes vacíos innecesarios.** El arte debe llenar el espacio visual de forma intencional. Cada categoría tiene su propio umbral mínimo de cobertura.

### Umbrales por Categoría

| Categoría | Cobertura mínima | Cobertura ideal | Nota |
|-----------|-----------------|-----------------|------|
| **NPCs** | 99% | 99.9% | Arte llena todo el canvas, esquinas incluidas (fondo pergamino/textura) |
| **Botones de Zona** | 97% | 99%+ | Arte llena todo el canvas, esquinas con fondo oscuro opaco |
| **Skills** | 95% | 97%+ | Marco circular oscuro permitido, esquinas negras intencionales, SIN márgenes vacíos extra |

### Qué cuenta como "cobertura"
- **Cualquier pixel intencional** = arte, marco, fondo atmosférico, esquinas de círculo rellenas
- **Lo que NO cuenta** = márgenes negros/vacíos sin propósito (ej: 58px de margen oscuro uniforme por lado)

### Cómo medir
```python
from PIL import Image
import numpy as np

def measure_coverage(filepath):
    img = Image.open(filepath).convert('RGB')
    arr = np.array(img)
    brightness = arr.mean(axis=2)
    bright_mask = brightness > 40  # pixeles con contenido
    rows = np.where(bright_mask.any(axis=1))[0]
    cols = np.where(bright_mask.any(axis=0))[0]
    if len(rows) > 0:
        content_w = (cols[-1] - cols[0]) / arr.shape[1]
        content_h = (rows[-1] - rows[0]) / arr.shape[0]
        return min(content_w, content_h)
    return 0
```

### Anti-patrones de cobertura
- ❌ Márgenes oscuros uniformes >10px por lado sin propósito (ej: viejas `forest-explorar.png` con 58px por lado = 88.7% cobertura)
- ❌ Icono circular flotando con gran espacio vacío alrededor
- ❌ Esquinas transparentes (RGBA alpha=0) en NPCs y zone buttons — deben ser opacas

### Checklist de Cobertura (añadir a cada verificación)
- [ ] ¿La cobertura medida supera el umbral mínimo de la categoría?
- [ ] ¿No hay márgenes vacíos innecesarios?
- [ ] ¿Las esquinas son opacas (no transparentes) en NPCs y zone buttons?

### Valores Actuales (referencia)
| Archivo | Categoría | Cobertura | Estado |
|---------|-----------|-----------|--------|
| npc-herrero.png | NPC | 99.9% | ✅ |
| npc-mercader.png | NPC | 99.9% | ✅ |
| npc-morgana.png | NPC | 99.9% | ✅ |
| npc-rattlebones.png | NPC | 99.9% | ✅ |
| npc-tabernero.png | NPC | 99.9% | ✅ |
| npc-viajero.png | NPC | 99.9% | ✅ |
| forest-explorar.png | Zona | 99.2% | ✅ |
| forest-jefe.png | Zona | 99.2% | ✅ |
| forest-mazmorra.png | Zona | 97.9% | ✅ |
| forest-viajar.png | Zona | 99.9% | ✅ |
| skill-aura-necrotica.png | Skill | 98.8% | ✅ |
| skill-baston-espectral.png | Skill | 99.9% | ✅ |
| skill-cabezazo-barnaby.png | Skill | 99.9% | ✅ |
| skill-cadencia-mortal.png | Skill | 99.9% | ✅ |
| skill-cetro-de-hueso.png | Skill | 98.6% | ✅ |
| skill-cola-constrictora.png | Skill | 99.9% | ✅ |
| skill-cornada-salvaje.png | Skill | 98.8% | ✅ |
| skill-costillas-enrejadas.png | Skill | 98.8% | ✅ |
| skill-danza-fantasma.png | Skill | 99.1% | ✅ |
| skill-decreto-real.png | Skill | 99.8% | ✅ |
| skill-emboscada.png | Skill | 98.8% | ✅ |
| skill-furia-bestial.png | Skill | 99.8% | ✅ |
| skill-golpe-bajo.png | Skill | 98.8% | ✅ |
| skill-golpe-hacha.png | Skill | 99.9% | ✅ |
| skill-grito-bestial.png | Skill | 99.9% | ✅ |
| skill-horda-trasga.png | Skill | 99.8% | ✅ |
| skill-humo-sucio.png | Skill | 99.9% | ✅ |
| skill-lanzamiento-hueso.png | Skill | 99.9% | ✅ |
| skill-lluvia-de-huesos.png | Skill | 98.8% | ✅ |
| skill-marcha-imperial.png | Skill | 99.9% | ✅ |
| skill-mirada-dominante.png | Skill | 98.8% | ✅ |
| skill-mordisco-venenoso.png | Skill | 99.9% | ✅ |
| skill-paso-runico.png | Skill | 99.9% | ✅ |
| skill-paso-sismico.png | Skill | 99.9% | ✅ |
| skill-piel-brutal.png | Skill | 99.9% | ✅ |
| skill-pirueta-espectral.png | Skill | 99.9% | ✅ |
| skill-punalada-trampa.png | Skill | 99.9% | ✅ |
| skill-puno-oseo.png | Skill | 98.8% | ✅ |
| skill-rafaga-osea.png | Skill | 98.8% | ✅ |
| skill-retirada-tactica.png | Skill | 99.9% | ✅ |
| skill-ritmo-hipnotico.png | Skill | 97.9% | ✅ |
| skill-sangre-toxica.png | Skill | 98.8% | ✅ |
| skill-trampa-sucia.png | Skill | 98.8% | ✅ |
| skill-vista-aguila.png | Skill | 95.5% | ✅ |
| skill-voluntad-post-mortem.png | Skill | 99.9% | ✅ |
| skill-zarpazo-trasgo.png | Skill | 99.9% | ✅ |

### Historial de Correcciones de Cobertura
| Fecha | Archivo | Problema | Cobertura antes → después |
|-------|---------|----------|--------------------------|
| 2026-05-16 | forest-explorar.png | Márgenes vacíos 58px/lado | 88.7% → 99.2% |
| 2026-05-16 | forest-jefe.png | Márgenes vacíos 58px/lado | 88.7% → 99.2% |
| 2026-05-16 | skill-aura-necrotica.png | Márgenes vacíos 48px | 92.2% → 98.8% |
| 2026-05-16 | skill-cornada-salvaje.png | Márgenes vacíos 62px | 87.8% → 98.8% |
| 2026-05-16 | skill-costillas-enrejadas.png | Márgenes vacíos 40px | 92.2% → 98.8% |
| 2026-05-16 | skill-emboscada.png | Márgenes vacíos 82px | 86.4% → 98.8% |
| 2026-05-16 | skill-golpe-bajo.png | Márgenes vacíos 64px | 87.4% → 98.8% |
| 2026-05-16 | skill-lluvia-de-huesos.png | Márgenes vacíos 64px | 87.0% → 98.8% |
| 2026-05-16 | skill-mirada-dominante.png | Márgenes vacíos 43px | 92.0% → 98.8% |
| 2026-05-16 | skill-puno-oseo.png | Márgenes vacíos 60px | 87.9% → 98.8% |
| 2026-05-16 | skill-rafaga-osea.png | Márgenes vacíos 64px | 87.5% → 98.8% |
| 2026-05-16 | skill-sangre-toxica.png | Márgenes vacíos 64px | 87.6% → 98.8% |
| 2026-05-16 | skill-trampa-sucia.png | Márgenes vacíos 64px | 86.7% → 98.8% |

---

## 🎯 REGLA OBLIGATORIA: Tamaño Máximo de Imágenes — 200KB

> **Ninguna imagen del juego puede superar los 200KB (204,800 bytes).** Esto aplica a TODAS las categorías: skills, NPCs, zone buttons, enemies, parts, UI, backgrounds. Las imágenes grandes degradan el rendimiento de carga y consumo de memoria, especialmente en dispositivos móviles.

### Especificación

| Elemento | Regla |
|----------|-------|
| **Límite máximo** | 200KB (204,800 bytes) por archivo |
| **Aplica a** | TODAS las imágenes PNG en `public/game/` |
| **Categorías** | skills, npcs, locations, enemies, parts, ui — sin excepciones |
| **Formato** | PNG (no cambiar a JPG/WebP sin justificación) |

### Estrategias de Compresión (en orden de preferencia)

1. **Paleta de colores (quantize)** — Reducir a 256 colores con dithering. La mejor relación calidad/tamaño. Pierde matices sutiles pero visualmente casi imperceptible.
2. **Optimización PNG** — Re-guardar con `optimize=True`. Rara vez suficiente por sí sola.
3. **Redimensionar** — Si la paleta no basta, reducir resolución manteniendo aspecto (ej: 1024→768, 1024→512). Último recurso para imágenes muy grandes.
4. **Menos colores** — Si ni con 256 colores + resize basta, reducir a 128 o 64 colores.

### Pipeline de Compresión (automatizable)

```python
from PIL import Image
import os

MAX_SIZE = 200 * 1024  # 200KB

def compress_to_limit(filepath):
    """Comprime una imagen PNG para que no supere MAX_SIZE bytes."""
    if os.path.getsize(filepath) <= MAX_SIZE:
        return True  # Ya cumple
    
    img = Image.open(filepath).convert('RGBA')
    
    # 1. Intentar paleta RGBA (Fast Octree)
    try:
        pal = img.quantize(colors=256, method=2)
        buf = io.BytesIO()
        pal.save(buf, format='PNG', optimize=True)
        if buf.tell() <= MAX_SIZE:
            with open(filepath, 'wb') as f:
                f.write(buf.getvalue())
            return True
    except:
        pass
    
    # 2. Intentar paleta RGB (si alpha mayormente opaco)
    import numpy as np
    alpha = np.array(img.split()[3])
    if (alpha > 250).sum() / alpha.size > 0.90:
        rgb = img.convert('RGB')
        pal = rgb.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
        buf = io.BytesIO()
        pal.save(buf, format='PNG', optimize=True)
        if buf.tell() <= MAX_SIZE:
            with open(filepath, 'wb') as f:
                f.write(buf.getvalue())
            return True
    
    # 3. Redimensionar progresivamente + paleta
    for scale in [0.9, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4]:
        nw = max(64, int(img.width * scale))
        nh = max(64, int(img.height * scale))
        resized = img.resize((nw, nh), Image.LANCZOS)
        try:
            pal = resized.quantize(colors=256, method=2)
            buf = io.BytesIO()
            pal.save(buf, format='PNG', optimize=True)
            if buf.tell() <= MAX_SIZE:
                with open(filepath, 'wb') as f:
                    f.write(buf.getvalue())
                return True
        except:
            pass
    
    return False  # No se pudo comprimir
```

### Regla para Generación con IA

Cuando se genera una imagen con `z-ai-generate`:
1. Generar en tamaño original (1024×1024)
2. Aplicar post-procesamiento según la categoría (marco circular, bordes, etc.)
3. **Ejecutar compresión** con `compress_to_limit()` antes de guardar la versión final
4. Verificar que el tamaño final ≤ 200KB

### Checklist de Tamaño (añadir a cada verificación)
- [ ] ¿El archivo pesa ≤ 200KB?
- [ ] ¿La calidad visual es aceptable tras compresión?
- [ ] ¿Se usó paleta de colores como primera estrategia?

### Historial de Compresión
| Fecha | Categoría | Imágenes afectadas | Estrategia principal |
|-------|-----------|-------------------|---------------------|
| 2026-05-17 | Skills | 33 imágenes (400KB–1.6MB → <200KB) | Paleta RGBA 256 colores + resize 0.7-0.9x |
| 2026-05-17 | Locations | 7 imágenes (215KB–1.5MB → <200KB) | Paleta RGBA 256 colores + resize 0.6-0.8x |
| 2026-05-17 | NPCs | 1 imagen (1.2MB → <200KB) | Paleta RGBA 256 colores + resize 0.8x |

---

## 🎯 REGLA OBLIGATORIA: Rebuild Standalone Después de Agregar Assets

> **Después de agregar cualquier archivo a `public/` (imágenes, sonidos, etc.), DEBES reconstruir el standalone de Next.js.** El servidor de producción sirve archivos desde `.next/standalone/public/`, que es una copia del momento del build. Los archivos nuevos en `public/` NO se reflejan automáticamente.

### Especificación

| Elemento | Regla |
|----------|-------|
| **Trigger** | Cualquier archivo nuevo o modificado en `public/` |
| **Acción requerida** | Rebuild + copy de assets al standalone |
| **Razón** | `.next/standalone/public/` es una copia estática del build, no un symlink |

### Pipeline Después de Agregar Assets

```bash
# 1. Rebuild
npm run build

# 2. Copiar assets al standalone
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 3. Reiniciar servidor
# (matar proceso anterior y levantar de nuevo)
```

### Verificación Obligatoria

Después del rebuild, verificar que los assets nuevos son accesibles:

```bash
# Ejemplo: verificar que una imagen de part carga
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/game/parts/part-cabeza-esqueleto-guerrero.png"
# Debe devolver 200, no 404
```

### Checklist Post-Asset (añadir a cada verificación)
- [ ] ¿Se ejecutó `npm run build`?
- [ ] ¿Se copiaron `.next/static` y `public` a `.next/standalone/`?
- [ ] ¿Se reinició el servidor?
- [ ] ¿Los assets nuevos devuelven HTTP 200?

### Historial de Issues
| Fecha | Problema | Causa | Acción |
|-------|----------|-------|--------|
| 2026-05-17 | Icons de parts de Catacumbas no cargaban (404) | Build hecho antes de crear los PNG | Rebuild + cp de assets al standalone |
