# Bloque a Bloque

Juego de bloques que caen, hecho con desarrollo guiado por especificación.

**Jugar:** https://calikane13.github.io/tetris/

---

## Qué es

Un juego de piezas que caen, en el navegador, que funciona igual con teclado en
escritorio y con los dedos en móvil. Sin backend, sin cuentas, sin base de
datos: todo se guarda en el propio navegador.

Es un proyecto personal de aprendizaje, construido en cuatro versiones, cada una
con su especificación escrita antes que el código.

---

## Qué tiene

**Cinco modos de juego**

| Modo | De qué va | Marca |
|---|---|---|
| Clásico | Hasta que se llene el tablero | Puntuación |
| Sprint | 40 líneas lo más rápido posible | Tiempo |
| Ultra | Máxima puntuación en 3 minutos | Puntuación |
| Nivel fijo | Empieza a la velocidad que elijas, del 1 al 15 | Puntuación por nivel |
| Cero gravedad | Las piezas no caen solas | Sin marca |

**Juego**
- Las siete piezas clásicas, con rotación y desplazamiento contra las paredes
- Pieza fantasma que marca dónde va a aterrizar la actual
- Caída suave y caída rápida
- Puntuación por líneas, niveles cada 10 líneas, y velocidad creciente
- Combos: encadenar eliminaciones da puntos extra, con tres piezas de margen

**Interfaz**
- Cinco estilos de bloque: Relieve, Plano y Gel disponibles desde el principio;
  Neón y Retro se desbloquean jugando
- Barrido de luz al completar línea, amarillo si forma parte de una racha
- Avisos de subida de nivel, de combo y de estilo desbloqueado
- Cronómetro en Sprint y Ultra
- El tablero se apaga en grises al perder
- Controles táctiles repartidos alrededor del tablero en móvil

**Se recuerda entre sesiones**
- Una marca por cada modo de juego
- La partida en curso, con su modo, para reanudarla
- Ajustes: sonido, pieza fantasma, estilo de bloque y teclas reasignables
- Estilos desbloqueados

**Accesibilidad**
- Los cambios de estado se anuncian para lectores de pantalla
- Se respeta `prefers-reduced-motion`
- Ningún estado se comunica solo por color

---

## Stack

React, TypeScript, Vite, Tailwind v4 y Zustand. Sin librerías de juego: el
motor, las colisiones, la rotación y la puntuación están escritos a mano.

El sonido se genera con la Web Audio API y el logo es SVG, así que el proyecto
no tiene ni un solo archivo de imagen o audio.

---

## Documentación

Todo en `docs/`, y esto es lo interesante del proyecto:

| Archivo | Qué contiene |
|---|---|
| `constitution.md` | Principios que no se negocian. Gana sobre todo lo demás |
| `spec.md`, `plan.md`, `tasks.md` | Versión 1: el juego funcionando |
| `spec-v2.md`, `plan-v2.md`, `tasks-v2.md` | Versión 2: pulido visual |
| `spec-v3.md`, `plan-v3.md`, `tasks-v3.md` | Versión 3: combos e identidad |
| `spec-v4.md`, `plan-v4.md`, `tasks-v4.md` | Versión 4: modos, sonido y estilos |
| `cierre-v3.md`, `cierre-v4.md` | Qué salió mal y qué se aprendió |
| `ideas-futuras.md` | Lo que queda por hacer, sin especificar todavía |

El orden siempre es el mismo: primero la especificación, luego el plan técnico,
luego las tareas, y solo entonces el código.

---

## Desarrollo

```bash
npm install
npm run dev
```

Para probar en el móvil sin desplegar, con ambos dispositivos en el mismo wifi:

```bash
npm run dev -- --host
```

Y usar la dirección que aparece como `Network`.

Antes de dar por terminada cualquier tarea:

```bash
npm run build
```

---

## Despliegue

GitHub Pages, mediante el workflow de `.github/workflows/deploy.yml`. Cada push
a `main` construye y publica automáticamente.

**Nota sobre la ruta base:** GitHub Pages sirve el sitio en una subcarpeta con
el nombre del repositorio, así que `vite.config.ts` tiene `base: '/tetris/'`.
Si algún día se despliega en la raíz de un dominio, hay que volver a poner `/`.

Antes se usó Netlify (créditos agotados) y Cloudflare (migración de Workers a
Pages a medias). El `netlify.toml` sigue en el repositorio por si vuelve a
hacer falta.