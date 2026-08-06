// Las formas de las siete piezas, con sus cuatro rotaciones precalculadas.
//
// Cada rotación es una matriz cuadrada de cadenas de texto, donde 'X' marca una
// celda ocupada y '.' una vacía. Se escriben así, y no como números, porque el
// dibujo de la pieza se reconoce de un vistazo en el propio código.
//
// I y O usan matrices de 4x4; el resto, de 3x3.
//
// Se guardan las cuatro rotaciones en lugar de calcularlas girando la matriz en
// tiempo de ejecución: es más código, pero es código que se puede verificar
// mirándolo, y elimina toda una categoría de errores.

import type { PieceType, Rotation } from './types';

type Shape = readonly string[];

export const SHAPES: Record<PieceType, readonly Shape[]> = {
  I: [
    ['....', 'XXXX', '....', '....'],
    ['..X.', '..X.', '..X.', '..X.'],
    ['....', '....', 'XXXX', '....'],
    ['.X..', '.X..', '.X..', '.X..'],
  ],
  O: [
    ['.XX.', '.XX.', '....', '....'],
    ['.XX.', '.XX.', '....', '....'],
    ['.XX.', '.XX.', '....', '....'],
    ['.XX.', '.XX.', '....', '....'],
  ],
  T: [
    ['.X.', 'XXX', '...'],
    ['.X.', '.XX', '.X.'],
    ['...', 'XXX', '.X.'],
    ['.X.', 'XX.', '.X.'],
  ],
  S: [
    ['.XX', 'XX.', '...'],
    ['.X.', '.XX', '..X'],
    ['...', '.XX', 'XX.'],
    ['X..', 'XX.', '.X.'],
  ],
  Z: [
    ['XX.', '.XX', '...'],
    ['..X', '.XX', '.X.'],
    ['...', 'XX.', '.XX'],
    ['.X.', 'XX.', 'X..'],
  ],
  J: [
    ['X..', 'XXX', '...'],
    ['.XX', '.X.', '.X.'],
    ['...', 'XXX', '..X'],
    ['.X.', '.X.', 'XX.'],
  ],
  L: [
    ['..X', 'XXX', '...'],
    ['.X.', '.X.', '.XX'],
    ['...', 'XXX', 'X..'],
    ['XX.', '.X.', '.X.'],
  ],
};

/** Tamaño de la matriz de una pieza: 4 para la I y la O, 3 para el resto. */
export function getMatrixSize(type: PieceType): number {
  return SHAPES[type][0].length;
}

/**
 * Devuelve las celdas ocupadas por una pieza en una rotación concreta, como
 * coordenadas relativas a la esquina superior izquierda de su matriz.
 *
 * Para saber dónde caen en el tablero hay que sumarles la fila y la columna
 * de la pieza activa.
 */
export function getCells(
  type: PieceType,
  rotation: Rotation,
): { row: number; col: number }[] {
  const shape = SHAPES[type][rotation];
  const cells: { row: number; col: number }[] = [];

  for (let row = 0; row < shape.length; row++) {
    const line = shape[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] === 'X') {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

/** Las siete piezas, para el sorteo de la siguiente. */
export const ALL_PIECES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];