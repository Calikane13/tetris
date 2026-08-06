# Tareas — Bloques v1

> Se trabajan en orden. Una tarea cada vez. Cada tarea deja el proyecto
> compilando y arrancando.
>
> Recordatorio de la definición de "hecho" (`constitution.md`, sección 4):
> compila sin errores, arranca sin errores en consola, el criterio se comprueba
> a mano, y hay un commit cuyo mensaje empieza por el identificador de la tarea.

Leyenda de columnas: **Archivos** indica qué se crea o modifica.
**Hecho cuando** es la comprobación manual concreta.

---

## Fase 0 — Preparación

### T01 · Crear el proyecto
- **Archivos:** todo el andamiaje inicial de Vite.
- **Qué hacer:** `npm create vite@latest bloques -- --template react-ts`, entrar
  en la carpeta, `npm install`, `npm run dev`.
- **Hecho cuando:** se ve la página de bienvenida de Vite en el navegador.

### T02 · Instalar y configurar Tailwind
- **Archivos:** `tailwind.config.js`, `postcss.config.js`, `src/index.css`.
- **Hecho cuando:** una clase de Tailwind (por ejemplo `text-red-500`) cambia
  visiblemente un texto de `App.tsx`.

### T03 · Instalar Zustand y activar TypeScript estricto
- **Archivos:** `package.json`, `tsconfig.json`.
- **Qué hacer:** `npm install zustand`. Comprobar que `strict` está en `true` y
  añadir `noUnusedLocals` y `noUnusedParameters`.
- **Hecho cuando:** `npm run build` termina sin errores.

### T04 · Repositorio y despliegue vacío
- **Archivos:** `.gitignore`, `netlify.toml`, `README.md`.
- **Qué hacer:** primer commit, subir a GitHub, conectar con Netlify.
- **Hecho cuando:** hay una URL pública de Netlify que muestra la aplicación,
  aunque solo tenga un título.

---

## Fase 1 — Motor puro

En esta fase no hay nada que ver en pantalla. Se comprueba desde la consola del
navegador, importando las funciones desde `App.tsx` de forma temporal o usando
`console.log`.

### T05 · Tipos del juego
- **Archivos:** `src/engine/types.ts`.
- **Contenido:** los tipos de la sección 4 de `plan.md`.
- **Hecho cuando:** el archivo compila y no exporta nada más que tipos.

### T06 · Constantes
- **Archivos:** `src/engine/constants.ts`.
- **Contenido:** ancho 10, alto 20, tiempos de repetición (170 y 50 ms),
  intervalo base de caída (800 ms), decremento por nivel (70 ms), suelo (80 ms),
  tabla de puntos por líneas, y el objeto que mapea cada tipo de pieza a su clase
  de color de Tailwind.
- **Hecho cuando:** no hay ningún número mágico repartido por el resto del
  proyecto; todos viven aquí.

### T07 · Formas de las piezas
- **Archivos:** `src/engine/tetrominoes.ts`.
- **Contenido:** las cuatro rotaciones de cada una de las siete piezas, como
  matrices de ceros y unos. I y O en 4×4; el resto en 3×3.
- **Hecho cuando:** una función auxiliar temporal imprime en consola las cuatro
  rotaciones de cada pieza y todas se reconocen a simple vista.

### T08 · Tablero: crear y colisionar
- **Archivos:** `src/engine/board.ts`.
- **Funciones:** `createEmptyBoard()`, `isValidPosition(board, piece)`.
- **Reglas:** R1, R12.
- **Hecho cuando:** desde la consola, una pieza colocada fuera del tablero o
  sobre una celda ocupada devuelve `false`, y una válida devuelve `true`.

### T09 · Revisión visual de las piezas
- **Archivos:** ninguno nuevo; comprobación temporal en `App.tsx`.
- **Qué hacer:** pintar una rejilla provisional con las cuatro rotaciones de las
  siete piezas.
- **Hecho cuando:** las 28 formas son correctas. Esta tarea existe porque un
  error tipográfico en una matriz es casi imposible de detectar más adelante.
  Después se borra el código temporal.

### T10 · Fijar piezas y limpiar líneas
- **Archivos:** `src/engine/board.ts`.
- **Funciones:** `lockPiece(board, piece)`, `clearLines(board)` que devuelve el
  tablero nuevo y el número de líneas eliminadas.
- **Reglas:** R25, R27, R28, R29.
- **Hecho cuando:** con un tablero de prueba con una fila casi llena, fijar la
  pieza que la completa elimina la fila y baja las de arriba.

### T11 · Movimiento y rotación
- **Archivos:** `src/engine/piece.ts`.
- **Funciones:** `move(board, piece, dCol, dRow)`, `rotate(board, piece, dir)`,
  `getGhostPosition(board, piece)`, `randomPiece(previous)`.
- **Reglas:** R6, R7, R16, R17, R18, R20.
- **Hecho cuando:** rotar contra la pared derecha desplaza la pieza hacia dentro;
  si no cabe de ninguna forma, la pieza queda intacta; y la O no cambia al rotar.

### T12 · Puntuación, nivel y velocidad
- **Archivos:** `src/engine/scoring.ts`.
- **Funciones:** `scoreForLines(lines, level)`, `levelForLines(totalLines)`,
  `dropIntervalForLevel(level)`.
- **Reglas:** R10, R31, R35.
- **Hecho cuando:** `dropIntervalForLevel(1)` da 800, `(2)` da 730 y `(11)` da 80;
  y `scoreForLines(4, 3)` da 2400.

---

## Fase 2 — Estado y bucle

### T13 · Store de la partida
- **Archivos:** `src/store/useGameStore.ts`.
- **Contenido:** el `GameState` y las acciones `startGame`, `moveLeft`,
  `moveRight`, `rotateCW`, `rotateCCW`, `softDrop`, `hardDrop`, `tick`,
  `togglePause`, `exitToMenu`.
- **Regla clave:** cada acción se limita a llamar al motor y guardar el
  resultado. Si aquí aparece un bucle recorriendo el tablero, la lógica está en
  el sitio equivocado.
- **Hecho cuando:** llamando a las acciones desde la consola, el estado del store
  cambia como corresponde.

### T14 · Bucle de juego
- **Archivos:** `src/hooks/useGameLoop.ts`.
- **Contenido:** `requestAnimationFrame` con acumulador de tiempo, límite de
  100 ms al delta, y llamada a `tick()` cuando toca. Se detiene si el estado no
  es `playing`.
- **Reglas:** R9, R11.
- **Hecho cuando:** con un `console.log` en `tick`, los avisos salen cada 800 ms
  en el nivel 1 y se paran al pausar.

---

## Fase 3 — Interfaz jugable

Al terminar esta fase hay un juego real.

### T15 · Celda y tablero
- **Archivos:** `src/components/Cell.tsx`, `src/components/Board.tsx`.
- **Contenido:** rejilla de 10 × 20 con CSS Grid. `Cell` envuelto en
  `React.memo`. La pieza activa se superpone al pintar, no se escribe en el
  tablero.
- **Decisión:** 5.3 de `plan.md`.
- **Hecho cuando:** se ve un tablero vacío con las proporciones correctas y una
  pieza dibujada encima en la posición esperada.

### T16 · Pantalla de juego
- **Archivos:** `src/components/Game.tsx`, `src/components/App.tsx`.
- **Contenido:** composición del tablero y conexión con el store y el bucle.
- **Hecho cuando:** al cargar la página cae una pieza sola, se fija al llegar
  abajo y aparece la siguiente.

### T17 · Controles de teclado
- **Archivos:** `src/hooks/useKeyboard.ts`.
- **Contenido:** teclas por defecto de la sección 7.1 del spec, repetición
  mantenida propia (170 ms y después 50 ms), y `preventDefault` en las teclas del
  juego.
- **Reglas:** R13, R14, R15, C1.
- **Hecho cuando:** se puede jugar una partida entera con el teclado y la página
  no se desplaza al pulsar las flechas ni el espacio.

### T18 · Fin de partida y reinicio
- **Archivos:** `src/components/Overlay.tsx`, `src/store/useGameStore.ts`.
- **Reglas:** R38, R39.
- **Hecho cuando:** llenar el tablero muestra la capa de fin de partida con la
  puntuación, y el botón de reiniciar arranca una partida limpia.

### T19 · Pausa
- **Archivos:** `src/components/Overlay.tsx`, `src/hooks/useKeyboard.ts`.
- **Reglas:** R41, R42.
- **Hecho cuando:** la tecla P detiene la caída, los controles no responden, y al
  reanudar la pieza sigue donde estaba.

### T20 · Menú inicial
- **Archivos:** `src/components/Menu.tsx`, `src/components/App.tsx`.
- **Contenido:** título, botón de jugar y navegación entre estados.
- **Hecho cuando:** se puede ir del menú al juego, perder, volver al menú y
  empezar otra vez sin recargar la página.

---

## Fase 4 — Fantasma, siguiente pieza y HUD

### T21 · Pieza fantasma
- **Archivos:** `src/components/Board.tsx`.
- **Contenido:** se pinta la silueta calculada por `getGhostPosition`, con borde
  del color de la pieza y sin relleno sólido.
- **Reglas:** R20, R21, R22, R23.
- **Hecho cuando:** el fantasma sigue a la pieza al mover y al rotar, y una caída
  dura aterriza exactamente donde estaba el fantasma.

### T22 · Vista de la siguiente pieza
- **Archivos:** `src/components/NextPiece.tsx`.
- **Reglas:** R8. Supuesto S1 del spec.
- **Hecho cuando:** la pieza mostrada es siempre la que aparece a continuación,
  y se ve centrada en su recuadro.

### T23 · Panel de información
- **Archivos:** `src/components/Hud.tsx`.
- **Contenido:** puntuación, líneas, nivel y mejor puntuación.
- **Hecho cuando:** los números coinciden con las reglas de puntuación al
  eliminar 1, 2, 3 y 4 líneas.

### T24 · Aviso de subida de nivel
- **Archivos:** `src/components/Game.tsx`, `src/index.css`.
- **Reglas:** R36, NF6.
- **Hecho cuando:** al llegar a 10 líneas aparece un aviso breve, y con
  `prefers-reduced-motion` activo el aviso aparece sin animación.

---

## Fase 5 — Móvil

### T25 · Botones táctiles
- **Archivos:** `src/components/TouchControls.tsx`.
- **Contenido:** botones de izquierda, derecha, rotar, caída suave y caída dura,
  con repetición mantenida reutilizando la lógica de T17. Mínimo 44 × 44 px.
- **Reglas:** C4, C5, C6.
- **Hecho cuando:** se juega una partida entera con el dedo en una ventana de
  360 px de ancho.

### T26 · Ajuste del diseño a pantallas pequeñas
- **Archivos:** `src/index.css`, `src/components/Game.tsx`.
- **Contenido:** `touch-action: manipulation`, `user-select: none`, tablero
  dimensionado con unidades relativas, controles ocultos por encima de 768 px.
- **Reglas:** C7, NF4.
- **Hecho cuando:** desde 320 px no hay barras de desplazamiento, ni zoom al
  pulsar rápido, ni rebote de la página.

---

## Fase 6 — Persistencia

### T27 · Módulo de almacenamiento
- **Archivos:** `src/lib/storage.ts`.
- **Contenido:** las funciones de la sección 5.7 de `plan.md`, con envoltorio de
  versión, validación de forma y `try/catch` en todas las llamadas.
- **Reglas:** P9, P10, P11.
- **Hecho cuando:** escribiendo basura a mano en las claves de `localStorage`, la
  aplicación arranca con los valores por defecto y sin errores en consola.

### T28 · Mejor puntuación
- **Archivos:** `src/store/useGameStore.ts`, `src/components/Hud.tsx`.
- **Reglas:** P1, P2.
- **Hecho cuando:** el récord se actualiza al superarlo y sigue ahí tras
  recargar.

### T29 · Guardado automático de la partida
- **Archivos:** `src/hooks/useAutoSave.ts`.
- **Contenido:** guardar al fijar pieza, al pausar y en `visibilitychange`.
- **Reglas:** P3, P4, P5.
- **Hecho cuando:** cerrando la pestaña a media partida, la clave de partida
  guardada contiene el estado correcto.

### T30 · Continuar partida
- **Archivos:** `src/components/Menu.tsx`, `src/store/useGameStore.ts`.
- **Reglas:** P6, R40.
- **Hecho cuando:** el botón de continuar solo aparece si hay partida guardada,
  restaura el tablero y la puntuación exactos, y empezar una partida nueva borra
  el guardado.

---

## Fase 7 — Ajustes y sonido

### T31 · Store de ajustes
- **Archivos:** `src/store/useSettingsStore.ts`.
- **Contenido:** sonido, fantasma visible y asignación de teclas, sincronizados
  con `localStorage` en cada cambio.
- **Reglas:** P7, P8.
- **Hecho cuando:** cambiar un ajuste desde la consola lo persiste al instante.

### T32 · Panel de ajustes
- **Archivos:** `src/components/Settings.tsx`.
- **Contenido:** los controles de la sección 6.5 del spec, incluido el borrado
  del récord con confirmación.
- **Reglas:** R24, C2, C3.
- **Hecho cuando:** desactivar el fantasma lo oculta de inmediato, reasignar una
  tecla funciona en la partida siguiente, y no se puede asignar la misma tecla a
  dos acciones.

### T33 · Efectos de sonido
- **Archivos:** `src/lib/sound.ts`.
- **Contenido:** tonos generados con Web Audio para rotar, fijar, limpiar líneas
  y perder. `AudioContext` creado en la primera interacción del usuario.
- **Decisión:** 5.8 de `plan.md`.
- **Hecho cuando:** suenan los cuatro efectos, el interruptor de sonido los
  silencia, y también funcionan en un iPhone.

### T34 · Accesibilidad
- **Archivos:** varios componentes.
- **Contenido:** etiquetas accesibles en todos los botones, región `aria-live`
  que anuncia puntuación, nivel y fin de partida, y foco visible.
- **Reglas:** P9 de la constitución, NF5.
- **Hecho cuando:** se puede llegar a todos los botones con el tabulador, y un
  lector de pantalla anuncia el fin de partida.

---

## Fase 8 — Cierre

### T35 · Revisión de los criterios de aceptación
- **Qué hacer:** recorrer la lista CA-01 a CA-26 del spec, una por una, anotando
  las que fallan.
- **Hecho cuando:** la lista de fallos está escrita.

### T36 · Corrección de lo detectado
- **Hecho cuando:** los 26 criterios pasan.

### T37 · Limpieza
- **Qué hacer:** borrar código temporal y comentado, eliminar `console.log`,
  comprobar que `npm run build` no da avisos, y que `grep -r "react" src/engine/`
  no devuelve nada.
- **Hecho cuando:** el proyecto compila limpio y el motor sigue siendo puro.

### T38 · Despliegue de la v1
- **Archivos:** `README.md`.
- **Qué hacer:** documentar cómo arrancar el proyecto y qué hace cada carpeta.
  Push a la rama principal.
- **Hecho cuando:** la URL de Netlify sirve el juego terminado y se puede jugar
  desde un móvil real.

---

## Resumen

| Fase | Tareas | Hito |
|---|---|---|
| 0 | T01–T04 | Proyecto publicado en Netlify |
| 1 | T05–T12 | Motor completo y verificado |
| 2 | T13–T14 | Piezas cayendo solas |
| 3 | T15–T20 | **Juego jugable con teclado** |
| 4 | T21–T24 | Juego completo en escritorio |
| 5 | T25–T26 | Juego completo en móvil |
| 6 | T27–T30 | Récord y continuar partida |
| 7 | T31–T34 | Ajustes, sonido y accesibilidad |
| 8 | T35–T38 | v1 terminada |

38 tareas. Las fases 0 a 3 son las que producen el salto grande: hasta T20 no hay
juego, y a partir de T20 todo lo demás se prueba jugando.
