# spec-v6.md — Correcciones y pulido

Sexta versión. La primera que no añade modos: arregla fallos encontrados
jugando y pule lo que ya existe.

Las versiones anteriores quedan como están. Donde no diga lo contrario, todo lo
de `spec.md`, `spec-v2.md`, `spec-v3.md`, `spec-v4.md` y `spec-v5.md` sigue
vigente.

Versión: 6.0
Estado: propuesta

---

## 1. Por qué esta versión

Cinco versiones seguidas añadiendo cosas dejan deuda. Esta versión la paga.

Lo que hay aquí no salió de una lista de ideas: salió de **jugar**. Un combo que
se queda pillado en pantalla, un truco que rompe el modo arena martilleando un
botón, y una disposición en móvil que se ha ido complicando a base de parches.

Ninguno de estos fallos aparecía en los criterios de aceptación de sus
versiones, y eso es lo interesante: los tres se cumplían sobre el papel.

---

## 2. Fuera de alcance

Se rechazan sin discusión en la v6:

- Modo chuches y modo 3D
- Modos de juego nuevos de cualquier tipo
- Cambios en el sonido
- Accesibilidad del modo arena (queda pendiente y anotada, ver sección 6)

---

## 3. Requisitos

### 3.1 Combos con líneas simultáneas

- **P1.** La racha de combo sube **tantos puntos como líneas se eliminen a la
  vez**, no uno por pieza.
- **P2.** Eliminar cuatro líneas de golpe pone la racha en 4 directamente,
  aunque sea la primera pieza que elimina algo.
- **P3.** El resto de reglas del combo no cambian: la racha se rompe tras tres
  piezas sin eliminar (regla C3), y el extra sigue siendo `50 × racha × nivel`
  (regla C8).

  *Consecuencia esperada: un cuádruple pasa a valer mucho más, que es lo
  razonable siendo la jugada más difícil del juego.*

### 3.2 El cartel de combo se queda pillado

- **P4.** El cartel de combo debe desaparecer siempre después de su tiempo, sin
  excepción.
- **P5.** Si la racha vuelve a subir mientras el cartel está visible, se muestra
  el valor nuevo y el tiempo se reinicia.
- **P6.** Empezar una partida nueva oculta cualquier cartel pendiente.

  *El fallo: el temporizador que oculta el cartel vive en un efecto que depende
  del bono, y cuando ese valor cambia antes de tiempo, React cancela el
  temporizador sin volver a programarlo. El cartel se queda para siempre. Se
  quedaba en x2 porque es el primer combo que puede mostrarse.*

### 3.3 Disposición en móvil

- **P7.** En móvil, **toda la información va en una fila superior**: puntuación,
  récord, líneas, nivel y siguiente pieza.
- **P8.** Los **cinco botones van juntos en una fila inferior**, centrados.
- **P9.** El tablero ocupa todo el ancho disponible entre ambas filas.
- **P10.** Todo cabe sin desplazamiento en una pantalla de 320 × 568 px.
- **P11.** En escritorio no cambia nada: el HUD sigue en su columna lateral.
- **P12.** El modo arena usa la misma disposición.

### 3.4 Equilibrio del modo arena

- **P13.** El modo arena empieza con **cuatro colores** en lugar de tres.
- **P14.** Los umbrales de los colores restantes se mantienen.

  *El fallo: con tres colores, martillear la caída dura formaba masas de pared a
  pared sin buscarlas, y como al eliminar cae lo de arriba, encadenaba solo.
  Cuatro colores bajan mucho esa probabilidad.*

- **P15.** Si se usa la **caída dura en tres o más piezas seguidas sin mover ni
  rotar**, cada eliminación resultante **resta 100 puntos** en lugar de sumar.
- **P16.** El contador de caídas duras seguidas se reinicia en cuanto el jugador
  mueve o rota una pieza.
- **P17.** La penalización nunca deja la puntuación por debajo de cero.
- **P18.** La penalización se avisa en pantalla, para que se entienda qué está
  pasando.

  *Se penaliza la repetición y no la caída dura en sí: usarla es un control
  legítimo del juego, y castigarla siempre sería castigar a quien juega bien.*

### 3.5 Textura de la arena

- **P19.** Cada grano se pinta con una **variación pequeña de brillo** respecto
  al color base, para que las masas grandes no se vean como manchas planas.
- **P20.** La variación es **fija según la posición del grano**, no aleatoria en
  cada fotograma, o la arena parpadearía.
- **P21.** La variación es sutil: la arena debe seguir leyéndose como un color,
  no como ruido.

### 3.6 Fin de partida en arena

- **P22.** Al perder, el gris **se propaga desde el punto donde la arena tocó la
  línea roja** y se extiende hasta cubrir todo el tablero.
- **P23.** El texto de fin de partida aparece **cuando la propagación termina**,
  no antes.
- **P24.** Duración objetivo de la propagación: entre 700 y 1000 ms.
- **P25.** Con `prefers-reduced-motion`, el tablero aparece gris de golpe y el
  texto sin esperar.

### 3.7 Menú en dos pantallas

- **P26.** La pantalla principal del menú tiene **tres botones**: Clásico, Más
  juegos y Ajustes.
- **P27.** "Clásico" empieza una partida clásica directamente.
- **P28.** "Más juegos" lleva a una segunda pantalla con los **cinco modos
  restantes**: Sprint, Ultra, Nivel fijo, Cero gravedad y Arena.
- **P29.** Clásico **no aparece** en la lista de modos.
- **P30.** La pantalla de modos tiene una forma de volver a la principal.
- **P31.** Cada modo muestra su marca, como hasta ahora.
- **P32.** El selector de nivel de Nivel fijo vive en la pantalla de modos.

### 3.8 Una partida guardada por modo

- **P33.** Cada modo guarda **su propia partida a medias**, independiente de los
  demás.
- **P34.** Al elegir un modo que tiene partida guardada, se **continúa** esa
  partida en lugar de empezar una nueva.
- **P35.** El botón del modo indica que hay una partida a medias.
- **P36.** Debe existir una forma de empezar de cero aunque haya partida
  guardada.
- **P37.** Terminar una partida borra la guardada de ese modo.
- **P38.** Las partidas de los modos con cronómetro conservan su tiempo.
- **P39.** El modo arena también guarda partida.

  *Ahora mismo hay una sola partida guardada para todo el juego: dejar un Ultra
  a medias y empezar un Sprint borraba el Ultra.*

- **P40.** La partida guardada con la v5 se puede seguir leyendo, y se asigna al
  modo que indique.

---

## 4. Criterios de aceptación

La v6 está terminada cuando:

1. Eliminar cuatro líneas de golpe pone la racha en 4 y da su extra.
2. El cartel de combo desaparece siempre, incluso encadenando rápido.
3. En móvil, toda la información está arriba y los cinco botones abajo.
4. El menú cabe sin desplazamiento a 320 × 568 px.
5. El modo arena empieza con cuatro colores.
6. Martillear la caída dura en arena resta puntos y lo avisa.
7. Mover o rotar reinicia esa penalización.
8. La arena se ve con textura, no como manchas planas.
9. Al perder en arena, el gris se propaga desde el punto de impacto.
10. El menú principal tiene tres botones y "Más juegos" lleva a los cinco modos.
11. Dejar un modo a medias y jugar otro no borra el primero.
12. Elegir un modo con partida guardada la continúa.
13. Los récords existentes siguen intactos tras todos estos cambios.
14. Todo funciona en un móvil real, sin errores en consola.
15. `npm run build` limpio.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Guardar seis partidas rompe la persistencia existente** | Es el riesgo más serio. Se hace primero y se prueba con datos reales, como la migración de récords de la v4. Los récords van en otra clave y no se tocan |
| Con las líneas simultáneas, la puntuación se dispara | Es el efecto buscado. Si resulta excesivo, `COMBO_BASE` es un número |
| Cuatro colores hacen el modo arena demasiado difícil | Medir jugando. Es una constante |
| La penalización castiga a quien juega bien | P16: se reinicia al mover o rotar, así que solo afecta a quien no toca nada |
| Seis partidas guardadas llenan el almacenamiento | Cada tablero son unos pocos kilobytes. Sin problema |
| La propagación del gris da tirones | Se dibuja en canvas, que ya mueve 3.200 granos sin despeinarse |

---

## 6. Deuda que sigue pendiente

Se anota para no perderla, aunque no entre en esta versión:

- **Accesibilidad del modo arena.** No anuncia nada para lectores de pantalla.
  La constitución lo exige (criterio C2) y ese modo no lo cumple.
- **Los controles del modo arena ignoran las teclas de los ajustes.** Están
  fijas en el código, así que reasignarlas no tiene efecto ahí.
