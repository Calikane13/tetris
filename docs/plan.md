# Plan técnico — Bloques v1

> Este documento describe **cómo** se construye lo que define `spec.md`.
> Si algo de aquí contradice `constitution.md`, manda la constitución.

Versión: 1.0

---

## 1. Pila tecnológica

| Pieza | Elección | Nota |
|---|---|---|
| Lenguaje | TypeScript en modo `strict` | |
| Interfaz | React 18 | |
| Empaquetador | Vite | plantilla `react-ts` |
| Estilos | Tailwind CSS | |
| Estado | Zustand | dos stores: partida y ajustes |
| Sonido | Web Audio API nativa | sin archivos de audio ni librerías |
| Persistencia | `localStorage` | |
| Despliegue | Netlify | build `npm run build`, carpeta `dist` |

Dependencias de producción: `react`, `react-dom`, `zustand`. Nada más.

---

## 2. Arquitectura en tres capas

El proyecto se organiza en tres capas con una dirección de dependencia estricta.
Cada capa solo puede importar de la que tiene debajo:

```
  UI  (React)          components/, hooks/
   ↓
  Estado (Zustand)     store/
   ↓
  Motor (puro)         engine/
```

**Motor.** Funciones puras, sin estado propio y sin conocimiento del navegador.
Reciben un estado y devuelven uno nuevo. Nunca modifican sus argumentos.

**Estado.** Guarda el estado actual de la partida y expone acciones. Su trabajo
es llamar al motor y guardar el resultado. No contiene reglas del juego: si una
función del store empieza a comprobar colisiones, esa lógica está en el sitio
equivocado.

**Interfaz.** Lee del store y pinta. Recoge la entrada del usuario y despacha
acciones. No calcula nada del juego, ni siquiera la posición del fantasma.

Ventaja concreta: el motor se puede probar desde la consola del navegador, y las
reglas se pueden cambiar sin abrir un solo componente.

---

## 3. Estructura de archivos

```
bloques/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml
└── src/
    ├── main.tsx
    ├── index.css
    ├── engine/
    │   ├── types.ts          tipos compartidos de todo el juego
    │   ├── constants.ts      dimensiones, tiempos, puntuaciones, colores
    │   ├── tetrominoes.ts    formas de las 7 piezas y sus rotaciones
    │   ├── board.ts          tablero: crear, colisionar, fijar, limpiar líneas
    │   ├── piece.ts          mover, rotar, calcular fantasma, generar aleatoria
    │   ├── scoring.ts        puntos, nivel, velocidad de caída
    │   └── game.ts           transiciones de alto nivel del estado de partida
    ├── store/
    │   ├── useGameStore.ts   estado de la partida y acciones
    │   └── useSettingsStore.ts   ajustes persistentes
    ├── lib/
    │   ├── storage.ts        lectura y escritura validada en localStorage
    │   └── sound.ts          efectos de sonido con Web Audio
    ├── hooks/
    │   ├── useGameLoop.ts    bucle de animación con acumulador de tiempo
    │   ├── useKeyboard.ts    teclado, con repetición mantenida
    │   └── useAutoSave.ts    guardado automático de la partida
    └── components/
        ├── App.tsx           enruta entre menú, juego, pausa y fin
        ├── Menu.tsx
        ├── Game.tsx          composición de la pantalla de juego
        ├── Board.tsx         rejilla de 200 celdas
        ├── Cell.tsx
        ├── NextPiece.tsx
        ├── Hud.tsx           puntuación, líneas, nivel, récord
        ├── TouchControls.tsx
        ├── Overlay.tsx       capa de pausa y de fin de partida
        └── Settings.tsx
```

---

## 4. Modelo de datos

Definido en `engine/types.ts`. Es la referencia para todo lo demás.

```ts
// Las siete piezas.
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Una celda vacía es null; una ocupada guarda el tipo de pieza que la llenó,
// lo que permite deducir su color sin guardarlo aparte.
export type Cell = PieceType | null;

// El tablero es una matriz de 20 filas por 10 columnas: board[fila][columna].
export type Board = Cell[][];

// Rotación: 0 = inicial, y se avanza en sentido horario.
export type Rotation = 0 | 1 | 2 | 3;

export interface ActivePiece {
  type: PieceType;
  rotation: Rotation;
  row: number;     // fila de la esquina superior izquierda de su matriz
  col: number;     // columna de la esquina superior izquierda de su matriz
}

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export interface GameState {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
}
```

Cada pieza se representa como una matriz cuadrada de ceros y unos, con una
entrada por cada una de las cuatro rotaciones. La I y la O usan matrices de 4×4;
el resto, de 3×3. Guardar las cuatro rotaciones precalculadas evita tener que
rotar matrices en tiempo de ejecución y hace las formas fáciles de leer y
corregir a ojo.

---

## 5. Decisiones técnicas

### 5.1 El tablero se pinta con DOM, no con canvas

Se renderizan 200 elementos con CSS Grid.

*Por qué:* con `<canvas>` habría que gestionar a mano el escalado, el redibujado
y la accesibilidad. Con DOM, Tailwind da los estilos y React se encarga del
resto. 200 nodos es una cantidad perfectamente asumible para React a 60 fps
siempre que las celdas estén memorizadas.

*Riesgo asumido:* si en un móvil antiguo hubiera tirones, la mitigación es
memorizar `Cell` con `React.memo` y comparar por valor. Solo si eso no bastara se
replantearía el canvas.

### 5.2 El fantasma no se guarda en el estado

Se calcula al vuelo a partir de la pieza activa y del tablero, cada vez que se
pinta. Es un cálculo trivial (bajar hasta colisionar) y guardarlo obligaría a
recordar actualizarlo en cinco sitios distintos. Estado derivado no se almacena.

### 5.3 La pieza activa no se escribe en el tablero hasta que se fija

El tablero contiene únicamente celdas fijadas. Al pintar, se superponen encima la
pieza activa y su fantasma. Así, deshacer un movimiento inválido no requiere
limpiar nada del tablero.

### 5.4 Bucle de juego con acumulador de tiempo

`useGameLoop` usa `requestAnimationFrame` y acumula el tiempo transcurrido entre
fotogramas. Cuando el acumulado supera el intervalo de caída del nivel actual, se
descuenta ese intervalo y se baja la pieza una celda. Si la pestaña ha estado
oculta y el salto de tiempo es enorme, se limita el delta a 100 ms para evitar
que la pieza caiga diez filas de golpe al volver.

Esto cumple el principio P8: la velocidad va atada al reloj, no a los fotogramas.

### 5.5 Repetición de teclas gestionada a mano

No se usa la autorrepetición del sistema operativo, porque su retardo depende de
la configuración de cada usuario y hace que el juego se sienta distinto en cada
máquina. `useKeyboard` mantiene un conjunto de teclas pulsadas y aplica los
tiempos fijos de la regla R13 (170 ms y 50 ms). Los botones táctiles reutilizan
exactamente la misma lógica.

### 5.6 Dos stores separados

`useGameStore` se reinicia con cada partida. `useSettingsStore` sobrevive a las
partidas y se sincroniza con `localStorage` en cada cambio. Separarlos evita
tener que filtrar qué campos persisten y cuáles no.

### 5.7 Persistencia con versión y validación

`storage.ts` expone funciones tipadas con esta forma:

```ts
loadHighScore(): number
saveHighScore(value: number): void
loadSavedGame(): GameState | null
saveGame(state: GameState): void
clearSavedGame(): void
loadSettings(): Settings
saveSettings(settings: Settings): void
```

Cada valor se guarda envuelto: `{ version: 1, data: ... }`. Al leer, se
comprueban la versión y la forma del dato. Cualquier fallo (JSON inválido,
versión distinta, campo ausente) devuelve el valor por defecto sin lanzar
excepciones. Toda llamada a `localStorage` va dentro de `try/catch`, porque en
modo privado de algunos navegadores puede fallar.

Claves: `bloques.highScore`, `bloques.savedGame`, `bloques.settings`.

### 5.8 Sonido sin archivos

`sound.ts` genera tonos cortos con un `OscillatorNode` de la Web Audio API: un
clic agudo al rotar, uno grave al fijar, un tono ascendente al limpiar líneas y
uno descendente al perder. Evita añadir archivos binarios al repositorio y
respeta la lista blanca de dependencias.

El `AudioContext` se crea de forma perezosa, en la primera interacción real del
usuario, porque los navegadores bloquean el audio hasta que la hay.

### 5.9 Estilos

Tailwind, con los colores de las piezas definidos como constantes en
`constants.ts` y aplicados mediante clases completas. **No se construyen nombres
de clase concatenando cadenas** (`bg-${color}-500` no funciona), porque Tailwind
analiza el código de forma estática y esas clases no llegarían a generarse. Se
usa un objeto que mapea cada tipo de pieza a su clase literal.

El tablero se dimensiona con unidades relativas al ancho disponible para que
quepa entero desde 320 px sin barras de desplazamiento.

---

## 6. Alternativas descartadas

| Alternativa | Motivo del descarte |
|---|---|
| Rotación SRS con tablas de *wall kicks* | Es la parte más compleja de un Tetris moderno y no aporta a un primer proyecto. La regla R18 cubre el 90 % de las situaciones incómodas. |
| Generador de bolsa de 7 | Reparto más justo, pero el spec pide comportamiento clásico. Se puede cambiar más adelante tocando una sola función. |
| Renderizado en `<canvas>` | Más rendimiento del necesario a cambio de mucha más complejidad. |
| `useState` en vez de Zustand | El estado lo comparten muchos componentes y habría que pasarlo por props hasta abajo. |
| Reducer con `useReducer` | Válido, pero el proyecto anterior ya usa Zustand y conviene mantener la continuidad. |
| Tests con Vitest | Fuera de alcance de la v1. El motor está diseñado para que añadirlos después sea trivial. |
| Guardar la partida en cada fotograma | Escrituras constantes en `localStorage` sin ninguna ventaja. Se guarda en los momentos de la regla P4. |

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Las formas de las piezas quedan mal en alguna rotación | Alta | Se revisan visualmente una por una en la tarea T09, antes de seguir. |
| El juego va a distinta velocidad en pantallas de 120 Hz | Media | Acumulador de tiempo (5.4). Se comprueba explícitamente. |
| Tirones al pintar 200 celdas en móvil | Media | `React.memo` en `Cell`; medir antes de optimizar más. |
| Los botones táctiles disparan zoom o selección | Media | `touch-action: manipulation`, `user-select: none` y `preventDefault` en los eventos táctiles. |
| Estado guardado incompatible tras un cambio de formato | Baja | Número de versión en cada valor guardado (5.7). |
| El audio no suena en iOS | Media | `AudioContext` creado tras la primera interacción del usuario. |

---

## 8. Orden de construcción

Ocho fases, detalladas en `tasks.md`:

| Fase | Contenido | Resultado visible |
|---|---|---|
| 0 | Proyecto, herramientas, despliegue vacío | Página en blanco publicada |
| 1 | Motor puro | Nada visual; verificable por consola |
| 2 | Store y bucle de juego | Piezas cayendo solas |
| 3 | Interfaz jugable | **Juego jugable con teclado** |
| 4 | Fantasma, siguiente pieza y HUD | Juego completo en escritorio |
| 5 | Controles táctiles | Juego completo en móvil |
| 6 | Persistencia | Récord y continuar partida |
| 7 | Ajustes y sonido | Personalización |
| 8 | Pulido, accesibilidad y despliegue | v1 terminada |

El hito importante es el final de la fase 3: a partir de ahí hay un juego real
con el que probar todo lo demás.

---

## 9. Despliegue

`netlify.toml` en la raíz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

La redirección hace que cualquier ruta sirva la aplicación. No hay
enrutamiento en la v1, pero evita un 404 si alguien recarga con una ruta
inventada.

Se conecta el repositorio de GitHub a Netlify y cada push a la rama principal
despliega automáticamente.
