# tasks-v4.md — Tareas de modos, sonido y estilos

Cada tarea se entrega como archivos completos, se comprueba en el navegador y se
cierra con un commit. Una a la vez.

Numeración `M01` en adelante.

**Antes de cerrar cualquier tarea:** `npm run build` sin errores, comprobación
hecha en el navegador, y commit con el identificador delante.

---

## Fase A — Persistencia (va primero, y con cuidado)

### M01 · Migración de récords
- **Archivos:** `src/storage/records.ts` (nuevo), `src/storage/safeStorage.ts`.
- **Requisitos:** M23, M24, M25, M28.
- **Qué hacer:** formato nuevo `bloques:records` con marca por modo, y lectura
  del formato viejo `bloques:best` para convertirlo. La clave vieja no se borra.
- **Aviso:** esta es la tarea con más riesgo de toda la versión. Si se hace mal,
  el récord del usuario desaparece y no hay vuelta atrás.
- **Hecho cuando:** con un récord ya existente en el navegador, tras cargar el
  juego aparece como marca del modo Clásico. Comprobar en las herramientas del
  navegador que `bloques:records` existe y que `bloques:best` sigue ahí.

---

## Fase B — Infraestructura de modos

### M02 · Tabla de modos
- **Archivos:** `src/engine/modes.ts` (nuevo), `src/engine/types.ts`.
- **Requisitos:** M1, M3.
- **Qué hacer:** los cinco modos como objetos de datos, sin lógica.
- **Hecho cuando:** compila. No se ve nada todavía.

### M03 · El modo en el store
- **Archivos:** `src/store/useGameStore.ts`.
- **Requisitos:** M2, M4, M5.
- **Qué hacer:** añadir `mode`, `startLevel` y `elapsed` al estado. `startGame`
  acepta el modo. Con el clásico, todo debe funcionar exactamente igual que
  antes.
- **Hecho cuando:** el juego funciona como siempre, sin cambios visibles.

### M04 · Nivel fijo y Cero gravedad
- **Archivos:** `src/store/useGameStore.ts`, `src/App.tsx` (selector temporal).
- **Requisitos:** M15 a M22.
- **Qué hacer:** nivel de inicio configurable, y gravedad que se puede apagar.
- **Hecho cuando:** empezando en nivel 10 las piezas caen deprisa desde la
  primera, y en Cero gravedad no bajan solas pero sí con los controles.

---

## Fase C — Modos con final

### M05 · Cronómetro
- **Archivos:** `src/components/Timer.tsx` (nuevo), `src/store/useGameStore.ts`,
  `src/index.css`.
- **Requisitos:** M29, M30, M31, M32.
- **Qué hacer:** acumular `elapsed` dentro de `addTime()`, y un componente que
  lo formatee. Nunca un temporizador aparte.
- **Hecho cuando:** el tiempo avanza al jugar, se detiene al pausar y no da
  saltos al volver de otra pestaña.

### M06 · Sprint
- **Archivos:** `src/store/useGameStore.ts`, `src/storage/records.ts`.
- **Requisitos:** M6 a M10.
- **Hecho cuando:** la partida termina exactamente al eliminar la línea 40, se
  muestra el tiempo, y queda guardado como marca. Llenar el tablero antes
  termina sin marca.

### M07 · Ultra
- **Archivos:** `src/store/useGameStore.ts`, `src/storage/records.ts`.
- **Requisitos:** M11 a M14.
- **Hecho cuando:** la partida termina a los 3 minutos con la puntuación como
  marca, los últimos 10 segundos se destacan, y perder antes también guarda la
  puntuación alcanzada.

---

## Fase D — Menú

### M08 · Selector de modo
- **Archivos:** `src/components/ModePicker.tsx` (nuevo), `src/App.tsx`.
- **Requisitos:** M47, M48, M49, M50, M26, M27.
- **Qué hacer:** elegir modo, ver su marca y su descripción, y elegir nivel si
  es Nivel fijo.
- **Hecho cuando:** se pueden lanzar los cinco modos desde el menú, cada uno
  muestra su marca, Cero gravedad no muestra ninguna, y todo cabe sin
  desplazamiento a 320 × 568 px.

---

## Fase E — Sonido

### M09 · Sonidos suaves
- **Archivos:** `src/audio/sfx.ts`.
- **Requisitos:** M33 a M37.
- **Qué hacer:** ondas `sine` o `triangle` en vez de `square`, ataque más lento,
  filtro paso bajo y volumen general más bajo. La estructura del archivo no
  cambia.
- **Hecho cuando:** los sonidos se distinguen entre sí, no suenan a pitido, y
  jugar diez minutos seguidos no cansa. Probar en un móvil real sin auriculares.

---

## Fase F — Estilos

### M10 · Los cinco estilos
- **Archivos:** `src/engine/constants.ts`, `src/components/Cell.tsx`,
  `src/components/NextPiece.tsx`.
- **Requisitos:** M38, M42, M46.
- **Qué hacer:** un mapa de clases literales por estilo, y que `Cell` sepa
  dibujarlos.
- **Hecho cuando:** cambiando el estilo a mano en el código, el tablero se ve
  distinto y los colores de las piezas siguen siendo los mismos.

### M11 · Elegir estilo en ajustes
- **Archivos:** `src/store/useSettingsStore.ts`, `src/storage/settings.ts`,
  `src/components/SettingsPanel.tsx`.
- **Requisitos:** M39, M42, M43, M45.
- **Hecho cuando:** los tres estilos libres se pueden elegir, se guardan al
  recargar, y los dos bloqueados aparecen con su condición.

### M12 · Desbloqueos
- **Archivos:** `src/storage/unlocks.ts` (nuevo), `src/store/useGameStore.ts`,
  `src/components/UnlockBanner.tsx` (nuevo).
- **Requisitos:** M40, M41, M44, M45.
- **Hecho cuando:** superar 10.000 puntos en Clásico desbloquea Neón con aviso
  en pantalla, completar un Sprint desbloquea Retro, y ambos siguen
  desbloqueados tras recargar.

---

## Fase G — Cierre

### M13 · Repaso de los criterios de aceptación
- **Archivos:** ninguno.
- **Qué hacer:** recorrer los trece criterios de `spec-v4.md`, en escritorio y en
  móvil real con `npm run dev -- --host`.
- **Hecho cuando:** los trece se cumplen, o lo que falle está anotado como tarea
  nueva.

### M14 · Despliegue de la v4
- **Archivos:** ninguno.
- **Qué hacer:** `git push` y esperar al workflow de GitHub Pages.
- **Hecho cuando:** la URL pública muestra la v4 y una partida completa de cada
  modo funciona en el móvil.
