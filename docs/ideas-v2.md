# Ideas para la v2

Lista en bruto recogida al cerrar la v1. **No es un spec**: no hay reglas
definidas ni criterios de aceptación todavía. El siguiente paso es convertir
esto en un `spec-v2.md`, decidiendo alcance y dejando fuera lo que no entre.

La v1 queda intacta y publicada. Nada de aquí se toca hasta que haya spec.

---

## Presentación y pulido

**1. Animación de subida de nivel más visual**
La actual es un cartel que aparece y se va. Pendiente decidir dirección:
destello, barrido sobre el tablero, número a pantalla completa.
Solo interfaz.

**2. Animación al completar líneas**
Ahora desaparecen de golpe, sin aviso visual. Es lo que más se nota que falta.
Requiere retener las filas completas un instante antes de borrarlas, así que
**toca el store**, no solo el CSS.

**3. Puntuación y récord: reubicar y dar presencia**
Pendiente decidir posición, y puede ser distinta en escritorio y en móvil.

**8. Animación al perder**
Ahora el tablero se congela sin transición. Referencia vista: el tablero se
apaga y desatura, el texto aparece encima con la puntuación grande.

**9. Cambiar el sonido**
Los actuales son osciladores puros, secos y retro. Decisión pendiente: mejorarlos
manteniéndolos generados, o pasar a archivos de audio, lo que **obligaría a
revisar la restricción C3** de la constitución. Posible música de fondo.

**10. Menú más visual**
Con varios modos, el menú deja de ser una pantalla de paso: pasa a ser donde se
elige modo, se ven los récords de cada uno y se entra a ajustes. Necesita
estructura, no solo adornos.

**11. Cambiar el título**
Con arena y chuches, un nombre que hable de bloques cayendo se queda corto.

**12. Hacer un logo**
En SVG, para no chocar con la restricción C3 (sin assets externos). También hace
falta para el icono de la pestaña, que sigue siendo el de Vite.

**13. Bloques más visuales**
Ahora son color plano con esquinas redondeadas. Referencia: textura moteada y
borde oscuro, que se consigue solo con CSS.

**14. Varios estilos de bloque**
Decisión pendiente: ¿ajuste normal o desbloqueo por juego? Nota técnica: los
colores son clases literales de Tailwind en `constants.ts`, así que cada estilo
necesita su propio mapa completo.

---

## Reglas

**4. Combos**
Los dos sistemas conviviendo:
- **Consecutivos**: piezas seguidas haciendo línea suben multiplicador; fallar
  lo rompe.
- **Simultáneos**: ya existe, pero con nombres y animación distinta según sean
  1, 2, 3 o 4 líneas. Cuatro de golpe es el máximo.

Cada combo con su animación. **Cambia reglas: toca `spec.md` (R31–R33) antes de
tocar código.** Evitar nombres registrados ("Tetris", "T-Spin").

---

## Modos nuevos

**5. Modos clásicos**
Sprint (40 líneas contrarreloj), Ultra (puntuación en tiempo fijo), nivel fijo,
cero gravedad. Los más baratos: solo cambian la condición de fin. Cada uno
necesita su propio récord guardado.

**6. Modo chuches**
Bloques con caramelos especiales. Definido:
- Lo común es **una celda especial dentro de una pieza normal**; a veces toca una
  pieza entera especial.
- Cuatro efectos: **rayo horizontal, rayo vertical, bomba 3×3, y color** (borra
  todas las celdas del mismo tipo).
- Se disparan **al completar línea** con ellas, no al fijarlas.
- **Encadenan**, y la propagación es lo importante: el rayo sale en las dos
  direcciones desde su origen y **viaja**; cuando su frente alcanza otra chuche,
  esa estalla en ese momento mientras el rayo sigue avanzando. La bomba se
  expande desde su centro.
- Los efectos tienen **posición y velocidad**, no son borrados instantáneos.

Nota técnica: el tablero tendría que guardar más que el tipo de pieza por celda.
Es un cambio en los tipos base que arrastra a todo el motor.

**7. Modo arena**
- Las piezas **se desmoronan en granos** al fijarse.
- Los granos **resbalan en diagonal**, no solo caen en vertical (confirmado en
  las capturas: se forman laderas, no columnas).
- Se elimina la **masa conectada del mismo color que toque las dos paredes**,
  tenga la forma que tenga. Al conectar, la masa se vuelve blanca antes de
  desaparecer.
- **Los colores se desbloquean por puntuación** (naranja a 10k, morado a 30k).
  Cada color nuevo hace el juego más difícil sin cambiar velocidad ni reglas:
  más variedad significa montones más fragmentados. Buena curva de dificultad.
- Límite superior marcado con una línea roja.

Nota: el juego de referencia **no tiene piezas que caen**, sino una bandeja de
tres piezas que se colocan libremente. **Decisión pendiente:** copiar esa
mecánica (más fiel y probablemente más divertido) o adaptarlo a piezas que caen
para reaprovechar el motor (bastante menos trabajo).

Requiere una rejilla mucho más fina: cada bloque se descompone en varios granos.

**15. Modo 3D**
Aparcado por decisión propia, a valorar al terminar la v2.

De cara al jugador es un modo más, con el mismo menú y los mismos ajustes. Por
dentro no reutiliza casi nada: tablero volumétrico, 24 orientaciones de rotación
en vez de 4, renderizado con WebGL (lo que choca con la lista blanca de
dependencias), controles en tres ejes más cámara, y eliminación por planos.

Aviso de diseño: los Tetris en 3D existen desde hace décadas y casi ninguno
funciona bien, porque cuesta juzgar la profundidad.

---

## Trabajo de fondo compartido

Los puntos **2, 4 y 6** necesitan lo mismo: **un sistema de animaciones por fases
que el store sepa esperar**. Ahora mismo todo es instantáneo. Conviene
construirlo una vez y bien, porque es lo que sostiene las tres cosas.

Riesgos conocidos del encadenado: bucles infinitos (se resuelve con un tope de
iteraciones) y animaciones que se solapan sin que el jugador entienda qué pasó.
