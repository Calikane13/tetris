# spec-v2.md — Pulido visual

Segunda versión de Bloques. Alcance deliberadamente pequeño: **solo presentación**.
No cambia ninguna regla del juego.

La v1 queda como está, publicada y funcionando. Este documento describe lo que se
añade encima. Donde no diga lo contrario, todo lo de `spec.md` sigue vigente.

Versión: 2.0
Estado: propuesta

---

## 1. Por qué esta versión

El juego funciona pero se siente sordo: las líneas desaparecen sin avisar, morir
no tiene peso, y la puntuación está escondida en un lateral. Nada de eso es un
error, pero es la diferencia entre algo que funciona y algo que apetece jugar.

Se eligen cinco cambios de la lista de ideas (puntos 1, 2, 3, 8 y 13). Los demás
esperan a la v3.

**El punto 2 (animación de línea) es el más importante y no por lo que se ve:**
obliga a construir un sistema de animaciones por fases que la v3 necesitará para
los combos y las chuches. Es la inversión de fondo de esta versión.

---

## 2. Fuera de alcance

Se rechazan sin discusión en la v2:

- Combos, modos de juego nuevos, chuches, arena, 3D
- Cambios en el sonido y música de fondo
- Cambio de título y logo
- Varios estilos de bloque a elegir (aquí se cambia el estilo, no se hace
  seleccionable)
- Rediseño del menú

---

## 3. Requisitos

### 3.1 Sistema de animaciones (base técnica)

- **V1.** El estado de la partida gana una fase intermedia entre "la pieza se
  fija" y "las líneas desaparecen". Durante esa fase el juego no acepta entrada
  y la gravedad está detenida.
- **V2.** La fase dura un tiempo fijo definido en `constants.ts` y termina sola.
  El jugador no tiene que hacer nada.
- **V3.** Si el navegador tiene `prefers-reduced-motion` activo, las fases siguen
  existiendo pero con duración mínima, de forma que el juego se comporte igual
  sin movimiento en pantalla.
- **V4.** Ninguna animación puede dejar la partida bloqueada. Si algo falla, el
  juego continúa.

### 3.2 Animación de línea completada

- **V5.** Al completar una o más líneas, un **barrido de luz recorre cada fila
  completa de lado a lado** antes de que desaparezca.
- **V6.** El barrido parte del borde izquierdo y avanza hacia el derecho.
- **V7.** Las filas se limpian cuando el barrido termina, no antes.
- **V8.** Con varias filas a la vez, el barrido ocurre en todas simultáneamente,
  no una detrás de otra.
- **V9.** Duración objetivo: entre 250 y 350 ms. Lo bastante para verse, lo
  bastante poco para no entorpecer a velocidad alta.

### 3.3 Aspecto de los bloques

- **V10.** Cada bloque pasa de color plano a **relieve**: borde claro arriba e
  izquierda, borde oscuro abajo y derecha, relleno en el color actual.
- **V11.** Los siete colores de pieza no cambian. Solo se añaden los tonos claro
  y oscuro de cada uno.
- **V12.** Las clases de Tailwind siguen siendo literales, nunca construidas al
  vuelo (mismo motivo que en la v1: el analizador de Tailwind no las
  encontraría).
- **V13.** La pieza fantasma mantiene su contorno hueco y **no lleva relieve**,
  para que siga distinguiéndose de un bloque real de un vistazo.
- **V14.** El recuadro de siguiente pieza usa el mismo estilo que el tablero.

### 3.4 Puntuación y récord

- **V15.** La puntuación y el récord se mueven **encima del tablero**, en
  escritorio y en móvil.
- **V16.** La puntuación va en grande y es el elemento dominante de esa zona.
- **V17.** El récord va al lado, más pequeño, precedido de un **icono de corona**.
- **V18.** La corona es un SVG dibujado en el código, no una imagen ni un emoji
  (restricción C3 de la constitución).
- **V19.** Líneas y nivel se quedan donde están.
- **V20.** El recuadro de siguiente pieza se queda donde está.
- **V21.** Al superar el récord durante la partida, el marcador del récord lo
  refleja en el momento, sin esperar al fin de partida.

  *Nota: esto cambia el comportamiento de la v1, donde el récord solo se
  actualizaba al perder. El guardado en localStorage sigue ocurriendo solo al
  final; lo que cambia es lo que se muestra.*

### 3.5 Fin de partida

- **V22.** Al perder, el tablero **se apaga y desatura progresivamente** hasta
  quedar en grises.
- **V23.** Sobre el tablero apagado aparece el texto de fin de partida, la
  puntuación en grande, y debajo el récord con su corona.
- **V24.** Si la partida ha establecido un récord nuevo, se indica con texto, no
  solo con color (criterio C2 de la constitución).
- **V25.** El botón de volver a jugar aparece cuando la animación termina, para
  que nadie lo pulse por accidente a media transición.
- **V26.** Duración objetivo de la transición: entre 600 y 900 ms.

### 3.6 Aviso de subida de nivel

- **V27.** El aviso actual se sustituye por uno más visible.
- **V28.** Sigue desapareciendo solo y sin bloquear el juego, como en la v1
  (regla R36).
- **V29.** Sigue respetando `prefers-reduced-motion`: aparece igual, sin
  movimiento.

---

## 4. Criterios de aceptación

La v2 está terminada cuando:

1. Al completar una línea se ve el barrido antes de que desaparezca, y el juego
   sigue con normalidad después.
2. Un Tetris de cuatro líneas anima las cuatro a la vez.
3. Los bloques tienen relieve y se distinguen bien unos de otros con el tablero
   lleno.
4. El fantasma sigue siendo inconfundible con un bloque real.
5. Puntuación y récord están encima del tablero, con la corona, y se leen bien en
   un móvil de 320 px.
6. El récord se actualiza en pantalla en cuanto se supera.
7. Al perder, el tablero se apaga y aparece el resultado.
8. Con `prefers-reduced-motion` activo, todo funciona sin movimiento y sin
   quedarse bloqueado.
9. Una partida completa en móvil real, sin errores en consola.
10. `npm run build` limpio.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| La fase de animación bloquea la partida si algo falla | V4: cualquier fallo devuelve el juego a estado jugable |
| A nivel alto, 300 ms por línea se hace pesado | Medir jugando. Si molesta, acortar en `constants.ts`, que es un solo número |
| El relieve reduce el contraste entre piezas contiguas | Criterio 3: revisar con el tablero lleno, no vacío |
| Mover la puntuación arriba deja sin sitio al tablero en móvil | Criterio 5: probar a 320 px antes de dar por buena la tarea |
| Cuatro tonos por pieza multiplican las clases literales | Un solo mapa en `constants.ts`, revisado con `npm run build` y vista previa, no solo en desarrollo |
