# tasks-v3.md — Tareas de combos e identidad

Cada tarea se entrega como archivos completos, se comprueba en el navegador y se
cierra con un commit. Una a la vez.

Numeración `C01` en adelante, para no confundirla con las `T` de la v1 ni las `V`
de la v2.

**Antes de cerrar cualquier tarea:** `npm run build` sin errores, comprobación
hecha en el navegador, y commit con el identificador delante.

---

## Fase A — Puntuación de combo

### C01 · Constantes y fórmula
- **Archivos:** `src/engine/constants.ts`, `src/engine/scoring.ts`.
- **Requisitos:** C7, C8, C9.
- **Qué hacer:** añadir `COMBO_BASE` (50) y `COMBO_GRACE` (3), y la función
  `comboBonus(combo, level)` con la comprobación de `combo < 2` dentro.
- **Hecho cuando:** compila. No se ve nada todavía; lo usa C02.

### C02 · Racha en el store
- **Archivos:** `src/store/useGameStore.ts`.
- **Requisitos:** C1 a C6, C10.
- **Qué hacer:** añadir `combo`, `dryPieces` y `lastComboBonus` al estado, y la
  lógica de racha dentro de `advance()`. Ponerlos a cero en `startGame` y en
  `resumeSavedGame`.
- **Hecho cuando:** eliminar líneas con dos piezas seguidas da más puntos de los
  que corresponderían por línea. Con nivel 1 y racha 2, son 100 puntos extra.
  Fijar tres piezas sin línea rompe la racha; dos no.

---

## Fase B — Aviso de combo

### C03 · Barrido amarillo
- **Archivos:** `src/store/useGameStore.ts`, `src/components/Board.tsx`,
  `src/components/Cell.tsx`, `src/index.css`.
- **Requisitos:** C13.
- **Qué hacer:** pasar a la celda si la limpieza forma parte de una racha, y
  aplicar una clase de barrido distinta.
- **Hecho cuando:** la primera línea de una racha se barre en blanco, y las
  siguientes en amarillo.
- **Comprobar aparte:** una fila llena de piezas O (amarillas). Si el barrido no
  se distingue, añadir borde blanco al barrido de combo.

### C04 · Cartel de combo
- **Archivos:** `src/components/ComboBanner.tsx`, `src/App.tsx`,
  `src/index.css`.
- **Requisitos:** C11, C12, C14, C15, C16.
- **Qué hacer:** componente hermano de `LevelUpBanner`, en amarillo, con
  destello. No se muestra si el aviso de nivel está activo.
- **Hecho cuando:** al encadenar aparece el cartel con la racha y los puntos
  extra, en amarillo, y desaparece solo sin bloquear el juego.

### C05 · Anuncio accesible del combo
- **Archivos:** `src/components/LiveRegion.tsx`.
- **Requisitos:** C17.
- **Hecho cuando:** el texto de la región oculta menciona la racha además de las
  líneas.

---

## Fase C — Identidad

### C06 · Logo
- **Archivos:** `src/components/Logo.tsx`.
- **Requisitos:** C21, C22, C23, C25.
- **Qué hacer:** SVG de bloques apilados en torre, con los colores de las piezas
  y su relieve. Prop de tamaño.
- **Hecho cuando:** se reconoce como una torre de bloques tanto a 32 px como a
  128 px.

### C07 · Título e icono
- **Archivos:** `index.html`, `public/logo.svg`, `README.md`.
- **Requisitos:** C18, C19, C20, C24.
- **Qué hacer:** cambiar el título de la pestaña, sustituir el icono de Vite por
  el logo, actualizar el README.
- **Aviso:** no se toca el nombre del repositorio, la carpeta ni la URL.
- **Hecho cuando:** la pestaña muestra "Bloque a Bloque" y el icono de la torre.

### C08 · Menú
- **Archivos:** `src/App.tsx`.
- **Requisitos:** C26 a C30.
- **Qué hacer:** logo, nombre, récord con corona, jerarquía de botones, e
  instrucciones de teclado ocultas en móvil.
- **Hecho cuando:** el menú se ve completo sin desplazamiento a 320 × 568 px y
  muestra el récord antes de empezar.

---

## Fase D — Cierre

### C09 · Repaso de los criterios de aceptación
- **Archivos:** ninguno.
- **Qué hacer:** recorrer los diez criterios de `spec-v3.md`, en escritorio y en
  móvil real con `npm run dev -- --host`.
- **Hecho cuando:** los diez se cumplen, o lo que falle está anotado como tarea
  nueva.

### C10 · Despliegue de la v3
- **Archivos:** ninguno.
- **Qué hacer:** `git push` y esperar al despliegue en Cloudflare.
- **Hecho cuando:** la URL pública muestra la v3 y una partida completa funciona
  en el móvil.
