# spec-v5.md — Modo arena

Quinta versión. Un solo modo de juego nuevo, pero el más ambicioso hasta ahora:
las piezas se desmoronan en arena al fijarse, y se elimina por masas de color en
lugar de por filas.

Las versiones anteriores quedan como están. Donde no diga lo contrario, todo lo
de `spec.md`, `spec-v2.md`, `spec-v3.md` y `spec-v4.md` sigue vigente.

Versión: 5.0
Estado: propuesta

---

## 1. Por qué esta versión

Los cinco modos de la v4 comparten reglas: cambian el ritmo, no la mecánica.
Este es el primero que cambia lo que haces.

En lugar de encajar piezas para completar filas rectas, colocas material que se
derrama y se acumula en montones, y la forma de limpiar es unir una masa del
mismo color de una pared a la otra, con la forma que sea. Eso convierte el juego
en algo distinto: menos precisión, más gestión de colores y de laderas.

**Advertencia de alcance.** Este modo no reutiliza el motor. Comparte las piezas
y los controles, pero el tablero, la caída y la condición de limpieza son
nuevos. Es, en la práctica, un segundo juego dentro del mismo proyecto.

---

## 2. Fuera de alcance

Se rechazan sin discusión en la v5:

- Modo chuches y modo 3D
- Mezclar arena con los modos existentes
- Marcas de arena por dificultad o variantes del modo
- Física realista: la arena resbala con reglas simples, no se simula

---

## 3. Requisitos

### 3.1 El tablero de arena

- **A1.** El tablero de arena tiene la misma superficie que el normal, pero
  dividido en granos: cada celda del tablero clásico son **4 × 4 granos**.
  Resultado: **40 columnas × 80 filas**.
- **A2.** El número de granos por celda es un valor configurable en el código,
  no un número repartido por ahí. Si al probar el rendimiento sobra margen, debe
  poder subirse sin tocar nada más.
- **A3.** Cada grano guarda un color o está vacío.
- **A4.** El tablero de arena se dibuja con **canvas**, no con elementos del DOM.

  *Justificación: 3.200 granos como divs independientes es inviable. El tablero
  clásico usa DOM y se queda como está; esto solo afecta al modo arena.*

- **A5.** Una línea roja marca el límite superior, como referencia visual.

### 3.2 Las piezas

- **A6.** Las piezas son las siete de siempre, con las mismas rotaciones y los
  mismos controles.
- **A7.** Mientras cae, la pieza se comporta como en el juego normal: es un
  bloque rígido que se mueve, rota y colisiona.
- **A8.** Cada pieza tiene **un solo color**, elegido al azar entre los colores
  disponibles. El color no depende de la forma: una pieza T puede ser de
  cualquier color.
- **A9.** Al fijarse, la pieza **se desmorona**: cada uno de sus bloques se
  convierte en 4 × 4 granos de su color, que a partir de ese momento caen por
  separado.

### 3.3 Cómo cae la arena

- **A10.** Un grano cae una posición si la de debajo está vacía.
- **A11.** Si la de debajo está ocupada pero hay hueco **en diagonal**, abajo a
  la izquierda o abajo a la derecha, el grano se desliza hacia ahí.
- **A12.** Si hay hueco en las dos diagonales, se elige una al azar, para que
  los montones no se inclinen siempre hacia el mismo lado.
- **A13.** La arena se asienta antes de que aparezca la siguiente pieza: no hay
  granos flotando cuando el jugador recupera el control.
- **A14.** El asentamiento se ve caer, no aparece resuelto de golpe.

### 3.4 Eliminar masas

- **A15.** Se elimina toda masa de granos **del mismo color** que esté
  conectada y **toque a la vez la pared izquierda y la derecha**.
- **A16.** Dos granos están conectados si se tocan por un lado **o por una
  esquina**.

  *Nota: esto hace las masas mucho más fáciles de formar. Ver riesgos.*

- **A17.** La forma de la masa no importa: puede serpentear, subir y bajar.
- **A18.** Al eliminarse, la masa se ilumina en blanco antes de desaparecer.
- **A19.** Después de eliminar, la arena que quedara encima vuelve a caer, y si
  eso forma otra masa que toca ambas paredes, también se elimina. Se repite
  hasta que no pase nada más.
- **A20.** Cada eliminación encadenada puntúa más que la anterior.

### 3.5 Colores

- **A21.** La partida empieza con **tres colores**.
- **A22.** Al alcanzar cierta puntuación se añade un cuarto color, y más
  adelante un quinto.
- **A23.** Añadir un color se avisa en pantalla.
- **A24.** Los colores son los de las piezas del juego, para que el modo se
  reconozca como parte de lo mismo.

  *Por qué esto es la curva de dificultad: con pocos colores es fácil que la
  arena que cae conecte con lo que ya hay. Cada color nuevo fragmenta los
  montones y hace las masas más difíciles de completar, sin tocar la velocidad.*

### 3.6 Puntuación y fin

- **A25.** Puntúa el número de granos eliminados.
- **A26.** Las cadenas multiplican, según A20.
- **A27.** La partida termina cuando la arena supera la línea roja, o cuando una
  pieza nueva no cabe.
- **A28.** El modo guarda su propia marca de puntuación, como los demás.
- **A29.** Aparece en el menú junto a los otros modos.

### 3.7 Lo que se mantiene

- **A30.** Controles idénticos: teclado y táctiles, con las mismas teclas.
- **A31.** Pausa, reanudación y ajustes funcionan igual.
- **A32.** El modo se guarda y se puede reanudar, como los demás.
- **A33.** Los sonidos existentes se reutilizan.
- **A34.** Se respeta `prefers-reduced-motion` y se anuncian los cambios para
  lectores de pantalla.

---

## 4. Criterios de aceptación

La v5 está terminada cuando:

1. El modo arena se elige desde el menú y se juega.
2. Las piezas caen y se controlan igual que en el resto del juego.
3. Al fijarse, la pieza se desmorona en granos que caen por separado.
4. Los granos resbalan en diagonal y forman laderas, no columnas rectas.
5. Una masa de un color que toca ambas paredes se elimina, tenga la forma que
   tenga.
6. La masa se ilumina antes de desaparecer.
7. Al eliminar, lo de arriba cae y puede encadenar otra eliminación.
8. La partida empieza con tres colores y aparecen más al puntuar, con aviso.
9. La partida termina al superar la línea roja.
10. El modo guarda su marca, independiente de los demás.
11. Se puede pausar, salir al menú y reanudar sin que se pierda el estado.
12. **Va fluido en un móvil de gama media**, sin tirones al asentarse la arena.
13. `npm run build` limpio.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| **La conexión en diagonal hace las masas demasiado fáciles** y el tablero se limpia solo | Es el riesgo más probable de esta versión. La conexión es un valor configurable: si al jugar resulta trivial, se pasa a solo horizontal y vertical |
| El asentamiento de 3.200 granos da tirones en móvil | Criterio 12. Canvas en vez de DOM, y solo recorrer las filas que tengan granos. Si aun así falla, bajar a 2 granos por celda |
| Las cadenas de A19 no terminan nunca | Tope de iteraciones, como ya se previó para las chuches |
| El modo se convierte en un segundo juego que arrastra al primero | Vive en archivos separados. Nada de arena entra en el motor clásico |
| Con 4 granos por celda no se ve como arena | A2: el número es configurable y se puede subir si el rendimiento lo permite |
| El tablero de arena no cabe en móvil | Misma superficie que el clásico, solo cambia el detalle interno. No debería afectar |
