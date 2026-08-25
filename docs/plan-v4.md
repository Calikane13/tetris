# plan-v4.md — Cómo se construyen los modos, el sonido y los estilos

Diseño técnico de lo que define `spec-v4.md`.
Si algo choca con `constitution.md`, gana la constitución.

Versión: 4.0
Estado: propuesta

---

## 1. La idea de fondo

Los cinco modos comparten el mismo motor. Lo que cambia entre ellos cabe en
cuatro preguntas:

1. ¿En qué nivel empieza?
2. ¿Cae sola la pieza?
3. ¿Cuándo termina la partida?
4. ¿Qué marca guarda?

Si un modo necesita responder algo distinto a esas cuatro preguntas, es que ya
no es un modo: es otro juego. Esa regla es lo que va a evitar que la v5, con
chuches y arena, se convierta en un lío.

---

## 2. Descripción de un modo

En `src/engine/modes.ts`, un objeto por modo:

```
interface GameMode {
  id: ModeId                        'classic' | 'sprint' | 'ultra' | 'fixed' | 'zero'
  name: string                      Nombre visible
  description: string               Una línea para el menú
  startLevel: number | 'choose'     'choose' solo lo usa Nivel fijo
  gravity: boolean                  false en Cero gravedad
  timer: 'none' | 'up' | 'down'     Cuenta hacia arriba, hacia atrás o no hay
  timeLimit?: number                Segundos, solo si timer es 'down'
  lineGoal?: number                 Líneas, solo en Sprint
  record: 'score' | 'time' | 'none'
}
```

Los cinco modos son cinco objetos de esos. Añadir un sexto modo sin condición
nueva sería añadir un objeto más y nada de código.

**Qué NO va aquí:** nada que dependa de React ni del store. Es una tabla de
datos, no lógica.

---

## 3. El store

### 3.1 Estado nuevo

```
mode: ModeId
startLevel: number         El elegido en Nivel fijo; 1 en los demás
elapsed: number            Milisegundos jugados, para los cronómetros
```

`elapsed` se acumula en el mismo sitio que la gravedad, dentro de `addTime()`.
Un `setInterval` aparte se desincronizaría al pausar y al volver de segundo
plano, que es justo el riesgo apuntado en el spec.

### 3.2 Dónde se decide el fin de partida

Hoy la partida solo termina cuando la pieza nueva no cabe. Ahora hay tres
finales posibles, y conviene que estén en una sola función:

```
checkGameOver(state) →
  'blocked'   la pieza nueva no cabe
  'goal'      Sprint llegó a 40 líneas
  'timeout'   Ultra agotó los 3 minutos
  null        la partida sigue
```

La llaman dos sitios: `advance()`, tras fijar una pieza, y `addTime()`, que es
el único que puede detectar que se acabó el tiempo.

### 3.3 La gravedad opcional

Cero gravedad no necesita código nuevo. En `addTime()`:

```
si (!MODES[mode].gravity) no acumular
```

La pieza se queda donde está hasta que el jugador la baje. La caída suave y la
dura siguen funcionando porque no dependen del acumulador.

---

## 4. Persistencia y migración

### 4.1 El problema

La clave `bloques:best` guarda hoy un solo número. Ahora hacen falta varias
marcas, y una de ellas (Nivel fijo) es a su vez un mapa por nivel.

Cambiar el formato sin más borraría el récord actual del usuario, que es el
riesgo más serio de esta versión.

### 4.2 Formato nuevo

```
bloques:records = {
  v: 2,
  classic: number,
  ultra: number,
  sprint: number,          milisegundos, menor es mejor
  fixed: { [nivel]: number },
}
```

### 4.3 La migración

Al leer, si se encuentra el formato viejo (`bloques:best` con `v: 1`), su valor
pasa a ser `classic` y se escribe el formato nuevo. La clave vieja **no se
borra**: ocupa nada y es una red por si algo sale mal.

Esto se escribe una vez, se prueba con datos reales, y se olvida. Lo importante
es probarlo **antes** de tocar nada más, porque una vez sobrescrito el récord no
hay vuelta atrás.

### 4.4 La partida guardada

`bloques:save` gana `mode`, `startLevel` y `elapsed`. Su validador ya descarta
lo que no cuadra, así que una partida guardada de la v3 se leerá como inválida y
se empezará limpio. Es aceptable: se pierde una partida a medias, no un récord.

### 4.5 Los desbloqueos

Clave aparte, `bloques:unlocks`, con la lista de estilos conseguidos. Separada
de los récords porque se consulta en cada render del tablero y los récords no.

---

## 5. El cronómetro

Un componente `Timer` que lee `elapsed` del store y lo formatea. No tiene lógica
propia: si tuviera su propio contador, se desincronizaría del juego.

Formato: `m:ss` en Ultra, `m:ss.cc` en Sprint, donde las centésimas importan
para comparar marcas.

Los últimos 10 segundos de Ultra cambian de color y laten. Se resuelve con una
clase condicional y una animación en CSS, dentro de la consulta
`prefers-reduced-motion: no-preference`.

---

## 6. Los estilos de bloque

### 6.1 El problema de Tailwind, por tercera vez

Cinco estilos por siete piezas, con varias clases cada uno. La estructura pasa
a ser:

```
BLOCK_STYLES: Record<StyleId, Record<PieceType, PieceStyle>>
```

Todo literal, escrito a mano. Es mucho texto repetitivo y no hay alternativa: el
analizador de Tailwind solo encuentra lo que está escrito entero.

### 6.2 Los cinco estilos

| Estilo | Cómo se dibuja |
|---|---|
| Relieve | El actual: bordes claros arriba e izquierda, oscuros abajo y derecha |
| Plano | Color sólido con esquinas redondeadas, sin bordes |
| Gel | Degradado vertical y un brillo elíptico arriba a la izquierda |
| Neón | Fondo oscuro, borde de color y resplandor exterior |
| Retro | Bordes gruesos cuadrados y color plano, estilo consola de 8 bits |

El brillo del Gel y el resplandor del Neón necesitan un elemento hijo dentro de
la celda, igual que ya hace el barrido de línea. `Cell` recibe el estilo activo
y decide qué dibuja.

### 6.3 Los desbloqueos

Se comprueban en `advance()`, en el mismo sitio donde ya se decide el fin de
partida. Si se cumple una condición y el estilo no estaba desbloqueado, se
guarda y se marca para avisar en pantalla.

El aviso reutiliza el patrón de `LevelUpBanner` y `ComboBanner`.

---

## 7. Los sonidos

Los actuales son un oscilador cuadrado con una envolvente corta. Suenan a
consola vieja porque la onda cuadrada tiene muchos armónicos.

Tres cambios para suavizarlos:

- **Onda `sine` o `triangle`** en lugar de `square`. Es lo que más cambia.
- **Envolvente con ataque más lento**: de 0.01 s a 0.02 s. Quita el chasquido.
- **Un filtro paso bajo** que recorte los agudos.

El volumen general baja: los sonidos de mover y rotar se oyen decenas de veces
por partida y son los que más cansan.

La estructura de `sfx.ts` no cambia: mismos nombres, misma forma de llamarlos.
Solo cambian los valores.

---

## 8. El menú

Pasa de ser un botón a una pantalla de selección:

- Logo y nombre
- Selector de modo: cinco opciones
- Descripción de una línea del modo elegido
- Marca del modo, con corona (salvo Cero gravedad)
- Selector de nivel, solo si el modo es Nivel fijo
- Botón de jugar
- Continuar partida, si la hay
- Ajustes

**Riesgo de espacio.** A 320 × 568 px eso es mucho contenido. Si no cabe, la
salida es que el selector de modo sea una fila de pastillas horizontales en
lugar de una lista vertical, y que la descripción se muestre solo en escritorio.

Nunca desplazamiento dentro de la capa.

---

## 9. Orden de construcción

El orden importa mucho en esta versión:

1. **Migración de récords** — primero, y probada con datos reales. Si esto se
   hace mal, se pierde el récord del usuario y no hay vuelta atrás.
2. **Tabla de modos** — datos, sin lógica.
3. **Modo en el store** — con el clásico funcionando igual que antes.
4. **Nivel fijo y Cero gravedad** — los dos más baratos, y validan que la
   infraestructura funciona.
5. **Cronómetro** — necesario para los dos siguientes.
6. **Sprint y Ultra** — los que tienen condición de fin propia.
7. **Menú con selector** — cuando ya hay algo que seleccionar.
8. **Sonidos** — independiente de todo lo anterior.
9. **Estilos de bloque** — independiente, y el más largo de escribir.

Los pasos 8 y 9 se pueden hacer en cualquier momento. Se dejan al final porque
son los que menos riesgo tienen.

---

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| La migración borra el récord del usuario | Paso 1 del orden, probado con datos reales. La clave vieja no se borra |
| El cronómetro se desincroniza | Vive en `addTime()`, el mismo sitio que la gravedad |
| Cinco modos multiplican los caminos de código | Sección 1: solo cuatro cosas pueden cambiar entre modos |
| Cinco estilos, clases de Tailwind ausentes en producción | Mapas literales, verificado con `npm run build` y vista previa |
| El menú no cabe a 320 px | Sección 8: pastillas horizontales antes que desplazamiento |
| Los sonidos suaves no se oyen en un móvil | Probar sin auriculares, en un móvil real |
