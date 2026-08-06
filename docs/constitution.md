# Constitución del proyecto — Bloques

> Documento de gobierno. Manda sobre `spec.md`, `plan.md` y `tasks.md`.
> Si una decisión técnica choca con un principio de aquí, gana el principio
> o se modifica este documento de forma explícita.

Versión: 1.0
Fecha: agosto 2026

---

## 1. Propósito

Construir un juego de bloques que caen (estilo Tetris clásico) como aplicación
web estática, jugable en escritorio y en móvil, sin servidor.

El proyecto tiene un segundo propósito igual de importante: ser un ejercicio de
desarrollo guiado por especificación. La especificación se escribe antes que el
código, y el código no se adelanta a la especificación.

---

## 2. Principios

### P1 — Simplicidad antes que completitud
Ante dos soluciones que cumplen el requisito, se elige la que un principiante
pueda leer y entender en una sentada. Se prefiere código explícito y algo más
largo a código ingenioso y corto.

*Consecuencia práctica:* nada de abstracciones "por si acaso". No se crea una
interfaz genérica hasta que haya dos implementaciones reales.

### P2 — La lógica del juego es pura y vive fuera de React
Todas las reglas (rotar, colisionar, fijar, limpiar líneas, puntuar) se
implementan como funciones puras en `src/engine/`. Esos archivos **no importan
React, ni Zustand, ni nada del navegador**.

*Por qué:* se puede razonar sobre ellas, probarlas en la consola y cambiarlas sin
tocar la interfaz. Es la decisión que más dolor evita más adelante.

*Regla verificable:* si `grep -r "react" src/engine/` devuelve algo, se ha roto
este principio.

### P3 — Una sola fuente de verdad
El estado de la partida vive en un único store de Zustand. Los componentes leen
de él y despachan acciones. No se duplica estado del juego en `useState` de
componentes.

*Excepción permitida:* estado puramente visual y local (por ejemplo, si un panel
de ajustes está desplegado).

### P4 — TypeScript estricto
`strict: true`. Prohibido `any`. Prohibido `@ts-ignore`. Si el tipo no sale,
el diseño está mal y se replantea, no se silencia el compilador.

### P5 — Sin backend y sin dependencias nuevas
El proyecto es 100 % estático. No hay servidor, ni base de datos, ni cuentas de
usuario.

Lista blanca de dependencias de producción:

- `react`, `react-dom`
- `zustand`

Todo lo demás (herramientas de build, Tailwind, TypeScript) es dependencia de
desarrollo. **Cualquier dependencia fuera de esta lista requiere modificar esta
constitución primero**, justificando por qué no se puede resolver con lo que ya
hay. Iconos, animaciones, sonido y gestos táctiles se resuelven a mano.

### P6 — Los datos externos no son de fiar
Todo lo que se lee de `localStorage` se valida antes de usarse. Si el formato no
cuadra o la versión no coincide, se descarta y se sigue con los valores por
defecto. Un dato corrupto nunca debe romper el arranque de la aplicación.

### P7 — Móvil desde el principio, no al final
Cualquier función que se pueda hacer con teclado tiene que poder hacerse con el
dedo. El soporte táctil no es una fase de maquillaje al final: forma parte del
criterio de "hecho" de las funciones jugables.

### P8 — El bucle de juego manda sobre el reloj, no sobre los fotogramas
La caída de las piezas se calcula con tiempo transcurrido acumulado, no contando
fotogramas. El juego debe ir a la misma velocidad en una pantalla de 60 Hz que en
una de 120 Hz.

### P9 — Accesibilidad mínima obligatoria
- Ningún botón sin etiqueta accesible.
- El estado del juego (puntuación, nivel, fin de partida) se anuncia a lectores
  de pantalla mediante una región `aria-live`.
- El color nunca es el único portador de información.
- Se respeta `prefers-reduced-motion`.

### P10 — Cambios pequeños y verificables
Cada tarea de `tasks.md` deja el proyecto en un estado que compila y arranca.
No se acumulan cinco tareas antes de probar nada.

---

## 3. Cómo trabajamos

Estas reglas describen la colaboración concreta de este proyecto.

1. **Archivos completos.** Cada entrega es el contenido íntegro de un archivo,
   con su ruta indicada arriba. Nunca fragmentos del tipo "y aquí añade esto".
   El archivo se pega entero, reemplazando el anterior.

2. **Una tarea cada vez.** Se trabaja siguiendo el orden de `tasks.md`. Se
   completa una tarea, se prueba, y solo entonces se pasa a la siguiente.

3. **Preguntar antes de inventar.** Si una tarea depende de algo que la
   especificación no define, se pregunta. No se rellena el hueco con una
   suposición silenciosa.

4. **Los cambios de alcance empiezan por el documento.** Si a mitad del proyecto
   surge una idea nueva, primero se edita `spec.md` (y `tasks.md` si toca), y
   después se escribe el código. Nunca al revés.

5. **Idiomas.** El código (nombres de variables, funciones, archivos, tipos) va
   en inglés. Los textos visibles para el jugador y los comentarios van en
   español.

6. **Sin código muerto.** No se deja código comentado "por si acaso". El
   historial de Git ya guarda lo que se borró.

---

## 4. Definición de "hecho"

Una tarea está hecha cuando **todas** estas condiciones se cumplen:

- `npm run build` termina sin errores ni avisos de TypeScript.
- La aplicación arranca con `npm run dev` y no hay errores en la consola del
  navegador.
- El criterio de aceptación escrito en la tarea se puede comprobar a mano.
- Si la tarea afecta a algo jugable, se ha probado con teclado **y** con el ratón
  o el dedo en una ventana estrecha (≤ 420 px de ancho).
- Se ha hecho un commit con un mensaje que empieza por el identificador de la
  tarea. Ejemplo: `T14: bucle de gravedad con acumulador de tiempo`.

---

## 5. Restricciones fijas

Estas decisiones están cerradas y no se replantean durante la v1:

| Área | Decisión |
|---|---|
| Framework | React 18 con TypeScript |
| Empaquetador | Vite |
| Estilos | Tailwind CSS |
| Estado | Zustand |
| Backend | Ninguno |
| Persistencia | `localStorage` del navegador |
| Despliegue | Netlify (sitio estático) |
| Renderizado del tablero | DOM con CSS Grid (no `<canvas>`) |

---

## 6. Fuera de alcance permanente en la v1

Lo siguiente no se construye en esta versión, aunque sea tentador. Queda
registrado aquí para que la conversación no se repita:

- Guardar la pieza (*hold*).
- Sistema de rotación SRS con tablas de *wall kicks*.
- Multijugador, tablas de clasificación en línea, cuentas de usuario.
- Modos de juego alternativos (Sprint, Ultra, contrarreloj).
- Música. Sí habrá efectos de sonido sencillos.
- Animaciones elaboradas de limpieza de líneas.
- Tests automatizados. El motor es puro y verificable a mano; se añadirán en una
  versión posterior si el proyecto crece.

---

## 7. Modificación de esta constitución

Este documento se puede cambiar, pero nunca de forma implícita. Un cambio
requiere: subir el número de versión, escribir qué cambia y por qué, y revisar si
`spec.md` y `plan.md` siguen siendo coherentes.
