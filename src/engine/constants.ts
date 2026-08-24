// Todos los valores numéricos y las tablas fijas del juego.
// Si un número aparece en cualquier otro archivo, es que debería estar aquí.

import type { PieceType } from './types';

/* Dimensiones del tablero (reglas R1 y R2 del spec). */
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/* Gravedad (regla R10).
   intervalo = max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (nivel - 1) * LEVEL_SPEEDUP)
   Nivel 1: 800 ms. Nivel 2: 730 ms. Nivel 11: 100 ms. Desde el 12: 80 ms. */
export const BASE_DROP_INTERVAL = 800;
export const LEVEL_SPEEDUP = 70;
export const MIN_DROP_INTERVAL = 80;

/* Repetición del movimiento al mantener pulsado (regla R13).
   La primera repetición tarda más para que un toque suelto mueva una sola celda. */
export const REPEAT_DELAY = 170;
export const REPEAT_INTERVAL = 50;

/* Límite del salto de tiempo entre fotogramas.
   Evita que la pieza caiga de golpe al volver de una pestaña en segundo plano. */
export const MAX_FRAME_DELTA = 100;

/* Puntuación por líneas eliminadas de una vez (regla R31).
   El valor se multiplica después por el nivel actual. */
export const LINE_POINTS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

/* Puntos por celda descendida (reglas R32 y R33). */
export const SOFT_DROP_POINTS = 1;
export const HARD_DROP_POINTS = 2;

/* Líneas necesarias para subir de nivel (regla R35). */
export const LINES_PER_LEVEL = 10;

/* Combos (v3, requisitos C3, C7 y C8).

   COMBO_BASE es el extra por punto de racha: el bono es COMBO_BASE * racha * nivel.

   COMBO_GRACE es cuántas piezas seguidas sin eliminar línea rompen la racha. Con
   3, las dos primeras la mantienen viva y la tercera la corta. Es más generoso
   que lo habitual en el género, y a propósito: hace la racha alcanzable para
   quien no juega a diario. Si al probarlo resulta demasiado fácil, este es el
   número que hay que bajar. */
export const COMBO_BASE = 50;
export const COMBO_GRACE = 3;

/* Cuánto tiempo se ve el cartel de combo, en milisegundos. */
export const COMBO_BANNER_MS = 900;

/* Desplazamientos que se prueban al rotar, en orden, si la rotación no cabe
   (regla R18). El 0 es el intento en el sitio, sin mover. */
export const ROTATION_OFFSETS = [0, 1, -1, 2, -2];

/*
  Colores de cada pieza, como clases completas de Tailwind (v2, requisitos
  V10-V12).

  Cada pieza tiene tres tonos:
    fill   relleno principal
    light  bordes superior e izquierdo, para simular la luz
    dark   bordes inferior y derecho, para la sombra

  IMPORTANTE: tienen que estar escritas enteras. Tailwind analiza el código
  buscando nombres literales, así que algo como `bg-${color}-400` no generaría
  ninguna clase y las piezas saldrían sin color. Por eso este mapa es repetitivo
  a propósito: es la forma de que el analizador las encuentre.
*/
export interface PieceStyle {
  fill: string;
  light: string;
  dark: string;
}

export const PIECE_STYLES: Record<PieceType, PieceStyle> = {
  I: { fill: 'bg-cyan-400', light: 'border-t-cyan-200 border-l-cyan-200', dark: 'border-b-cyan-700 border-r-cyan-700' },
  O: { fill: 'bg-yellow-300', light: 'border-t-yellow-100 border-l-yellow-100', dark: 'border-b-yellow-600 border-r-yellow-600' },
  T: { fill: 'bg-purple-400', light: 'border-t-purple-200 border-l-purple-200', dark: 'border-b-purple-700 border-r-purple-700' },
  S: { fill: 'bg-green-400', light: 'border-t-green-200 border-l-green-200', dark: 'border-b-green-700 border-r-green-700' },
  Z: { fill: 'bg-red-400', light: 'border-t-red-200 border-l-red-200', dark: 'border-b-red-700 border-r-red-700' },
  J: { fill: 'bg-blue-400', light: 'border-t-blue-200 border-l-blue-200', dark: 'border-b-blue-700 border-r-blue-700' },
  L: { fill: 'bg-orange-400', light: 'border-t-orange-200 border-l-orange-200', dark: 'border-b-orange-700 border-r-orange-700' },
};

/* Bordes para la pieza fantasma, en el mismo tono que su pieza (regla R21).
   El fantasma no lleva relieve, para que no se confunda con un bloque real
   (requisito V13). */
export const GHOST_BORDERS: Record<PieceType, string> = {
  I: 'border-cyan-400',
  O: 'border-yellow-300',
  T: 'border-purple-400',
  S: 'border-green-400',
  Z: 'border-red-400',
  J: 'border-blue-400',
  L: 'border-orange-400',
};

/* Animación de limpieza de líneas (v2, requisitos V2 y V9).

   LINE_CLEAR_MS es la duración de la fase completa: el tiempo que el juego pasa
   detenido mientras se ve el barrido. El mismo número lo usan el store, para
   programar el temporizador, y el CSS, para la animación.

   LINE_CLEAR_STEP_MS es el retraso entre una columna y la siguiente, que es lo
   que hace que la luz parezca desplazarse en lugar de encenderse toda a la vez. */
export const LINE_CLEAR_MS = 300;
export const LINE_CLEAR_STEP_MS = 20;