# tasks-v5.md — Tareas del modo arena

Cada tarea se entrega como archivos completos, se comprueba en el navegador y se
cierra con un commit. Una a la vez.

Numeración `S01` en adelante.

**Antes de cerrar cualquier tarea:** `npm run build` sin errores, comprobación
hecha en el navegador, y commit con el identificador delante.

**Regla que vale para toda la versión:** nada de esto toca `src/engine/` ni
`useGameStore.ts`, salvo la integración final de S09. Si una tarea parece pedir
lo contrario, hay que parar y replantear en lugar de seguir.

---

## Fase A — La rejilla

### S01 · Constantes y rejilla de granos
- **Archivos:** `src/sand/constants.ts`, `src/sand/grid.ts` (ambos nuevos).
- **Requisitos:** A1, A2, A3.
- **Qué hacer:** medidas del tablero, colores, y las funciones de acceso a un
  `Uint8Array` plano: crear, leer, escribir, copiar.
- **Hecho cuando:** compila. No se ve nada todavía.

---

## Fase B — Física y dibujo

### S02 · Caída de la arena
- **Archivos:** `src/sand/physics.ts` (nuevo).
- **Requisitos:** A10, A11, A12.
- **Qué hacer:** un paso de física que baje cada grano una posición, con
  deslizamiento diagonal. Recorrido **de abajo arriba**, o los granos
  atravesarán el tablero de una vez.
- **Hecho cuando:** compila. Se verifica en S03, que es cuando hay algo que ver.

### S03 · Dibujo con canvas
- **Archivos:** `src/sand/SandCanvas.tsx` (nuevo), `src/App.tsx` (prueba
  temporal).
- **Requisitos:** A4, A5.
- **Qué hacer:** dibujar la rejilla en un canvas, con la línea roja del límite y
  atención a `devicePixelRatio`.
- **Hecho cuando:** con un puñado de granos colocados a mano en el código, se
  ven en pantalla, caen y forman una ladera inclinada en lugar de una columna
  recta. Esto valida S02 y S03 a la vez.

---

## Fase C — El juego

### S04 · Store y bucle del modo
- **Archivos:** `src/sand/useSandStore.ts`, `src/sand/useSandLoop.ts` (nuevos).
- **Requisitos:** A6, A7, A8, A9, A13, A14.
- **Qué hacer:** piezas que caen y se controlan como siempre, y que al fijarse
  se desmoronan en granos. Fases `falling` y `settling`.
- **Hecho cuando:** se puede jugar: la pieza se mueve y rota, al llegar abajo se
  deshace en arena que cae, y cuando se asienta aparece la siguiente.

### S05 · Detección de masas
- **Archivos:** `src/sand/masses.ts` (nuevo), `src/sand/useSandStore.ts`.
- **Requisitos:** A15, A16, A17, A18.
- **Qué hacer:** recorrido en anchura desde la pared izquierda buscando masas
  del mismo color que alcancen la derecha. Iluminarlas antes de borrarlas.
- **Hecho cuando:** una masa de un color que une ambas paredes se ilumina y
  desaparece, tenga la forma que tenga.
- **Comprobar aparte, y es importante:** si con la conexión diagonal el tablero
  se limpia casi solo, cambiar a conexión ortogonal. Es el riesgo principal de
  la versión.

### S06 · Cadenas y puntuación
- **Archivos:** `src/sand/useSandStore.ts`.
- **Requisitos:** A19, A20, A25, A26.
- **Qué hacer:** tras eliminar, dejar caer y volver a buscar. Multiplicador
  creciente. Tope de 20 iteraciones.
- **Hecho cuando:** eliminar una masa puede provocar otra, la puntuación sube
  más en la segunda, y nunca se queda colgado.

---

## Fase D — Progresión

### S07 · Colores progresivos
- **Archivos:** `src/sand/constants.ts`, `src/sand/useSandStore.ts`.
- **Requisitos:** A21, A22, A23, A24.
- **Hecho cuando:** la partida empieza con tres colores, al llegar al umbral
  aparece el cuarto con aviso en pantalla, y se nota que el juego se pone más
  difícil.

### S08 · Fin de partida
- **Archivos:** `src/sand/useSandStore.ts`.
- **Requisitos:** A27.
- **Hecho cuando:** la partida termina cuando la arena supera la línea roja, y
  se muestra la pantalla de resultado.

---

## Fase E — Integración

### S09 · El modo en el menú
- **Archivos:** `src/engine/modes.ts`, `src/storage/records.ts`,
  `src/App.tsx`, `src/hooks/useKeyboard.ts`.
- **Requisitos:** A28, A29, A30, A31, A32.
- **Qué hacer:** entrada en la tabla de modos, marca propia, y que los controles
  y la pausa dirijan al store correcto según el modo activo.
- **Aviso:** es la única tarea que toca archivos existentes. Cambios mínimos.
- **Hecho cuando:** el modo arena se elige desde el menú como cualquier otro,
  guarda su marca, y se puede pausar, salir y reanudar.

### S10 · Accesibilidad y movimiento reducido
- **Archivos:** `src/sand/SandCanvas.tsx`, `src/components/LiveRegion.tsx`.
- **Requisitos:** A34.
- **Hecho cuando:** los cambios de estado se anuncian, y con
  `prefers-reduced-motion` activo el modo sigue siendo jugable.

---

## Fase F — Cierre

### S11 · Rendimiento en móvil
- **Archivos:** los que haga falta.
- **Requisitos:** criterio 12 del spec.
- **Qué hacer:** probar en un móvil real con `npm run dev -- --host`. Si hay
  tirones al asentarse la arena, aplicar las mitigaciones del plan: recorrer
  solo desde la fila más alta con contenido, y si no basta, bajar los granos por
  celda.
- **Hecho cuando:** una partida completa va fluida en un móvil de gama media.

### S12 · Repaso de los criterios de aceptación
- **Archivos:** ninguno.
- **Hecho cuando:** los trece criterios de `spec-v5.md` se cumplen, o lo que
  falle está anotado como tarea nueva.

### S13 · Despliegue de la v5
- **Archivos:** ninguno.
- **Hecho cuando:** la URL pública muestra la v5 y el modo arena funciona en el
  móvil.
