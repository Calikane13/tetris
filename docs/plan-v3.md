# plan-v3.md — Cómo se construyen los combos y la identidad

Diseño técnico de lo que define `spec-v3.md`.
Si algo choca con `constitution.md`, gana la constitución.

Versión: 3.0
Estado: propuesta

---

## 1. Qué cambia y qué no

`src/engine/` gana una función de puntuación y unas constantes. Nada más: la
racha es estado de partida, no una regla de colocación, así que el tablero, las
colisiones y la rotación no se tocan.

| Zona | Cambia |
|---|---|
| `src/engine/scoring.ts` | Función del extra de combo |
| `src/engine/constants.ts` | Constantes de combo |
| `src/store/useGameStore.ts` | Estado de racha y su contador de fallos |
| `src/components/` | Aviso de combo, logo, menú, barrido amarillo |
| `src/index.css` | Animaciones del combo |
| `index.html` | Título e icono |

---

## 2. El sistema de combos

### 2.1 Estado nuevo

Dos números en el store:

```
combo: number        // racha actual. 0 significa sin racha
dryPieces: number    // piezas seguidas fijadas sin eliminar líneas
```

`dryPieces` es lo que implementa el margen de tres piezas (C3). Sin él, la racha
se rompería a la primera pieza sin línea.

### 2.2 Dónde vive la lógica

Todo en `advance()`, que es la función que ya centraliza el "qué pasa al fijar
una pieza". Es el único sitio que sabe cuántas líneas se eliminaron, así que es
el único que puede decidir sobre la racha.

```
si clearedCount > 0:
    combo += 1
    dryPieces = 0
    si combo >= 2:
        extra = comboBonus(combo, level)
sino:
    dryPieces += 1
    si dryPieces >= COMBO_GRACE:
        combo = 0
        dryPieces = 0
```

Con `COMBO_GRACE = 3`. Las dos primeras piezas sin línea suben el contador pero
no rompen nada; la tercera sí.

### 2.3 La fórmula

En `scoring.ts`, junto a las demás:

```
comboBonus(combo, level) = combo < 2 ? 0 : COMBO_BASE * combo * level
```

Con `COMBO_BASE = 50`. La comprobación de `combo < 2` va dentro de la función y
no en quien la llama: así no hay forma de olvidarla desde otro sitio, que es lo
que pasaría cuando la v4 añada modos de juego.

### 2.4 Lo que no se guarda

`combo` y `dryPieces` **no entran en `bloques:save`** (requisito C6). Al reanudar
valen cero, como al empezar. Esto evita cambiar el formato guardado y su
validador, que es donde más fácil se cuelan errores.

---

## 3. El aviso de combo

### 3.1 Estructura

Un componente `ComboBanner`, hermano de `LevelUpBanner` y con la misma forma:
observa un valor del store, se muestra un rato y desaparece solo.

La diferencia es que no basta con mirar si `combo` subió: hay que saber cuántos
puntos extra se ganaron para mostrarlos. Se añade al store:

```
lastComboBonus: number   // extra de la última eliminación, 0 si no hubo
```

### 3.2 Prioridad con el aviso de nivel

Si en la misma pieza se consigue combo y se sube de nivel, se muestran los dos y
se solapan. Para evitarlo, **el aviso de nivel gana**: `ComboBanner` no se
muestra si `LevelUpBanner` está activo.

Se resuelve en `App.tsx` con una condición, no con lógica en el store.

### 3.3 El barrido amarillo

`Cell` ya recibe si está en limpieza. Se le añade si esa limpieza forma parte de
una racha, y aplica una clase distinta:

```
.line-sweep          blanco, línea normal
.line-sweep-combo    amarillo, línea en racha
```

**Riesgo conocido:** una fila llena de piezas O, que son amarillas, puede no
distinguirse del barrido. Mitigación prevista si ocurre: el barrido de combo
lleva además un borde blanco fino, que sí contrasta con cualquier color.

---

## 4. El logo

### 4.1 Forma

Bloques apilados en torre, cada uno con el color de una pieza del juego. Cuatro
o cinco bloques como mucho: a 32 px, más detalle se convierte en ruido.

Los bloques llevan el mismo relieve que los del tablero (borde claro arriba,
oscuro abajo), pero dibujado con rectángulos SVG en lugar de bordes CSS.

### 4.2 Componente

`Logo.tsx`, con una prop de tamaño. Sin dependencias, sin archivo de imagen.

### 4.3 El icono de la pestaña

Aquí hay una decisión que tomar. El icono no puede ser un componente de React:
lo carga el navegador desde `index.html` antes de que exista la aplicación.

Se resuelve con un **SVG en `public/`**. Es un archivo, sí, pero de código, no
un binario, y es la única forma de tener icono propio. Se documenta como
excepción consciente a la restricción C3 de la constitución.

```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

El dibujo se duplica entre `Logo.tsx` y `public/logo.svg`. Es duplicación, y se
acepta: unificarlo obligaría a cargar el SVG por red desde el componente, lo que
añade un estado de carga a algo que no lo necesita.

---

## 5. El menú

### 5.1 Estructura

De arriba abajo: logo, nombre del juego, récord con corona, botón principal,
botones secundarios.

El botón principal es "Jugar" o "Continuar partida" según haya partida guardada.
El resto van como enlaces subrayados, como ahora.

### 5.2 Instrucciones solo en escritorio

Las teclas no sirven en móvil (C29). Se ocultan con `hidden md:block`, que es
lo mismo que ya hace `TouchControls` al revés.

### 5.3 Espacio

El menú es una capa sobre el tablero, así que su altura está limitada por la de
este. A 320 × 568 px el tablero mide unos 400 px de alto, y ahí hay que meter
seis elementos.

Si no cabe, la salida es reducir el logo en móvil, no añadir desplazamiento
dentro de la capa.

---

## 6. Orden de construcción

1. **Constantes y fórmula** — aislado, no depende de nada.
2. **Racha en el store** — funciona sin nada visual: los puntos ya suben.
3. **Aviso de combo y barrido amarillo** — ya hay algo que anunciar.
4. **Logo** — independiente de todo lo anterior.
5. **Título e icono** — necesita el logo.
6. **Menú** — necesita el logo.

Los pasos 1 y 2 se pueden verificar sin ver nada en pantalla: mirando cómo sube
la puntuación.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| El barrido amarillo no se distingue sobre piezas O | Borde blanco fino en el barrido de combo, si ocurre |
| Avisos de combo y nivel solapados | El de nivel gana (sección 3.2) |
| Tres piezas de margen hacen la racha trivial | `COMBO_GRACE` es un número en `constants.ts` |
| El menú no cabe a 320 px con el logo | Logo más pequeño en móvil, nunca desplazamiento |
| El SVG del icono se duplica y se desincroniza | Documentado en la sección 4.3; es un dibujo que no cambiará |
