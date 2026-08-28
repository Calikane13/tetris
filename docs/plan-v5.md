# plan-v5.md — Cómo se construye el modo arena

Diseño técnico de lo que define `spec-v5.md`.
Si algo choca con `constitution.md`, gana la constitución.

Versión: 5.0
Estado: propuesta

---

## 1. La regla que ordena esta versión

**El modo arena vive aparte y no toca el motor clásico.**

Nada de `src/engine/` cambia. Nada de `useGameStore.ts` cambia salvo para saber
que existe un modo más. Si en algún momento hay que añadir un `if (mode ===
'sand')` dentro del motor clásico, es señal de que algo se ha diseñado mal.

El precio de esta regla es duplicar cosas: habrá dos tableros, dos bucles y dos
formas de dibujar. Se acepta a propósito, porque la alternativa es un motor
lleno de condicionales que nadie entiende a los seis meses.

Lo único que se comparte de verdad: las formas de las piezas
(`tetrominoes.ts`), los controles, y los componentes de interfaz que no saben
qué hay debajo.

---

## 2. Estructura de archivos

```
src/
├── sand/                       Todo lo del modo arena
│   ├── constants.ts            Medidas, colores, umbrales
│   ├── grid.ts                 El tablero de granos y sus operaciones
│   ├── physics.ts              Caída y asentamiento de la arena
│   ├── masses.ts               Detección de masas conectadas
│   ├── useSandStore.ts         Estado del modo
│   ├── useSandLoop.ts          Bucle propio
│   └── SandCanvas.tsx          Dibujo con canvas
└── ...                         El resto, intacto
```

`grid.ts`, `physics.ts` y `masses.ts` son funciones puras y no importan React,
igual que el motor clásico.

---

## 3. El tablero de granos

### 3.1 Estructura de datos

3.200 granos. Un array de arrays de strings sería correcto pero lento de
recorrer 60 veces por segundo.

Se usa un **array plano de enteros**:

```
grid: Uint8Array           longitud 40 * 80 = 3200
0 = vacío, 1..7 = color
índice = fila * ANCHO + columna
```

Motivos:

- Un `Uint8Array` es memoria contigua: recorrerlo es mucho más rápido que
  saltar entre arrays anidados.
- Se puede copiar entero con una sola llamada.
- 3.200 bytes en total, frente a los kilobytes de un array de objetos.

Las funciones de acceso (`get(grid, row, col)`, `set(...)`) esconden la
aritmética del índice, así que el resto del código sigue leyéndose en filas y
columnas.

### 3.2 Coordenadas

Dos rejillas conviven:

- **Rejilla de pieza**: 10 × 20, la de siempre. La pieza activa se mueve aquí.
- **Rejilla de granos**: 40 × 80. Es donde vive la arena.

La conversión es una multiplicación por `GRAINS_PER_CELL`, que vale 4. Al
fijarse una pieza, cada uno de sus bloques se convierte en 16 granos.

Mantener la pieza en la rejilla gruesa es importante: los controles, la rotación
y las colisiones siguen funcionando exactamente igual que en el juego clásico,
sin tocar nada.

---

## 4. La física

### 4.1 El algoritmo

Por cada grano, de abajo arriba:

1. ¿Está libre la posición de debajo? Baja.
2. ¿Están libres las dos diagonales inferiores? Elige una al azar y baja.
3. ¿Está libre solo una diagonal? Baja por ella.
4. Si no, se queda quieto.

**De abajo arriba, y esto no es opcional.** Si se recorriera de arriba abajo, un
grano que baja se encontraría en la fila siguiente y volvería a caer en el mismo
paso, atravesando el tablero de una vez.

### 4.2 El asentamiento

Un paso de física mueve cada grano una posición. Para que la arena se asiente
del todo hacen falta varios pasos, y el requisito A14 dice que se vean.

El bucle del modo ejecuta **un paso por fotograma** mientras haya movimiento.
Cuando un paso no mueve nada, la arena está asentada y el juego continúa.

```
estado: 'falling' | 'settling' | 'clearing'
```

- `falling`: la pieza se controla, como siempre.
- `settling`: la pieza ya se desmoronó, la arena cae, no se acepta entrada.
- `clearing`: hay masas iluminándose antes de desaparecer.

Es el mismo patrón de fases de la v2, que ya se probó con la animación de línea.

### 4.3 Optimización

Recorrer 3.200 posiciones por fotograma es asumible, pero se puede hacer mejor:
se guarda la **fila más alta que contiene algún grano** y solo se recorre de ahí
hacia abajo. Al principio de la partida eso son unas pocas filas.

Si aun así hay tirones en móvil, la siguiente medida es bajar
`GRAINS_PER_CELL` a 2, que divide el trabajo por cuatro.

---

## 5. Detección de masas

### 5.1 El algoritmo

Un recorrido en anchura desde cada grano de la columna 0:

1. Para cada grano de la pared izquierda, si no se ha visitado, se explora.
2. Se expande a los vecinos del mismo color, incluidas las ocho direcciones
   (requisito A16).
3. Si en algún momento se alcanza la columna 39, esa masa toca ambas paredes.
4. Se guardan sus índices para eliminarla.

Solo se empieza desde la pared izquierda: una masa que toque ambas paredes tiene
que pasar por ahí por fuerza, así que explorar desde el resto sería trabajo
tirado.

### 5.2 Cuándo se ejecuta

Solo cuando la arena termina de asentarse, no en cada fotograma. Es la operación
más cara del modo y no tiene sentido repetirla mientras las cosas se mueven.

### 5.3 Las cadenas

Tras eliminar una masa, la arena vuelve a caer y puede formar otra. El ciclo es:

```
asentar → buscar masas → ¿hay? → iluminar, borrar, subir multiplicador → repetir
                              → ¿no hay? → siguiente pieza
```

Con un **tope de 20 iteraciones**, por si una combinación rara se realimenta.

---

## 6. El dibujo

### 6.1 Por qué canvas

3.200 divs con React es inviable: cada fotograma tendría que reconciliar miles
de elementos. Con canvas se dibujan 3.200 rectángulos en un bucle, que es lo que
la GPU hace sin despeinarse.

### 6.2 Cómo

Un `<canvas>` con un `useRef`, y un efecto que redibuja cuando cambia la
rejilla. El dibujo es:

1. Limpiar.
2. Recorrer la rejilla y pintar cada grano no vacío con su color.
3. Pintar la pieza activa encima, convirtiendo sus bloques a coordenadas de
   grano.
4. Pintar la línea roja del límite.

**Los colores aquí son valores hexadecimales, no clases de Tailwind.** Canvas no
entiende CSS, así que hace falta un segundo mapa de colores. Es duplicación
respecto a `blockStyles.ts`, y se acepta porque son técnicas distintas de
dibujo.

### 6.3 Nitidez

El canvas se dimensiona teniendo en cuenta `devicePixelRatio`, o en pantallas de
alta densidad la arena se verá borrosa.

---

## 7. El estado

Store propio, `useSandStore.ts`, separado del clásico. Comparte forma pero no
código.

```
grid: Uint8Array
active: ActivePiece | null      la misma estructura del juego clásico
activeColor: number             el color de la pieza, aparte de su forma
next: PieceType
nextColor: number
phase: 'falling' | 'settling' | 'clearing'
score, chain, colorCount
clearingMask: Uint8Array | null   qué granos se están iluminando
```

Las acciones son las mismas del clásico (mover, rotar, caídas, pausa), lo que
permite reutilizar los controles sin tocarlos: el hook de teclado llamará a un
store o a otro según el modo activo.

---

## 8. Los colores

Empiezan tres y se añaden dos más por puntuación:

```
SAND_COLORS = [cian, verde, amarillo, rojo, morado]
COLOR_THRESHOLDS = [0, 0, 0, 10000, 30000]
```

Los tres primeros con umbral 0 son los iniciales. El aviso reutiliza el
componente de desbloqueo de la v4.

---

## 9. Integración

Lo mínimo indispensable en el código existente:

- `modes.ts` gana una entrada `sand`.
- `App.tsx` decide qué tablero y qué bucle usar según el modo.
- `records.ts` gana un campo `sand`.
- El hook de teclado dirige las acciones al store que toque.

Nada más. Si aparece la necesidad de tocar otra cosa del motor clásico, conviene
parar y replantear.

---

## 10. Orden de construcción

1. **Constantes y rejilla** — datos y accesos, sin lógica.
2. **Física** — con un tablero de prueba, sin juego alrededor.
3. **Dibujo con canvas** — para poder ver lo anterior.
4. **Store y bucle** — piezas que caen y se desmoronan.
5. **Detección de masas** — la parte que hace que sea un juego.
6. **Cadenas y puntuación**.
7. **Colores progresivos**.
8. **Integración en menú y récords**.

Los pasos 2 y 3 van seguidos: la física sin dibujo no se puede verificar.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| La diagonal hace las masas triviales | Constante configurable. Probar en el paso 5 y decidir |
| Tirones en móvil | Fila más alta con contenido, y bajar granos por celda si hace falta |
| Cadenas infinitas | Tope de 20 iteraciones |
| El canvas se ve borroso | `devicePixelRatio` desde el principio |
| Duplicar colores en dos formatos | Documentado en 6.2; un mapa hexadecimal solo para canvas |
| El modo contamina el motor clásico | Sección 1: si hay que tocarlo, parar y replantear |
