# plan-v6.md — Cómo se corrige y se pule

Diseño técnico de lo que define `spec-v6.md`.
Si algo choca con `constitution.md`, gana la constitución.

Versión: 6.0
Estado: propuesta

---

## 1. Qué tipo de versión es esta

No hay arquitectura nueva. Hay tres clases de trabajo, y conviene distinguirlas
porque el riesgo de cada una es muy distinto:

| Tipo | Qué incluye | Riesgo |
|---|---|---|
| **Correcciones** | Cartel pillado, equilibrio de arena | Bajo. Cambios pequeños y localizados |
| **Presentación** | Disposición móvil, textura, fin de partida, menú | Medio. Mucho archivo tocado, pero nada irreversible |
| **Persistencia** | Una partida guardada por modo | **Alto**. Cambia el formato de lo guardado |

El orden de construcción sigue esa tabla al revés: lo arriesgado primero,
cuando todavía es fácil dar marcha atrás.

---

## 2. El cartel de combo

### 2.1 Por qué falla

`ComboBanner` tiene esta forma:

```
useEffect(() => {
  if (combo subió && combo >= 2) {
    setShown(...)
    const timer = setTimeout(ocultar, 900)
    return () => clearTimeout(timer)      // ← el problema
  }
}, [combo, bonus, status])
```

React limpia el efecto anterior cada vez que cambia una dependencia. Si `bonus`
cambia antes de los 900 ms, se ejecuta ese `clearTimeout`, el temporizador
muere, y en la vuelta siguiente la condición ya no se cumple, así que nadie
programa otro. El cartel se queda visible para siempre.

Se quedaba en x2 porque es el primer combo que llega a mostrarse.

### 2.2 La corrección

Separar dos responsabilidades que ahora están mezcladas:

- **Un efecto que detecta** que hay que mostrar el cartel, y solo escribe el
  estado.
- **Otro efecto que cuenta el tiempo**, con `shown` como única dependencia.

Así, el temporizador solo se cancela cuando el cartel cambia de verdad, y en ese
caso se programa uno nuevo, que es justo el comportamiento que pide P5.

El mismo patrón se revisa en `LevelUpBanner` y en `UnlockBanner`, que tienen la
misma estructura y por tanto el mismo fallo latente.

---

## 3. Los combos con líneas simultáneas

Un cambio de una línea en `advance()`:

```
combo += clearedCount     en vez de     combo += 1
```

Nada más. La fórmula del bono no cambia, el corte de racha tampoco.

Conviene ser consciente del efecto: en nivel 5, un cuádruple pasa de dar 250 de
extra a dar 1000. Es lo buscado, pero si al jugar resulta desproporcionado, la
palanca es `COMBO_BASE`.

---

## 4. El equilibrio del modo arena

### 4.1 Cuatro colores

`INITIAL_COLORS` de 3 a 4. Los umbrales no se tocan.

### 4.2 La penalización

Estado nuevo en el store de arena:

```
straightDrops: number     caídas duras seguidas sin mover ni rotar
```

- `hardDrop()` lo incrementa.
- `moveLeft`, `moveRight`, `rotateCW` y `rotateCCW` lo ponen a cero.
- Al eliminar una masa, si `straightDrops >= 3`, la puntuación resta 100 en
  lugar de sumar.

**Por qué así y no penalizando la caída dura sin más:** usarla es un control
legítimo. Lo que rompe el modo es martillearla sin colocar, y eso se distingue
por la ausencia de movimiento entre pieza y pieza.

El aviso en pantalla reutiliza el hueco del cartel de color nuevo.

---

## 5. La disposición en móvil

### 5.1 Qué cambia

Se deshace lo que la v5 dejó repartido:

- Los cinco botones vuelven a una fila inferior centrada.
- Puntuación, récord, líneas, nivel y siguiente pieza van a una fila superior.
- El tablero queda entre las dos, a ancho completo.

### 5.2 Dónde

`App.tsx` para el juego clásico y `SandGame.tsx` para arena. Los componentes de
botones no cambian: desde la v5 reciben las acciones desde fuera, así que solo
se recolocan.

`TouchSideLeft`, `TouchSideRight`, `TouchMoveLeft` y `TouchMoveRight` dejan de
tener sentido como cuatro grupos separados. Se sustituyen por un único
`TouchBar` con los cinco.

### 5.3 El espacio

La fila superior tiene que meter cinco datos en 320 px. La siguiente pieza es lo
que más ocupa, así que se dibuja pequeña, sobre `calc(var(--cell) * 0.5)`.

Si no cabe, se quita el nivel antes que la siguiente pieza: el nivel se deduce
de las líneas, la pieza que viene no.

---

## 6. La textura de la arena

Cada grano se pinta con un brillo ligeramente distinto. La variación tiene que
ser **fija según la posición**, o la arena parpadearía en cada fotograma.

Se consigue con una función determinista sobre las coordenadas:

```
variación = ((row * 31 + col * 17) % 5) - 2      da -2, -1, 0, 1 o 2
```

No es aleatorio: para una misma posición siempre devuelve lo mismo. Los números
31 y 17 son primos para que el patrón no forme franjas visibles.

Esa variación se aplica al color en hexadecimal, sumando o restando unas
unidades a cada canal. Se precalculan los cinco tonos de cada color al arrancar,
así que dibujar no cuesta más que ahora.

---

## 7. La propagación del gris

### 7.1 Cómo

Al perder se guarda el punto de impacto: la posición del grano que superó la
línea roja. Después, un valor `deathRadius` crece con el tiempo, y cada grano se
pinta en gris si su distancia a ese punto es menor que el radio.

```
distancia = raíz((row - impactRow)² + (col - impactCol)²)
gris si distancia < deathRadius
```

El radio va de 0 al máximo del tablero en unos 800 ms. Cuando termina, se avisa
para que aparezca el texto.

### 7.2 Coste

Una raíz cuadrada por grano y fotograma durante menos de un segundo. Se puede
evitar comparando distancias al cuadrado, sin raíz, que es la optimización
habitual y no cambia el resultado.

---

## 8. El menú en dos pantallas

Estado local en `App.tsx`:

```
menuScreen: 'main' | 'modes'
```

- `main`: logo, nombre, récord del clásico, y tres botones grandes.
- `modes`: los cinco modos restantes, con su marca y el selector de nivel.

`ModePicker` se queda casi igual, pero deja de incluir Clásico y gana un botón
de volver.

---

## 9. Una partida guardada por modo

**Esta es la parte delicada de la versión.**

### 9.1 El cambio

La clave `bloques:save` guarda hoy una partida. Pasa a guardar un mapa:

```
bloques:saves = {
  v: 2,
  classic?: SavedGame,
  sprint?: SavedGame,
  ultra?: SavedGame,
  fixed?: SavedGame,
  zero?: SavedGame,
  sand?: SavedSandGame,
}
```

El modo arena guarda otra cosa: su rejilla de 3.200 granos en lugar de un
tablero de celdas. Se guarda como array normal, ya que `Uint8Array` no
sobrevive a `JSON.stringify`.

### 9.2 La migración

Al leer, si existe `bloques:save` con el formato viejo, su contenido pasa al
modo que indique su campo `mode`, y se escribe el formato nuevo. **La clave
vieja no se borra**, igual que se hizo con los récords en la v4.

### 9.3 Validación

Cada partida se valida por separado. Una corrupta se descarta sola, sin
invalidar las demás. Eso ya lo hace el validador actual; solo hay que aplicarlo
por cada entrada del mapa.

### 9.4 Qué se prueba antes de seguir

1. Dejar un Ultra a medias, jugar un Sprint, y comprobar que el Ultra sigue ahí.
2. Recargar el navegador y comprobar que ambos siguen.
3. Confirmar que los récords no se han tocado.

---

## 10. Orden de construcción

Lo arriesgado primero:

1. **Partidas por modo** — formato nuevo, migración y validación. Probado con
   datos reales antes de nada más.
2. **Cartel de combo** — corrección aislada.
3. **Combos con líneas simultáneas** — una línea.
4. **Equilibrio de arena** — colores y penalización.
5. **Menú en dos pantallas** — necesita el punto 1 para saber qué modos tienen
   partida.
6. **Disposición en móvil** — mucho archivo tocado, ningún riesgo.
7. **Textura de la arena**.
8. **Propagación del gris**.

Los tres últimos son puramente visuales y podrían ir en cualquier orden.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| La migración de partidas pierde datos | Paso 1, probado con datos reales. La clave vieja no se borra |
| Los récords se ven afectados | Viven en otra clave y no se tocan |
| La fila superior no cabe a 320 px | Sección 5.3: quitar el nivel antes que la siguiente pieza |
| La textura hace la arena ilegible | Variación de dos unidades por canal, nada más |
| La propagación del gris va lenta | Comparar distancias al cuadrado, sin raíz |
| Arreglar el cartel rompe los otros dos avisos | Se revisan los tres a la vez: tienen el mismo fallo latente |
