# tasks-v6.md — Tareas de correcciones y pulido

Cada tarea se entrega como archivos completos, se comprueba en el navegador y se
cierra con un commit. Una a la vez.

Numeración `P01` en adelante.

**Antes de cerrar cualquier tarea:** `npm run build` sin errores, comprobación
hecha en el navegador, y commit con el identificador delante.

---

## Fase A — Persistencia (primero, y con cuidado)

### P01 · Una partida guardada por modo
- **Archivos:** `src/storage/savedGame.ts`, `src/storage/safeStorage.ts`,
  `src/store/useGameStore.ts`.
- **Requisitos:** P33, P34, P37, P38, P40.
- **Qué hacer:** la clave `bloques:saves` guarda un mapa de partidas, una por
  modo. Migración desde `bloques:save`, que no se borra. Cada partida se valida
  por separado.
- **Aviso:** es la tarea con más riesgo de la versión. Igual que la migración de
  récords de la v4, se hace primero y se comprueba mirando `localStorage`
  directamente, no fiándose de la pantalla.
- **Hecho cuando:** dejar un Ultra a medias, jugar un Sprint, y comprobar que al
  volver el Ultra sigue guardado. Recargar y comprobar que ambos siguen. Los
  récords intactos.

### P02 · La partida de arena también se guarda
- **Archivos:** `src/storage/savedGame.ts`, `src/sand/useSandStore.ts`.
- **Requisitos:** P39.
- **Qué hacer:** la rejilla de granos se guarda como array normal, porque
  `Uint8Array` no sobrevive a `JSON.stringify`.
- **Hecho cuando:** dejar una partida de arena a medias, salir, volver, y
  encontrarla como estaba.

---

## Fase B — Correcciones

### P03 · El cartel de combo se queda pillado
- **Archivos:** `src/components/ComboBanner.tsx`,
  `src/components/LevelUpBanner.tsx`, `src/components/UnlockBanner.tsx`.
- **Requisitos:** P4, P5, P6.
- **Qué hacer:** separar el efecto que detecta del efecto que cuenta el tiempo.
  Los tres avisos tienen la misma estructura y el mismo fallo latente, así que
  se corrigen los tres.
- **Hecho cuando:** encadenando combos rápido, el cartel siempre desaparece.
  Probar también subiendo de nivel a la vez que se hace un combo.

### P04 · Combos con líneas simultáneas
- **Archivos:** `src/store/useGameStore.ts`.
- **Requisitos:** P1, P2, P3.
- **Qué hacer:** la racha sube tantos puntos como líneas se eliminen.
- **Hecho cuando:** eliminar cuatro líneas de golpe pone la racha en 4 y muestra
  su extra. En nivel 1, eso son 200 puntos de bono.

### P05 · Equilibrio del modo arena
- **Archivos:** `src/sand/constants.ts`, `src/sand/useSandStore.ts`.
- **Requisitos:** P13, P14, P15, P16, P17, P18.
- **Qué hacer:** cuatro colores al empezar, y penalización de 100 puntos si se
  usa la caída dura en tres o más piezas seguidas sin mover ni rotar.
- **Hecho cuando:** martillear el espacio deja de compensar y se avisa en
  pantalla; mover o rotar reinicia el contador; la puntuación nunca baja de
  cero.

---

## Fase C — Menú

### P06 · Menú en dos pantallas
- **Archivos:** `src/App.tsx`, `src/components/ModePicker.tsx`.
- **Requisitos:** P26 a P32, P35, P36.
- **Qué hacer:** pantalla principal con Clásico, Más juegos y Ajustes. Segunda
  pantalla con los cinco modos restantes, su marca y el selector de nivel. Los
  modos con partida a medias lo indican, y se puede empezar de cero.
- **Hecho cuando:** el menú tiene tres botones, "Más juegos" lleva a los modos,
  Clásico no aparece en esa lista, y elegir un modo con partida guardada la
  continúa.

---

## Fase D — Presentación

### P07 · Disposición en móvil
- **Archivos:** `src/components/TouchControls.tsx`, `src/App.tsx`,
  `src/sand/SandGame.tsx`.
- **Requisitos:** P7 a P12.
- **Qué hacer:** los cuatro grupos de botones se sustituyen por un único
  `TouchBar` con los cinco, en una fila inferior. Toda la información va a la
  fila superior.
- **Hecho cuando:** en móvil todo cabe sin desplazamiento a 320 × 568 px, en los
  dos modos, y en escritorio nada ha cambiado.

### P08 · Textura de la arena
- **Archivos:** `src/sand/constants.ts`, `src/sand/SandCanvas.tsx`.
- **Requisitos:** P19, P20, P21.
- **Qué hacer:** variación de brillo determinista según la posición del grano.
  Los tonos se precalculan al arrancar.
- **Hecho cuando:** las masas grandes se ven con textura y no como manchas
  planas, y la arena no parpadea al caer.

### P09 · Propagación del gris al perder
- **Archivos:** `src/sand/useSandStore.ts`, `src/sand/SandCanvas.tsx`,
  `src/sand/SandGame.tsx`.
- **Requisitos:** P22, P23, P24, P25.
- **Qué hacer:** guardar el punto de impacto y hacer crecer un radio de gris
  desde ahí. El texto de fin de partida espera a que termine.
- **Hecho cuando:** al perder, el gris se extiende desde donde la arena tocó la
  línea roja, y solo después aparece el resultado.

---

## Fase E — Cierre

### P10 · Repaso de los criterios de aceptación
- **Archivos:** ninguno.
- **Qué hacer:** recorrer los quince criterios de `spec-v6.md`, en escritorio y
  en móvil real con `npm run dev -- --host`.
- **Hecho cuando:** los quince se cumplen, o lo que falle está anotado como
  tarea nueva.

### P11 · Despliegue de la v6
- **Archivos:** ninguno.
- **Hecho cuando:** la URL pública muestra la v6 y todo funciona en el móvil.
