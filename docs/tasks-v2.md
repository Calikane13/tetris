# tasks-v2.md — Tareas del pulido visual

Cada tarea se entrega como archivos completos, se comprueba en el navegador y se
cierra con un commit. Una a la vez.

Numeración `V01` en adelante, para no confundirla con las `T01–T38` de la v1.

**Antes de cerrar cualquier tarea:** `npm run build` sin errores, comprobación
hecha en el navegador, y commit con el identificador delante.

---

## Fase A — Aspecto de los bloques

### V01 · Colores con relieve
- **Archivos:** `src/engine/constants.ts`.
- **Requisitos:** V10, V11, V12.
- **Qué hacer:** sustituir `PIECE_COLORS` por un mapa con tres clases por pieza
  (relleno, borde claro, borde oscuro). `GHOST_BORDERS` se queda igual.
- **Aviso:** todas las clases escritas enteras. Nada de plantillas.
- **Hecho cuando:** compila. No se ve ningún cambio todavía; lo usa V02.

### V02 · Celda con relieve
- **Archivos:** `src/components/Cell.tsx`.
- **Requisitos:** V10, V13.
- **Qué hacer:** aplicar los bordes asimétricos al bloque relleno. Quitar el
  redondeo. El fantasma se queda como está.
- **Hecho cuando:** los bloques se ven con volumen, el fantasma sigue siendo un
  contorno hueco, y con el tablero lleno se distinguen las piezas contiguas.

### V03 · Recuadro de siguiente pieza
- **Archivos:** `src/components/NextPiece.tsx`.
- **Requisitos:** V14.
- **Hecho cuando:** la pieza del recuadro se ve igual que las del tablero.

---

## Fase B — Sistema de fases

### V04 · Estado de limpieza en el store
- **Archivos:** `src/engine/constants.ts`, `src/store/useGameStore.ts`.
- **Requisitos:** V1, V2, V4.
- **Qué hacer:** añadir `'clearing'` a `GameStatus` y `clearingRows` al estado.
  Partir `lockAndAdvance` en dos, con `setTimeout` en medio. Cancelar el
  temporizador en `startGame`.
- **Hecho cuando:** al completar una línea hay una pausa de 300 ms antes de que
  desaparezca, los controles no responden durante esa pausa, y la partida
  continúa con normalidad después. Todavía no se ve ninguna animación: es
  esperado y lo arregla V05.

### V05 · Barrido de luz
- **Archivos:** `src/components/Cell.tsx`, `src/components/Board.tsx`,
  `src/index.css`.
- **Requisitos:** V5, V6, V7, V8, V9.
- **Qué hacer:** pasar a cada celda si pertenece a una fila en limpieza y su
  índice de columna. Animar con `transform` y retraso escalonado.
- **Hecho cuando:** al completar una línea, una banda clara la recorre de
  izquierda a derecha antes de que desaparezca. Con cuatro líneas, las cuatro
  se animan a la vez.

### V06 · Comprobación de movimiento reducido
- **Archivos:** `src/index.css`.
- **Requisitos:** V3.
- **Qué hacer:** verificar que con `prefers-reduced-motion` activo la fase sigue
  existiendo pero sin movimiento visible.
- **Hecho cuando:** con la preferencia emulada en DevTools, se puede jugar una
  partida completa, las líneas desaparecen y nada se queda bloqueado.

---

## Fase C — Puntuación y récord

### V07 · Icono de corona
- **Archivos:** `src/components/CrownIcon.tsx`.
- **Requisitos:** V18.
- **Qué hacer:** SVG en línea, con `currentColor` para heredar el color del texto.
- **Hecho cuando:** compila y se ve la corona si se coloca en cualquier sitio de
  prueba.

### V08 · Barra de puntuación
- **Archivos:** `src/components/ScoreBar.tsx`, `src/components/Hud.tsx`,
  `src/App.tsx`.
- **Requisitos:** V15, V16, V17, V19, V20.
- **Qué hacer:** sacar puntuación y récord del `Hud` a un componente propio
  encima del tablero. Líneas, nivel y siguiente pieza se quedan donde están.
- **Hecho cuando:** puntuación grande y récord con corona encima del tablero, se
  leen bien en escritorio y en móvil, y el tablero sigue cabiendo entero a
  320 px sin desplazamiento.

### V09 · Récord en vivo
- **Archivos:** `src/store/useGameStore.ts`.
- **Requisitos:** V21.
- **Qué hacer:** recalcular `best` con el máximo entre el actual y la puntuación
  nueva. `saveBestScore` se sigue llamando solo al perder.
- **Hecho cuando:** al superar el récord jugando, el número de arriba sube en ese
  momento. Tras recargar, el récord guardado es el correcto.

---

## Fase D — Fin de partida

### V10 · Apagado del tablero
- **Archivos:** `src/index.css`, `src/App.tsx`.
- **Requisitos:** V22, V26.
- **Qué hacer:** animar un filtro de gris y oscurecido sobre el contenedor del
  tablero cuando el estado es `gameover`.
- **Hecho cuando:** al perder, el tablero se apaga progresivamente en algo menos
  de un segundo.

### V11 · Pantalla de resultado
- **Archivos:** `src/components/Overlay.tsx` o el bloque de fin de partida en
  `src/App.tsx`.
- **Requisitos:** V23, V24, V25.
- **Qué hacer:** puntuación en grande, récord con corona debajo, texto explícito
  si es récord nuevo, y botón que aparece al terminar el apagado.
- **Hecho cuando:** el resultado se lee bien, el botón no está disponible durante
  la transición, y al batir el récord se dice con palabras y no solo con color.

---

## Fase E — Nivel

### V12 · Aviso de nivel más visible
- **Archivos:** `src/index.css`.
- **Requisitos:** V27, V28, V29.
- **Qué hacer:** reescribir la animación del aviso. La lógica del componente no
  se toca.
- **Hecho cuando:** el aviso se nota claramente al subir de nivel, sigue
  desapareciendo solo, y con movimiento reducido aparece sin desplazarse.

---

## Fase F — Cierre

### V13 · Repaso de los criterios de aceptación
- **Archivos:** ninguno.
- **Qué hacer:** recorrer los diez criterios de `spec-v2.md` uno por uno, en
  escritorio y en un móvil real.
- **Hecho cuando:** los diez se cumplen, o lo que falle está anotado como tarea
  nueva.

### V14 · Despliegue de la v2
- **Archivos:** ninguno.
- **Qué hacer:** `git push` y esperar al despliegue en Cloudflare.
- **Hecho cuando:** la URL pública muestra la v2 y una partida completa funciona
  en el móvil.
