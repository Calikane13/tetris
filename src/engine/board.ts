// Operaciones sobre el tablero.
//
// Todas las funciones son puras: no modifican lo que reciben, devuelven algo
// nuevo. Esto vale también para el tablero, que nunca se altera en el sitio.

import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { getCells } from './tetrominoes';
import type { ActivePiece, Board } from './types';

/** Crea un tablero vacío de 20 filas por 10 columnas (regla R1). */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );
}

/**
 * Comprueba si una pieza cabe en su posición actual.
 *
 * Devuelve false si alguna de sus celdas se sale por los lados o por abajo, o
 * si cae sobre una celda ya ocupada.
 *
 * Salirse por arriba sí se permite: al aparecer, las piezas asoman por encima
 * del tablero y su fila puede ser negativa (regla R5).
 */
export function isValidPosition(board: Board, piece: ActivePiece): boolean {
  const cells = getCells(piece.type, piece.rotation);

  for (const cell of cells) {
    const row = piece.row + cell.row;
    const col = piece.col + cell.col;

    // Fuera por los lados o por debajo.
    if (col < 0 || col >= BOARD_WIDTH || row >= BOARD_HEIGHT) {
      return false;
    }

    // Por encima del tablero: se permite y no hay nada con lo que chocar.
    if (row < 0) {
      continue;
    }

    // Celda ya ocupada.
    if (board[row][col] !== null) {
      return false;
    }
  }

  return true;
}