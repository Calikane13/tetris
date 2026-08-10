# plan-v2.md — Cómo se construye el pulido visual

Diseño técnico de lo que define `spec-v2.md`.
Si algo choca con `constitution.md`, gana la constitución.

Versión: 2.0
Estado: propuesta

---

## 1. Qué cambia y qué no

No se toca nada de `src/engine/`. Las reglas del juego son las mismas, así que
el motor no tiene motivo para cambiar. Todo el trabajo está en el store (fases),
en los componentes y en el CSS.

| Zona | Cambia |
|---|---|
| `src/engine/` | Nada, salvo añadir constantes de duración |
| `src/store/` | Fases de animación, récord en vivo |
| `src/components/` | Bloques, HUD, tablero, fin de partida |
| `src/index.css` | Animaciones nuevas |

---

## 2. El sistema de fases

Es la parte de fondo, y la que hay que hacer bien porque la v3 se apoyará en ella.

### 2.1 El problema

Hoy `lockAndAdvance()` hace todo de golpe: fija la pieza, borra las líneas,
puntúa y saca la siguiente. Entre el estado "antes" y el "después" no hay nada
que pintar, así que no hay dónde meter una animación.

### 2.2 La solución

Se parte en dos, con una espera en medio:

```
lockAndAdvance()
  ├── fija la pieza en el tablero
  ├── ¿hay filas completas?
  │     ├── NO  → continúa como hasta ahora
  │     └── SÍ  → guarda las filas en clearingRows
  │               status pasa a 'clearing'
  │               programa finishClearing() para dentro de N ms
  └── fin

finishClearing()
  ├── borra las filas
  ├── puntúa, sube nivel, saca la siguiente pieza
  ├── status vuelve a 'playing'
  └── comprueba fin de partida
```

### 2.3 Estado nuevo

```
status: 'menu' | 'playing' | 'clearing' | 'paused' | 'gameover'
clearingRows: number[]        // índices de las filas que se están limpiando
```

`clearingRows` va vacío salvo durante la fase.

### 2.4 Qué se congela durante 'clearing'

- El bucle de juego no aplica gravedad (ya lo hace: solo corre con `'playing'`).
- Las acciones de movimiento y rotación salen sin hacer nada, porque todas
  comprueban `status !== 'playing'`. **Esto ya funciona sin tocar nada**, que es
  la ventaja de haber puesto esa comprobación en la v1.
- La pausa durante la fase se ignora, para no dejar una animación a medias.

### 2.5 Por qué un temporizador y no el evento de fin de animación

Se usa `setTimeout` con la duración de `constants.ts`, no `animationend` del DOM.
Motivos:

- La duración vive en un solo sitio y es la misma para la lógica y para el CSS.
- Con `prefers-reduced-motion` la animación puede no dispararse siquiera, y
  `animationend` nunca llegaría: la partida se quedaría bloqueada para siempre.
- No hay que buscar elementos del DOM desde el store.

El temporizador se guarda en una variable del módulo para poder cancelarlo si se
empieza una partida nueva a media fase (requisito V4).

---

## 3. Animación de línea

### 3.1 Cómo se pinta

`Board` ya recibe `clearingRows` del store. Cada celda que pertenezca a una fila
en limpieza recibe una clase extra.

El barrido es un pseudo-elemento sobre la fila: una banda clara que se desplaza
de izquierda a derecha con `transform: translateX()`. Se usa `transform` y no
`left` porque el navegador lo resuelve sin recalcular la disposición de la
página, que es lo que evita tirones en móvil.

Como la rejilla es de celdas independientes y no hay un elemento "fila", el
barrido se hace **por celda con retraso escalonado**: la celda de la columna 0
empieza en el instante 0, la columna 1 un poco después, y así. El resultado
visual es el mismo y no obliga a cambiar la estructura del tablero.

```
animation-delay: calc(var(--col) * 20ms)
```

Cada celda recibe su índice de columna como variable CSS en línea.

### 3.2 Constantes

En `engine/constants.ts`:

```
LINE_CLEAR_MS = 300          // duración total de la fase
LINE_CLEAR_STEP_MS = 20      // retraso entre columnas
```

---

## 4. Bloques con relieve

### 4.1 El problema de Tailwind, otra vez

Cada pieza necesita ahora cuatro clases (relleno, borde claro, borde oscuro y el
borde del fantasma) en lugar de una. Siguen teniendo que ser literales.

La estructura pasa de un `Record<PieceType, string>` a un
`Record<PieceType, { fill, light, dark }>`, todo escrito a mano en
`constants.ts`.

### 4.2 Cómo se aplica

Los bordes asimétricos se hacen con `border-t`, `border-l`, `border-b` y
`border-r` de anchos iguales pero colores distintos. Con celdas pequeñas, 2px
por lado es suficiente y deja el relleno visible.

**El borde no puede llevar `border-radius`.** Con esquinas redondeadas, los
cuatro bordes de distinto color se cortan en diagonales que se ven sucias. Los
bloques pasan a ser cuadrados, que además encaja mejor con el aspecto retro.

### 4.3 Qué queda igual

- El fantasma sigue con contorno hueco y sin relieve (V13).
- Los siete colores base no cambian (V11).

---

## 5. Puntuación y récord

### 5.1 Colocación

El HUD se parte en dos:

- `ScoreBar`: encima del tablero, con puntuación y récord.
- `Hud`: lo que queda (líneas, nivel, siguiente pieza), en su sitio actual.

`App` los coloca: `ScoreBar` arriba, luego la fila de tablero más `Hud`.

### 5.2 La corona

SVG en línea dentro de un componente `CrownIcon`, sin archivo aparte ni
dependencia de iconos. Hereda el color del texto con `currentColor`.

### 5.3 Récord en vivo

`saveBestScore()` se queda como está: solo escribe al perder. Lo que cambia es
que el store recalcula el valor mostrado en cada puntuación:

```
best: Math.max(state.best, newScore)
```

Así el número sube en pantalla en cuanto se supera (V21), pero `localStorage`
solo se toca una vez por partida.

---

## 6. Fin de partida

### 6.1 El apagado

Un `filter: grayscale() brightness()` animado sobre el contenedor del tablero.
Una sola propiedad CSS sobre un solo elemento: el navegador lo resuelve en la
GPU y no hay que tocar ni una celda.

```
@keyframes board-fade {
  to { filter: grayscale(1) brightness(0.45); }
}
```

### 6.2 El retraso del botón

El botón de volver a jugar aparece cuando la transición acaba (V25). Se resuelve
con un `useState` en el propio componente de fin de partida y un `setTimeout` de
la duración del apagado. No hace falta que el store se entere.

### 6.3 Récord nuevo

Si `score >= best` al terminar, se muestra un texto explícito además del cambio
de color, porque la información no puede ir solo en el color (C2).

---

## 7. Aviso de nivel

`LevelUpBanner` se mantiene tal cual en su lógica. Solo cambia su animación en
`index.css`: más recorrido, más escala, y un destello de fondo. Sigue dentro de
la consulta `prefers-reduced-motion: no-preference`, así que el comportamiento
accesible ya está resuelto desde la v1.

---

## 8. Orden de construcción

El orden importa, porque una tarea depende de la anterior:

1. **Constantes y estilos de bloque** — cambio aislado, se ve enseguida, no
   depende de nada.
2. **Fases en el store** — sin animación todavía. Al terminar, las líneas tardan
   300 ms en desaparecer aunque no se vea nada.
3. **Animación del barrido** — ya hay una fase donde meterla.
4. **ScoreBar y corona** — independiente de lo anterior.
5. **Fin de partida** — independiente.
6. **Aviso de nivel** — el más pequeño, se deja para el final.

Los pasos 2 y 3 van seguidos: entre uno y otro el juego se siente peor que
antes, porque hay una pausa sin nada que la justifique.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| La fase deja la partida bloqueada | El temporizador se cancela al empezar partida nueva; nunca depende de eventos del DOM |
| 300 ms se hace pesado a nivel alto | Un número en `constants.ts` |
| Animar 200 celdas va lento en móvil | Solo se animan las celdas de las filas completas, como mucho 40; y se usa `transform`, no propiedades que recalculen la disposición |
| El relieve reduce contraste entre piezas contiguas | Revisar con el tablero lleno; si falla, subir el ancho del borde |
| Clases de Tailwind ausentes en producción | Mapa literal y comprobación con `npm run build`, no solo en desarrollo |
