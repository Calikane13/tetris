# spec-v4.md — Modos de juego, sonido y estilos

Cuarta versión. Tres bloques independientes entre sí: varios modos de juego,
sonidos nuevos, y estilos de bloque a elegir.

Las versiones anteriores quedan como están. Donde no diga lo contrario, todo lo
de `spec.md`, `spec-v2.md` y `spec-v3.md` sigue vigente.

Versión: 4.0
Estado: propuesta

---

## 1. Por qué esta versión

**Los modos** son lo que da vida larga al juego. Ahora solo hay una forma de
jugar, y siempre empieza igual: lento, hasta que el nivel sube. Sprint y Ultra
dan partidas cortas con una marca que batir, y nivel fijo permite ir directo a
la velocidad que te interesa.

Además, esta versión monta la infraestructura de "el juego tiene modos", que es
lo que después necesitarán el modo chuches y el de arena. Se hace ahora con los
modos baratos, donde equivocarse cuesta poco.

**El sonido** actual son osciladores puros: cumplen, pero suenan a pitido de
consola vieja y cansan.

**Los estilos** dan algo que perseguir más allá de la puntuación.

---

## 2. Fuera de alcance

Se rechazan sin discusión en la v4:

- Modo chuches, modo arena, modo 3D
- Música de fondo
- Tabla de récords online o comparación con otros jugadores
- Estadísticas o historial de partidas

---

## 3. Requisitos

### 3.1 Los modos

- **M1.** Hay cinco modos: **Clásico**, **Sprint**, **Ultra**, **Nivel fijo** y
  **Cero gravedad**.
- **M2.** El modo se elige desde el menú antes de empezar. No se puede cambiar a
  media partida.
- **M3.** Todas las reglas de juego (piezas, rotación, colisiones, líneas,
  combos) son idénticas en todos los modos, salvo donde se diga lo contrario.
- **M4.** La partida guardada recuerda en qué modo se estaba, y al reanudar
  vuelve a ese modo.

**Clásico**
- **M5.** Es el juego tal y como está hoy: empieza en nivel 1 y termina al
  llenarse el tablero. Sin límite de tiempo ni de líneas.

**Sprint**
- **M6.** El objetivo es eliminar **40 líneas** lo más rápido posible.
- **M7.** Un cronómetro cuenta hacia arriba desde el inicio de la partida.
- **M8.** La partida termina al llegar a 40 líneas, y el resultado es el tiempo.
- **M9.** También termina si se llena el tablero, y en ese caso no hay marca.
- **M10.** El nivel sube igual que en el clásico, así que la velocidad aumenta
  durante la partida.

**Ultra**
- **M11.** El objetivo es hacer la máxima puntuación en **3 minutos**.
- **M12.** Un cronómetro cuenta hacia atrás desde 3:00.
- **M13.** La partida termina al llegar a cero, y el resultado es la puntuación.
- **M14.** También termina si se llena el tablero antes, y la puntuación
  alcanzada sí cuenta.

**Nivel fijo**
- **M15.** Antes de empezar se elige un nivel del **1 al 15**.
- **M16.** La partida arranca en ese nivel, con su velocidad correspondiente.
- **M17.** El nivel sigue subiendo con las líneas, igual que en el clásico.
- **M18.** Termina al llenarse el tablero.

**Cero gravedad**
- **M19.** Las piezas **no caen solas**. Solo bajan cuando el jugador lo pide.
- **M20.** Todo lo demás funciona igual: mover, rotar, fijar, líneas, puntuación.
- **M21.** Termina al llenarse el tablero.
- **M22.** Este modo **no guarda récord**: sin límite de tiempo ni de gravedad,
  una marca alta solo significa haber jugado mucho rato.

### 3.2 Récords por modo

- **M23.** Cada modo que termina guarda su propia marca, independiente de los
  demás.
- **M24.** La marca de Clásico, Ultra y Nivel fijo es la **puntuación** (mayor es
  mejor). La de Sprint es el **tiempo** (menor es mejor).
- **M25.** Nivel fijo guarda una marca por cada nivel de inicio, no una sola.

  *Justificación: empezar en el nivel 12 es mucho más difícil que en el 2, y una
  marca conjunta no diría nada.*

- **M26.** El menú muestra la marca del modo seleccionado.
- **M27.** Cero gravedad no muestra marca (regla M22).
- **M28.** Los récords existentes de la v3 se conservan como marca del modo
  Clásico.

### 3.3 Cronómetro

- **M29.** En Sprint y Ultra, el cronómetro se ve durante toda la partida.
- **M30.** El tiempo se muestra como minutos y segundos, con centésimas en
  Sprint (donde la precisión importa para comparar marcas).
- **M31.** El cronómetro se detiene al pausar y se reanuda al continuar.
- **M32.** En Ultra, el último **10 segundos** se destaca visualmente.

### 3.4 Sonidos nuevos

- **M33.** Los efectos actuales se sustituyen por otros **más suaves y
  agradables**, menos parecidos a un pitido.
- **M34.** Siguen generándose con la Web Audio API, sin archivos de audio
  (restricción C3 de la constitución).
- **M35.** Cada acción sigue teniendo su sonido propio y distinguible: mover,
  rotar, fijar, caída rápida, línea, combo, subir nivel, fin de partida.
- **M36.** El interruptor de sonido de los ajustes sigue funcionando igual.
- **M37.** El volumen general es más bajo que el actual: los sonidos frecuentes
  (mover, rotar) deben poder oírse muchas veces seguidas sin cansar.

### 3.5 Estilos de bloque

- **M38.** Hay **cinco estilos**: Relieve (el actual), Plano, Gel, Neón y Retro.
- **M39.** Relieve, Plano y Gel están disponibles desde el principio.
- **M40.** Neón se desbloquea al superar **10.000 puntos** en Clásico.
- **M41.** Retro se desbloquea al **completar un Sprint** (llegar a 40 líneas).
- **M42.** El estilo se elige en los ajustes, y se aplica al tablero y al
  recuadro de siguiente pieza.
- **M43.** Los estilos bloqueados se muestran en la lista, con la condición para
  conseguirlos.
- **M44.** Al desbloquear un estilo se avisa en pantalla.
- **M45.** El estilo elegido y los desbloqueados se guardan y sobreviven al
  cierre del navegador.
- **M46.** Los colores de las siete piezas no cambian entre estilos: cambia
  cómo se dibuja el bloque, no de qué color es cada pieza.

### 3.6 Menú

- **M47.** El menú permite elegir modo antes de jugar.
- **M48.** Muestra la marca del modo seleccionado, con la corona.
- **M49.** En Nivel fijo, permite elegir el nivel de inicio.
- **M50.** Sigue cabiendo sin desplazamiento en una pantalla de 320 × 568 px.

---

## 4. Criterios de aceptación

La v4 está terminada cuando:

1. Se puede elegir cada uno de los cinco modos desde el menú y jugarlos.
2. Sprint termina exactamente a las 40 líneas y muestra el tiempo.
3. Ultra termina a los 3 minutos y muestra la puntuación.
4. Nivel fijo arranca a la velocidad del nivel elegido.
5. En Cero gravedad las piezas no bajan solas y sí responden a los controles.
6. Cada modo muestra su propia marca, y Cero gravedad no muestra ninguna.
7. El récord del modo Clásico es el que ya existía antes de la v4.
8. Los sonidos son más suaves y se distinguen entre sí.
9. Se pueden elegir los tres estilos libres, y los bloqueados indican su
   condición.
10. Al superar 10.000 puntos en Clásico se desbloquea Neón y se avisa.
11. Reanudar una partida guardada vuelve al modo correcto.
12. Todo lo anterior funciona en un móvil real, sin errores en consola, y el
    menú cabe sin desplazamiento a 320 px.
13. `npm run build` limpio.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cambiar el formato de guardado rompe partidas y récords existentes | M28: los datos de la v3 se leen y se convierten. Se prueba con datos reales antes de dar la tarea por hecha |
| Cinco modos multiplican los caminos de código y las cosas que se rompen | Regla M3: el motor es el mismo para todos. Solo cambian el inicio y la condición de fin |
| El cronómetro se desincroniza al pausar o al ocultar la pestaña | M31, y usar el mismo bucle que ya gestiona la gravedad, no un temporizador aparte |
| Cinco estilos multiplican por cinco las clases literales de Tailwind | Un mapa por estilo en `constants.ts`. Verificar con `npm run build` y vista previa, no solo en desarrollo |
| El menú no cabe con selector de modo, nivel y marca | M50: probar a 320 px antes de cerrar la tarea. Si no cabe, el selector de nivel va en una pantalla aparte |
| Los sonidos suaves no se oyen sobre el ruido de un móvil | Probar en un móvil real, no con auriculares |
