// Operaciones sobre la pieza activa: mover, rotar, calcular el fantasma y
// sortear la siguiente. Todas son puras y devuelven objetos nuevos.

import { isValidPosition } from './board';
import { BOARD_WIDTH, ROTATION_OFFSETS } from './constants';
import { ALL_PIECES, getMatrixSize } from './tetrominoes';
import type { ActivePiece, Board, PieceType, Rotation } from './types';

/**
 * Mueve la pieza el número de filas y columnas indicado.
 * Devuelve la pieza movida, o null si la posición destino no es válida
 * (reglas R12 y R14).
 */
export function move(
  board: Board,
  piece: ActivePiece,
  deltaRow: number,
  deltaCol: number,
): ActivePiece | null {
  const moved: ActivePiece = {
    ...piece,
    row: piece.row + deltaRow,
    col: piece.col + deltaCol,
  };

  return isValidPosition(board, moved) ? moved : null;
}

/**
 * Rota la pieza 90 grados (regla R16). direction es 1 para sentido horario
 * y -1 para antihorario.
 *
 * Si la rotación no cabe, se prueban desplazamientos laterales en el orden de
 * ROTATION_OFFSETS: primero en el sitio, luego 1 a la derecha, 1 a la
 * izquierda, 2 a la derecha y 2 a la izquierda (regla R18). Si ninguno
 * funciona, devuelve null y la pieza se queda como estaba.
 *
 * La pieza O tiene sus cuatro rotaciones idénticas, así que rotarla no produce
 * ningún cambio visible sin necesidad de tratarla como caso especial (R17).
 */
export function rotate(
  board: Board,
  piece: ActivePiece,
  direction: 1 | -1,
): ActivePiece | null {
  // El +4 evita un resultado negativo cuando se rota en antihorario desde 0.
  const nextRotation = (((piece.rotation + direction) % 4) + 4) % 4 as Rotation;

  for (const offset of ROTATION_OFFSETS) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: nextRotation,
      col: piece.col + offset,
    };

    if (isValidPosition(board, candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Cuántas celdas caería la pieza si bajara en vertical hasta apoyarse.
 * Se usa para puntuar la caída dura (regla R33).
 */
export function getDropDistance(board: Board, piece: ActivePiece): number {
  let distance = 0;

  while (isValidPosition(board, { ...piece, row: piece.row + distance + 1 })) {
    distance++;
  }

  return distance;
}

/**
 * La posición donde aterrizaría la pieza activa: su fantasma (regla R20).
 *
 * No se guarda en el estado, se calcula al pintar. Es un cálculo trivial y
 * almacenarlo obligaría a acordarse de actualizarlo en cada movimiento.
 */
export function getGhostPosition(board: Board, piece: ActivePiece): ActivePiece {
  return { ...piece, row: piece.row + getDropDistance(board, piece) };
}

/**
 * Sortea la siguiente pieza (reglas R6 y R7).
 *
 * Si sale la misma que la anterior, se repite el sorteo una sola vez. Si vuelve
 * a salir, se acepta: no es una bolsa de siete, es el comportamiento clásico.
 */
export function randomPiece(previous?: PieceType): PieceType {
  const pick = (): PieceType =>
    ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];

  const first = pick();
  return first === previous ? pick() : first;
}

/**
 * Crea una pieza en su posición de aparición: centrada arriba (regla R5).
 *
 * La fila es 0 y no negativa porque las matrices traen filas vacías en su parte
 * superior, así que la pieza ya entra visualmente por arriba.
 */
export function spawnPiece(type: PieceType): ActivePiece {
  const size = getMatrixSize(type);

  return {
    type,
    rotation: 0,
    row: 0,
    col: Math.floor((BOARD_WIDTH - size) / 2),
  };
}