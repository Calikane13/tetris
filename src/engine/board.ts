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
/**
 * Fija una pieza en el tablero: convierte sus celdas en celdas permanentes
 * (regla R25). Devuelve un tablero nuevo; el original no se toca.
 *
 * Las celdas que queden por encima del tablero se descartan, ya que no tienen
 * sitio donde guardarse.
 */
export function lockPiece(board: Board, piece: ActivePiece): Board {
  const next = board.map((row) => [...row]);
  const cells = getCells(piece.type, piece.rotation);

  for (const cell of cells) {
    const row = piece.row + cell.row;
    const col = piece.col + cell.col;

    if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
      next[row][col] = piece.type;
    }
  }

  return next;
}

/**
 * Elimina las filas completas y baja las de arriba (reglas R27, R28, R29).
 *
 * Devuelve el tablero nuevo y cuántas filas se eliminaron, porque quien llama
 * necesita ese número para puntuar.
 *
 * El truco: en vez de borrar filas y desplazar el resto, nos quedamos con las
 * filas que NO están completas y añadimos filas vacías arriba hasta recuperar
 * la altura. El resultado es el mismo y no hay índices que descuadrar.
 */
export function clearLines(board: Board): { board: Board; cleared: number } {
  const survivors = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - survivors.length;

  if (cleared === 0) {
    return { board, cleared: 0 };
  }

  const emptyRows: Board = Array.from({ length: cleared }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );

  return { board: [...emptyRows, ...survivors], cleared };
}