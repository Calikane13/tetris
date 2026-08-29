// Constantes del modo arena (v5).
//
// Todo lo que sea un número del modo vive aquí. Si aparece un valor suelto en
// physics.ts o en el store, es que debería estar en este archivo.

/**
 * En cuántos granos se rompe cada celda del tablero clásico, por lado.
 *
 * Con 4, una celda son 16 granos y el tablero pasa de 10x20 a 40x80, es decir,
 * 3.200 granos.
 *
 * Este número es la palanca de rendimiento del modo (requisito A2). Subirlo a 8
 * da arena más fina pero cuadruplica el trabajo por fotograma; bajarlo a 2 lo
 * divide por cuatro. Si en un móvil hay tirones, este es el número que se toca,
 * y nada más.
 */
export const GRAINS_PER_CELL = 4;

/** Tablero clásico, para la pieza que todavía no se ha desmoronado. */
export const CELL_COLS = 10;
export const CELL_ROWS = 20;

/** Tablero de granos. */
export const SAND_COLS = CELL_COLS * GRAINS_PER_CELL; // 40
export const SAND_ROWS = CELL_ROWS * GRAINS_PER_CELL; // 80
export const SAND_SIZE = SAND_COLS * SAND_ROWS; // 3200

/** Valor de un grano vacío. Los colores van del 1 en adelante. */
export const EMPTY = 0;

/**
 * Colores de la arena, en hexadecimal.
 *
 * Van en hexadecimal y no como clases de Tailwind porque canvas no entiende
 * CSS: hay que darle un color literal. Es duplicación respecto a los colores
 * del juego clásico, y se acepta porque son dos técnicas de dibujo distintas.
 *
 * El índice 0 queda sin usar: corresponde a EMPTY.
 */
export const SAND_COLORS: readonly string[] = [
  '#000000', // 0, nunca se dibuja
  '#22d3ee', // 1 cian
  '#4ade80', // 2 verde
  '#fbbf24', // 3 amarillo
  '#f87171', // 4 rojo
  '#c084fc', // 5 morado
];

/** Nombres para los avisos en pantalla. */
export const SAND_COLOR_NAMES: readonly string[] = [
  '',
  'Cian',
  'Verde',
  'Amarillo',
  'Rojo',
  'Morado',
];

/**
 * Puntuación a la que entra cada color (requisitos A21 y A22).
 *
 * Los tres primeros tienen umbral 0: están desde el principio. El cuarto y el
 * quinto aparecen al puntuar.
 *
 * Esta es la curva de dificultad del modo: con pocos colores es fácil que la
 * arena nueva conecte con la que ya hay; cada color añadido fragmenta los
 * montones sin necesidad de subir la velocidad.
 */
export const COLOR_THRESHOLDS: readonly number[] = [0, 0, 0, 0, 10000, 30000];

/** Cuántos colores hay al empezar. */
export const INITIAL_COLORS = 3;

/**
 * Si dos granos en diagonal cuentan como conectados (requisito A16).
 *
 * OJO: este es el valor más delicado del modo. Con true, las masas se forman
 * con mucha facilidad porque basta que dos granos se toquen por una esquina, y
 * el tablero puede limpiarse casi solo. Si al jugar resulta trivial, ponerlo en
 * false y la conexión pasa a ser solo por lados.
 */
export const DIAGONAL_CONNECTION = true;

/**
 * Fila del límite superior, en granos.
 *
 * Si la arena la supera, la partida termina (requisito A27). Se dibuja como una
 * línea roja.
 */
export const DANGER_ROW = GRAINS_PER_CELL * 2; // dos celdas desde arriba

/** Tope de eliminaciones encadenadas, por si una combinación se realimenta. */
export const MAX_CHAIN = 20;

/** Puntos por grano eliminado, antes de aplicar el multiplicador de cadena. */
export const POINTS_PER_GRAIN = 2;

/** Milisegundos que las masas se iluminan antes de desaparecer. */
export const MASS_FLASH_MS = 260;