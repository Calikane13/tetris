// Todos los valores numéricos y las tablas fijas del juego.
// Si un número aparece en cualquier otro archivo, es que debería estar aquí.

import type { PieceType } from './types';

/* Dimensiones del tablero (reglas R1 y R2 del spec). */
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/* Gravedad (regla R10).
   intervalo = max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (nivel - 1) * LEVEL_SPEEDUP)
   Nivel 1: 800 ms. Nivel 2: 730 ms. A partir del nivel 11 se queda en 80 ms. */
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

/* Desplazamientos que se prueban al rotar, en orden, si la rotación no cabe
   (regla R18). El 0 es el intento en el sitio, sin mover. */
export const ROTATION_OFFSETS = [0, 1, -1, 2, -2];

/* Colores de cada pieza, como clases completas de Tailwind.
   IMPORTANTE: tienen que estar escritas enteras. Tailwind analiza el código
   buscando nombres literales, así que algo como `bg-${color}-400` no generaría
   ninguna clase y las piezas saldrían sin color. */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-300',
  T: 'bg-purple-400',
  S: 'bg-green-400',
  Z: 'bg-red-400',
  J: 'bg-blue-400',
  L: 'bg-orange-400',
};

/* Bordes para la pieza fantasma, en el mismo tono que su pieza (regla R21).
   Mismo motivo que arriba: clases literales, nunca construidas al vuelo. */
export const GHOST_BORDERS: Record<PieceType, string> = {
  I: 'border-cyan-400',
  O: 'border-yellow-300',
  T: 'border-purple-400',
  S: 'border-green-400',
  Z: 'border-red-400',
  J: 'border-blue-400',
  L: 'border-orange-400',
};