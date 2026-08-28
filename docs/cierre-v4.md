# Cierre de la v4

Notas de lo que pasó al construir la versión 4, para que dentro de unos meses se
entienda por qué las cosas están como están.

---

## Lo que salió bien

**La migración de récords funcionó a la primera.** Era la tarea con más riesgo
del proyecto entero: cambiaba el formato donde vivía el récord del jugador, y un
error habría sido irreversible. Tres decisiones lo evitaron:

- Se hizo **la primera**, antes de tocar nada más, cuando todavía era fácil
  volver atrás.
- La clave antigua `bloques:best` **no se borra**. Sigue ahí, ocupando unos
  bytes, como única red de seguridad.
- Se comprobó mirando `localStorage` directamente en el navegador, no fiándose
  de que el número apareciera bien en pantalla.

**La tabla de modos aguantó.** La regla del plan decía que entre modos solo
podían cambiar cuatro cosas: nivel inicial, si hay gravedad, cuándo termina y
qué marca guarda. Se cumplió sin excepciones, y el resultado se notó en M04:
Cero gravedad funcionó **sin escribir una línea de lógica nueva**, porque la
gravedad opcional ya estaba contemplada en una condición de `addTime()`.

Esa es la prueba de que la abstracción estaba bien elegida.

---

## Fallos encontrados sobre la marcha

### El nivel se reiniciaba en Nivel fijo

**Qué pasaba:** empezabas en nivel 10, las piezas caían rápido, y al fijar la
primera el nivel bajaba a 1.

**Por qué:** el nivel se recalcula al fijar cada pieza con
`levelForLines(totalLines)`. Con cero líneas eso devuelve 1, y pisaba el nivel
elegido.

**La corrección:** `Math.max(state.startLevel, levelForLines(totalLines))`. El
nivel calculado nunca puede bajar del nivel de inicio.

**Lo interesante:** las dos reglas eran correctas por separado. El nivel se
calcula por líneas (regla R35 de la v1) y Nivel fijo arranca donde eliges
(requisito M16 de la v4). El fallo solo existía en su intersección, y por eso no
lo detectó ninguna de las dos especificaciones.

### Los sonidos graves no se oían en el móvil

**Qué pasaba:** tras suavizar los efectos en M09, mover y fijar dejaron de oírse
por completo. Los de línea sí se oían.

**Por qué:** los sonidos suaves se hicieron con frecuencias graves, entre 150 y
220 Hz, y los altavoces de móvil apenas reproducen esas frecuencias. Los de
línea estaban en 523 y 659 Hz, dentro de su rango.

**La corrección:** subir las frecuencias a 300-520 Hz, subir el volumen y
ampliar el corte del filtro. Siguen siendo ondas `sine` y `triangle`, así que
mantienen la suavidad; lo que cambia es que ahora se oyen.

**Lo interesante:** "más suave" se tradujo a "más grave" sin pensarlo, y no es
lo mismo. Lo que hacía chirriar a los sonidos originales era la onda cuadrada,
no la frecuencia.

---

## Decisiones que conviene recordar

**Sprint sin terminar no guarda marca.** Un tiempo a medias no es comparable con
uno completo. La pantalla de resultado lo dice explícitamente.

**El objetivo de Sprint se comprueba antes que el bloqueo.** Si completas las 40
líneas con la última pieza que cabía, cuenta como victoria.

**En Ultra, perder antes de tiempo sí guarda la puntuación.** La alternativa
castigaba demasiado.

**Nivel fijo guarda una marca por cada nivel de inicio.** Empezar en el 12 no
tiene nada que ver con empezar en el 2.

**Los estilos son mapas literales de Tailwind, otra vez.** Cinco estilos por
siete piezas es mucho texto repetitivo, y no hay alternativa: el analizador de
Tailwind solo encuentra las clases que están escritas enteras. Es la tercera vez
en el proyecto que esta restricción condiciona el diseño.

---

## Lecciones

**El orden de las tareas importa tanto como su contenido.** Poner la migración
la primera no fue casualidad: era lo único irreversible.

**Una abstracción buena se nota cuando algo funciona sin escribirlo.** Cero
gravedad salió gratis porque la tabla de modos ya preveía esa variación.

**Los fallos viven en las intersecciones.** El del nivel no estaba en ninguna
especificación porque ambas reglas eran correctas; solo su combinación fallaba.
Probar cada requisito por separado no lo habría encontrado.

**Un adjetivo no es una especificación.** "Sonidos más suaves" se implementó
como "más graves" y salió mal. El requisito debería haber dicho qué se buscaba:
menos armónicos agudos, no menos frecuencia.