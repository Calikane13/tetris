# Especificación funcional — Bloques v1

> Este documento describe **qué** hace el juego, no **cómo** se programa.
> El cómo está en `plan.md`.

Versión: 1.0
Estado: pendiente de validación

---

## 1. Resumen

Juego web de piezas que caen. El jugador mueve y rota tetraminós mientras
descienden por un tablero, con el objetivo de completar filas horizontales. Cada
fila completa desaparece y suma puntos. La velocidad de caída aumenta con el
nivel. La partida termina cuando una pieza nueva no cabe al aparecer.

La aplicación es una única página estática, sin registro, sin conexión a
servidor y sin instalación.

---

## 2. Usuario y contexto de uso

Una sola persona jugando en su navegador, en sesiones cortas de entre dos y diez
minutos. Dos contextos igual de importantes:

- **Escritorio**, con teclado. Es el modo de juego principal.
- **Móvil**, en vertical, con controles táctiles en pantalla.

No hay perfiles ni sesiones. Lo que se guarda pertenece al navegador y al
dispositivo donde se jugó.

---

## 3. Alcance

### 3.1 Dentro de la v1

- Tablero de juego, siete piezas, caída por gravedad, movimiento y rotación.
- Pieza fantasma (silueta que indica dónde va a aterrizar la pieza actual).
- Vista de la siguiente pieza (una sola).
- Limpieza de líneas, puntuación, niveles y velocidad creciente.
- Pausa, fin de partida y reinicio.
- Controles de teclado en escritorio y botones táctiles en móvil.
- Guardado en el navegador de: mejor puntuación, partida en curso y ajustes.
- Panel de ajustes: sonido, mostrar u ocultar la pieza fantasma, y reasignación
  de teclas.
- Efectos de sonido sencillos.

### 3.2 Fuera de la v1

Lo indicado en la sección 6 de `constitution.md`. En particular: **no hay hold**
(guardar pieza) y **no hay sistema de rotación SRS**.

### 3.3 Supuestos pendientes de confirmar

- **S1.** Se incluye la vista de "siguiente pieza" (una única pieza). Se
  considera parte del juego clásico y su coste es bajo. Si no se quiere, se
  elimina de esta especificación antes de empezar la fase 4.
- **S2.** La cola de piezas muestra solo una pieza, no tres ni cinco.

---

## 4. Glosario

| Término | Significado |
|---|---|
| **Tetraminó** o **pieza** | Figura de cuatro celdas. Hay siete: I, O, T, S, Z, J, L. |
| **Tablero** | Rejilla donde caen las piezas. |
| **Celda** | Cuadrado individual del tablero. Puede estar vacía u ocupada por un color. |
| **Pieza activa** | La que el jugador controla en este momento. |
| **Pieza fantasma** | Silueta sin relleno que marca dónde aterrizaría la pieza activa si cayera en vertical. No ocupa espacio ni colisiona. |
| **Fijar** (*lock*) | Convertir la pieza activa en celdas permanentes del tablero. |
| **Caída suave** (*soft drop*) | Acelerar la caída manteniendo pulsada la tecla de bajar. |
| **Caída dura** (*hard drop*) | Enviar la pieza al fondo de golpe y fijarla al instante. |
| **Línea** | Fila horizontal completamente ocupada, que se elimina. |

---

## 5. Reglas del juego

### 5.1 Tablero

- **R1.** El tablero mide 10 celdas de ancho por 20 de alto. Las 20 filas son
  visibles.
- **R2.** El origen de coordenadas es la esquina superior izquierda: la fila 0 es
  la de arriba, la columna 0 la de la izquierda.

### 5.2 Piezas

- **R3.** Existen siete piezas: I, O, T, S, Z, J, L, con las formas clásicas.
- **R4.** Cada tipo de pieza tiene un color fijo y distinguible de los demás.
- **R5.** Las piezas aparecen centradas horizontalmente en la parte superior del
  tablero.

### 5.3 Generación de piezas

- **R6.** La siguiente pieza se elige al azar entre las siete.
- **R7.** No puede salir la misma pieza dos veces seguidas: si el sorteo repite
  la anterior, se vuelve a sortear una vez. Si vuelve a repetir, se acepta.
- **R8.** Siempre hay una pieza siguiente calculada y visible antes de que se
  necesite.

### 5.4 Gravedad y velocidad

- **R9.** La pieza activa baja una celda cada cierto intervalo de tiempo.
- **R10.** El intervalo en milisegundos se calcula así:
  `intervalo = máximo(80, 800 − (nivel − 1) × 70)`.
  Es decir: 800 ms en el nivel 1, 730 ms en el nivel 2, 100 ms en el nivel 11, y
  un suelo de 80 ms a partir del nivel 12.
- **R11.** La velocidad del juego no depende de la frecuencia de refresco de la
  pantalla.

### 5.5 Movimiento

- **R12.** El jugador puede mover la pieza una celda a la izquierda o a la
  derecha, siempre que la posición destino esté libre y dentro del tablero.
- **R13.** Si se mantiene pulsada una dirección, el movimiento se repite: primera
  repetición tras 170 ms, y después una cada 50 ms.
- **R14.** La caída suave baja la pieza una celda de forma inmediata y reinicia
  el contador de gravedad.
- **R15.** La caída dura baja la pieza hasta la última posición libre y la fija
  al instante, sin posibilidad de moverla después.

### 5.6 Rotación

- **R16.** El jugador puede rotar la pieza 90° en sentido horario y en sentido
  antihorario.
- **R17.** La pieza O no rota (rotarla no produce ningún cambio visible).
- **R18.** Si la rotación deja la pieza en una posición ocupada o fuera del
  tablero, se intentan, en este orden, desplazamientos laterales de 1 a la
  derecha, 1 a la izquierda, 2 a la derecha y 2 a la izquierda. Si ninguno
  funciona, la rotación se cancela y la pieza no cambia.
- **R19.** No se implementan tablas de *wall kicks* del sistema SRS. La regla
  R18 es todo el sistema de corrección que hay.

### 5.7 Pieza fantasma

- **R20.** Mientras hay una pieza activa, se muestra su fantasma en la posición
  más baja que podría alcanzar cayendo en vertical.
- **R21.** El fantasma se dibuja con la silueta o el contorno del color de la
  pieza, claramente diferenciable de una celda ocupada real.
- **R22.** El fantasma se recalcula ante cualquier movimiento o rotación.
- **R23.** Si el fantasma coincide con la posición de la pieza activa (la pieza
  ya está apoyada), no se dibuja.
- **R24.** El fantasma se puede desactivar desde los ajustes.

### 5.8 Fijado y limpieza de líneas

- **R25.** Cuando llega el momento de bajar por gravedad y la pieza no puede
  bajar, la pieza se fija en el tablero.
- **R26.** No hay margen de reposicionamiento tras tocar suelo (*lock delay*).
- **R27.** Tras fijar, se detectan las filas completas y se eliminan todas a la
  vez.
- **R28.** Las filas por encima de las eliminadas bajan tantas posiciones como
  filas se hayan eliminado.
- **R29.** Se pueden eliminar entre una y cuatro filas de una vez.
- **R30.** Tras la limpieza, aparece la pieza siguiente y se sortea una nueva.

### 5.9 Puntuación

- **R31.** Puntos por líneas eliminadas de una sola vez, multiplicados por el
  nivel actual:

  | Líneas | Puntos base |
  |---|---|
  | 1 | 100 |
  | 2 | 300 |
  | 3 | 500 |
  | 4 | 800 |

- **R32.** La caída suave suma 1 punto por celda descendida.
- **R33.** La caída dura suma 2 puntos por celda descendida.
- **R34.** La puntuación nunca baja.

### 5.10 Niveles

- **R35.** El nivel se calcula a partir del total de líneas eliminadas:
  `nivel = parte entera de (líneas totales ÷ 10) + 1`.
- **R36.** Al subir de nivel se muestra un aviso breve en pantalla.
- **R37.** No hay nivel máximo, pero la velocidad deja de aumentar a partir del
  nivel 12 (regla R10).

### 5.11 Fin de partida

- **R38.** La partida termina cuando una pieza nueva colisiona con celdas
  ocupadas en el mismo momento de aparecer.
- **R39.** Al terminar, se muestran la puntuación final, las líneas, el nivel
  alcanzado y si se ha batido el récord.
- **R40.** Al terminar, la partida guardada se borra.

### 5.12 Pausa

- **R41.** El jugador puede pausar y reanudar en cualquier momento.
- **R42.** En pausa, el tiempo no avanza y los controles de juego no responden.
- **R43.** Al pausar se guarda la partida.

---

## 6. Pantallas

La aplicación es una sola página con cuatro estados visibles:

### 6.1 Menú inicial
- Título del juego.
- Botón **Jugar** (partida nueva).
- Botón **Continuar**, visible únicamente si hay una partida guardada válida.
- Mejor puntuación registrada.
- Acceso a **Ajustes**.

### 6.2 En juego
- Tablero con la pila de celdas fijadas, la pieza activa y su fantasma.
- Panel de información: puntuación, mejor puntuación, líneas, nivel y siguiente
  pieza.
- Botón de pausa.
- En pantallas estrechas, los controles táctiles.

### 6.3 Pausa
- Capa superpuesta sobre el tablero con el texto de pausa.
- Botones: **Reanudar**, **Reiniciar**, **Salir al menú**.

### 6.4 Fin de partida
- Capa superpuesta con puntuación final, líneas y nivel.
- Aviso destacado si se ha batido el récord.
- Botones: **Jugar otra vez** y **Menú**.

### 6.5 Ajustes
- Sonido: activado o desactivado.
- Pieza fantasma: mostrar u ocultar.
- Reasignación de teclas (solo visible en escritorio).
- Botón para restaurar los valores por defecto.
- Botón para borrar la mejor puntuación, con confirmación.

---

## 7. Controles

### 7.1 Teclado (valores por defecto)

| Acción | Tecla por defecto |
|---|---|
| Mover a la izquierda | Flecha izquierda |
| Mover a la derecha | Flecha derecha |
| Caída suave | Flecha abajo |
| Caída dura | Barra espaciadora |
| Rotar en sentido horario | Flecha arriba |
| Rotar en sentido antihorario | Z |
| Pausar y reanudar | P |

- **C1.** Las teclas del juego no deben provocar el desplazamiento de la página.
- **C2.** Todas las acciones anteriores se pueden reasignar desde los ajustes,
  salvo la de pausa.
- **C3.** No se puede asignar la misma tecla a dos acciones distintas.

### 7.2 Táctil

- **C4.** En pantallas de menos de 768 px de ancho se muestran botones en
  pantalla para: izquierda, derecha, rotar, caída suave y caída dura.
- **C5.** Los botones miden al menos 44 × 44 px.
- **C6.** Mantener pulsado izquierda o derecha repite el movimiento con los
  mismos tiempos de la regla R13.
- **C7.** Pulsar los botones no debe provocar zoom, selección de texto ni rebote
  de la página.
- **C8.** En la v1 no hay gestos de deslizamiento; solo botones.

---

## 8. Persistencia

Todo se guarda en `localStorage`. Tres claves independientes:

### 8.1 Mejor puntuación
- **P1.** Se guarda un único número: la mayor puntuación alcanzada.
- **P2.** Se actualiza al terminar la partida, solo si supera la anterior.

### 8.2 Partida en curso
- **P3.** Se guarda el estado completo necesario para reanudar: contenido del
  tablero, pieza activa con su posición y rotación, pieza siguiente, puntuación,
  líneas y nivel.
- **P4.** Se guarda automáticamente cada vez que se fija una pieza, al pausar, y
  cuando la pestaña deja de estar visible.
- **P5.** Se borra al terminar la partida y al empezar una nueva desde el menú.
- **P6.** Si al arrancar existe una partida guardada válida, el menú ofrece
  **Continuar**.

### 8.3 Ajustes
- **P7.** Se guardan el estado del sonido, la visibilidad del fantasma y la
  asignación de teclas.
- **P8.** Los ajustes se aplican en cuanto se cambian, sin necesidad de guardar.

### 8.4 Reglas comunes
- **P9.** Cada valor guardado incluye un número de versión de formato.
- **P10.** Si el dato no se puede interpretar, o la versión no coincide, se
  descarta silenciosamente y se usan los valores por defecto.
- **P11.** Si `localStorage` no está disponible, el juego funciona igual pero sin
  guardar nada, y no muestra ningún error bloqueante.

---

## 9. Requisitos no funcionales

- **NF1.** La partida se mantiene fluida (sin tirones perceptibles) en un móvil
  de gama media.
- **NF2.** La aplicación funciona sin conexión una vez cargada, ya que no hace
  ninguna petición de red.
- **NF3.** Navegadores objetivo: versiones actuales de Chrome, Firefox, Safari y
  Edge, en escritorio y móvil.
- **NF4.** El juego es utilizable en vertical desde 320 px de ancho.
- **NF5.** El contraste de texto cumple el nivel AA de WCAG.
- **NF6.** Con `prefers-reduced-motion` activo se suprimen las animaciones no
  esenciales.
- **NF7.** La aplicación se despliega como sitio estático en Netlify.

---

## 10. Criterios de aceptación

Comprobaciones manuales que deben pasar antes de dar la v1 por terminada.

| ID | Criterio |
|---|---|
| CA-01 | Al pulsar Jugar aparece un tablero vacío de 10 × 20 con una pieza cayendo. |
| CA-02 | Las siete piezas aparecen a lo largo de una partida, cada una con su color. |
| CA-03 | La misma pieza no sale dos veces seguidas de forma habitual. |
| CA-04 | Las flechas izquierda y derecha mueven la pieza; no la sacan del tablero. |
| CA-05 | Mantener pulsada una dirección repite el movimiento tras una pausa breve. |
| CA-06 | Las flechas arriba y Z rotan la pieza en sentidos opuestos. |
| CA-07 | Rotar pegado a una pared desplaza la pieza si hace falta; si no cabe, no pasa nada y la pieza no se deforma. |
| CA-08 | La pieza O no cambia al rotar. |
| CA-09 | El fantasma se ve siempre en la posición correcta de aterrizaje y se actualiza al mover y al rotar. |
| CA-10 | La barra espaciadora fija la pieza abajo al instante, en la misma posición que marcaba el fantasma. |
| CA-11 | Completar una fila la elimina y baja las de arriba. |
| CA-12 | Completar cuatro filas de golpe suma 800 puntos multiplicados por el nivel. |
| CA-13 | Tras 10 líneas se pasa al nivel 2 y las piezas caen visiblemente más rápido. |
| CA-14 | La puntuación mostrada coincide con las reglas de la sección 5.9. |
| CA-15 | Llenar el tablero hasta arriba termina la partida y muestra el resumen. |
| CA-16 | Superar la mejor puntuación la actualiza, y sigue ahí tras recargar la página. |
| CA-17 | Pausar detiene la caída; los controles de juego dejan de responder. |
| CA-18 | Cerrar la pestaña a media partida y volver a abrirla ofrece Continuar, y al continuar el tablero y la puntuación son los mismos. |
| CA-19 | Empezar una partida nueva desde el menú borra la partida guardada. |
| CA-20 | En una ventana de 360 px de ancho el tablero se ve entero y los botones táctiles funcionan. |
| CA-21 | Los botones táctiles no provocan zoom ni desplazamiento de la página. |
| CA-22 | Desactivar el fantasma en ajustes lo oculta de inmediato, y sigue oculto tras recargar. |
| CA-23 | Cambiar una tecla en ajustes surte efecto en la siguiente partida y persiste tras recargar. |
| CA-24 | Desactivar el sonido silencia todos los efectos. |
| CA-25 | Con datos corruptos en `localStorage`, la aplicación arranca con valores por defecto y sin errores en consola. |
| CA-26 | `npm run build` termina sin errores de TypeScript. |