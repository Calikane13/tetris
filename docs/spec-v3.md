# spec-v3.md — Combos e identidad

Tercera versión. Dos bloques que no tienen nada que ver entre sí pero que caben
juntos porque ninguno es grande: un sistema de combos, y darle cara propia al
juego.

La v2 queda como está, publicada. Este documento describe lo que se añade encima.
Donde no diga lo contrario, todo lo de `spec.md` y `spec-v2.md` sigue vigente.

Versión: 3.0
Estado: propuesta

---

## 1. Por qué esta versión

**Los combos** son lo que convierte una partida en una racha. Ahora mismo
eliminar cuatro líneas seguidas con cuatro piezas distintas puntúa igual que
hacerlo con diez piezas de por medio, y eso desperdicia el momento más
satisfactorio del juego. Además aprovechan el sistema de fases construido en la
v2, así que la parte difícil ya está hecha.

**La identidad** porque el juego se llama Bloques, usa la tipografía por defecto
del navegador y tiene el icono de Vite en la pestaña. Funciona bien y no lo
parece.

---

## 2. Fuera de alcance

Se rechazan sin discusión en la v3:

- Modos de juego nuevos (Sprint, Ultra, chuches, arena, 3D)
- Cambios en el sonido y música de fondo
- Varios estilos de bloque a elegir
- Tabla de récords o estadísticas

---

## 3. Requisitos

### 3.1 Combos consecutivos

- **C1.** Una **racha** empieza cuando se eliminan líneas al fijar una pieza.
- **C2.** La racha sube en uno cada vez que se vuelven a eliminar líneas,
  **independientemente de cuántas** sean.
- **C3.** La racha se rompe al fijar **tres piezas seguidas sin eliminar
  ninguna línea**. Las dos primeras no la rompen: la mantienen viva.

  *Es más generoso que lo habitual en el género, y a propósito: hace la racha
  alcanzable para quien no juega a diario.*

- **C4.** Al romperse, la racha vuelve a cero.
- **C5.** Empezar una partida pone la racha a cero.
- **C6.** La racha no se guarda al reanudar una partida: se retoma desde cero.

  *Justificación: guardarla obligaría a cambiar el formato de `bloques:save` y
  su validación. El coste no compensa para algo que se recupera en dos piezas.*

### 3.2 Puntuación de combo

- **C7.** A partir de la **segunda** eliminación consecutiva, se suman puntos
  extra aparte de los de línea.
- **C8.** El extra es `50 × racha × nivel`. Con racha 2 y nivel 3, son 300 puntos
  además de lo que valgan las líneas.
- **C9.** El extra es **independiente** del número de líneas eliminadas: una
  línea suelta en racha 5 da el mismo extra que un cuádruple en racha 5.

  *Se eligió sumar un extra en lugar de multiplicar los puntos de línea porque
  un multiplicador dispara la puntuación de forma descontrolada en rachas
  largas, y porque un extra identificable se entiende mejor que un número que
  sube sin explicación.*

- **C10.** La racha no afecta al conteo de líneas ni al nivel.

### 3.3 Aviso de combo

- **C11.** Al conseguir un combo (racha 2 o superior) aparece un texto sobre el
  tablero con el número de racha y los puntos extra ganados.
- **C12.** El texto es **amarillo**, para distinguirlo del aviso de nivel, que es
  cian.
- **C13.** Durante un combo, el barrido de la línea es **amarillo** en lugar de
  blanco. Es lo que permite ver de un vistazo si una línea forma parte de una
  racha.
- **C14.** Además, un destello amarillo cubre el tablero, como el del aviso de
  nivel pero en ese color.
- **C15.** El aviso desaparece solo y no bloquea el juego.
- **C16.** Con `prefers-reduced-motion`, el aviso aparece sin movimiento ni
  destello, igual que el de nivel.
- **C17.** El combo se anuncia también por texto en la región accesible, junto
  con las líneas.

### 3.4 Título

- **C18.** El juego pasa a llamarse **Bloque a Bloque**.
- **C19.** El nombre aparece en el menú, en el título de la pestaña del
  navegador y en el `README`.
- **C20.** El nombre del repositorio, la carpeta del proyecto y la URL **no
  cambian**. Renombrarlos rompería el despliegue a cambio de nada.

### 3.5 Logo

- **C21.** El logo son **bloques apilados formando una torre**.
- **C22.** Es un SVG dibujado en el código, no una imagen (restricción C3 de la
  constitución).
- **C23.** Usa los colores de las piezas del juego, para que se reconozca como
  parte de lo mismo.
- **C24.** Sirve además como icono de la pestaña, sustituyendo al de Vite.
- **C25.** Se ve bien a tamaño pequeño (32 px) y grande (128 px).

### 3.6 Menú

- **C26.** El menú muestra el logo y el nombre del juego.
- **C27.** Muestra el récord con su corona, para que se vea antes de empezar.
- **C28.** Los botones se distinguen por jerarquía: la acción principal destaca
  sobre las secundarias.
- **C29.** Las instrucciones de teclado no se muestran en móvil, donde no
  sirven de nada.
- **C30.** Todo el menú cabe sin desplazamiento en una pantalla de 320 × 568 px.

---

## 4. Criterios de aceptación

La v3 está terminada cuando:

1. Eliminar líneas con dos piezas seguidas da puntos extra y muestra el aviso.
2. La racha sobrevive a dos piezas sin línea y se rompe a la tercera.
3. El barrido se ve amarillo durante una racha y blanco fuera de ella.
4. Los puntos extra coinciden con la fórmula: en nivel 1, racha 2 da 100.
5. El menú muestra logo, nombre y récord, y cabe sin desplazamiento a 320 px.
6. La pestaña del navegador muestra el logo y el nombre nuevo.
7. El logo se reconoce como una torre de bloques a tamaño de icono.
8. Con `prefers-reduced-motion`, el aviso de combo aparece sin movimiento.
9. Una partida completa en móvil real, sin errores en consola.
10. `npm run build` limpio.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Tres piezas de margen hacen la racha demasiado fácil de mantener | Es un número en `constants.ts`. Medir jugando y ajustar |
| El aviso de combo y el de nivel se solapan al coincidir | Decidir una prioridad: si coinciden, gana el de nivel |
| Amarillo sobre bloques amarillos (pieza O) no se distingue | Criterio 3: probar el barrido con una línea llena de piezas O |
| El logo en SVG se ve sucio a 32 px | Criterio 7: formas simples, sin detalle fino |
| Cambiar el título rompe algo del despliegue | C20: solo cambia el texto visible, nunca rutas ni nombres de proyecto |
