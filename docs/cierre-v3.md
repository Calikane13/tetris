# Cierre de la v3

Notas de lo que pasó al terminar la versión 3, para que dentro de unos meses se
entienda por qué las cosas están como están.

---

## Tareas añadidas sobre la marcha

Estas no estaban en `tasks-v3.md`. Aparecieron al probar y se resolvieron antes
de cerrar la versión.

### C11 · Los botones táctiles tapaban el HUD

**Qué pasaba:** los botones iban fijos al fondo de la pantalla, así que
flotaban sobre el contenido en lugar de reservar sitio. Con el HUD debajo del
tablero, quedaba oculto detrás de ellos.

**De cuándo venía:** de la v1, tarea T25. No se detectó entonces porque el HUD
tenía la puntuación arriba y ocupaba menos. Al mover la puntuación en la v2
(requisito V15), el problema quedó al descubierto.

**Primer intento, fallido:** añadir espacio al final de la página. Reservaba
sitio, pero el contenido total pasaba a ser más alto que la pantalla, así que
aparecía desplazamiento vertical y el problema se movía en lugar de resolverse.

**Solución definitiva:** tres cambios a la vez.

- La celda baja a `min(9vw, 3vh, 30px)` en móvil. Las 20 filas ocupan el 60% de
  la altura y queda un 40% real para lo demás. El límite anterior de `3.5vh`
  venía de cuando el tablero era casi lo único en pantalla.
- Los botones se reparten alrededor del tablero en vez de amontonarse en una
  barra: rotar y bajar pegados a su lado izquierdo, caída rápida al derecho, y
  los de mover en la fila inferior, uno en cada extremo con el HUD entre ellos.
  Dejan de robar altura y no se solapan con nada.
- `h-dvh` con `overflow-hidden` en lugar de `min-h-dvh`: la página deja de
  poder desplazarse, que era el síntoma que delataba el problema de fondo.

`TouchControls.tsx` pasa a exportar cuatro componentes en lugar de uno, porque
los botones ya no viven todos en el mismo sitio de la pantalla.

---

## Cambio de proveedor de despliegue

`plan.md` dice que el despliegue es Netlify. Ya no lo es.

**Netlify** dejó de desplegar al agotarse los créditos del ciclo de
facturación. Los push seguían llegando a GitHub, pero los despliegues salían
como `skipped`, lo que hizo que durante días se estuviera mirando una versión
antigua sin saberlo.

**Cloudflare** se probó a continuación. El build compilaba en 253 ms, pero el
despliegue fallaba: su panel está en mitad de una migración entre Workers y
Pages, y el flujo de creación lleva a un Worker aunque lo que hagas sea un sitio
estático.

**GitHub Pages** es la solución actual, y la más sensata desde el principio: el
código ya estaba en GitHub, no hay créditos que agotar, y el despliegue va en el
propio repositorio.

Detalle que hay que recordar: Pages sirve el sitio en una subcarpeta con el
nombre del repositorio, así que `vite.config.ts` necesita `base: '/tetris/'`.
Sin eso, el HTML pide los archivos a la raíz del dominio, no los encuentra, y se
ve una pantalla en blanco.

**Consecuencia de haber cambiado de dominio tres veces:** el récord y la partida
guardada de cada dominio anterior siguen en el navegador, pero no viajan. Es
cómo funciona el almacenamiento del navegador, no un fallo.

---

## Lecciones

**El criterio "cabe en 320 px" no basta.** Se cumplía y aun así la interfaz
estaba rota: cabía, pero con cosas superpuestas. Un criterio de aceptación
mejor sería "todo visible a la vez y sin desplazamiento".

**Reservar espacio no es lo mismo que hacer sitio.** El primer intento añadía
hueco sin reducir nada, y el contenido se salía igual.

**Un valor calculado para un contexto caduca cuando cambia el contexto.** El
`3.5vh` de la celda era correcto en la v1 y dejó de serlo en cuanto el tablero
tuvo compañía en la pantalla.

**Depender de créditos de un proveedor gratuito es un riesgo real**, y no
estaba en ninguna tabla de riesgos. Ahora sí lo estaría.