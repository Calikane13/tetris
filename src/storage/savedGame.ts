// Partida en curso, para poder reanudarla tras cerrar el navegador (regla R41).
//
// Es la parte más delicada de la persistencia: aquí se guarda el tablero
// entero, y un dato corrupto se traduciría en un tablero imposible de dibujar.
// Por eso la validación al leer es exhaustiva y, ante la mínima duda, se
// descarta todo y se empieza limpio.

import { BOARD_HEIGHT, BOARD_WIDTH } from '../engine/constants';
import { ALL_PIECES } from '../engine/tetrominoes';
import type { ActivePiece, Board, PieceType } from '../engine/types';
import type { ModeId } from './records';
import {
  hasValidVersion,
  readJson,
  removeKey,
  STORAGE_KEYS,
  STORAGE_VERSION,
  writeJson,
} from './safeStorage';

export interface SavedGame {
  board: Board;
  active: ActivePiece;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  /** Modo de la partida (v4, requisito M4). */
  mode: ModeId;
  /** Nivel en el que arrancó. Solo difiere de 1 en Nivel fijo. */
  startLevel: number;
  /** Milisegundos jugados, para no reiniciar los cronómetros al reanudar. */
  elapsed: number;
}

const VALID_MODES: readonly string[] = ['classic', 'sprint', 'ultra', 'fixed', 'zero'];

/** Comprueba que un valor es una de las siete letras de pieza. */
function isPieceType(value: unknown): value is PieceType {
  return typeof value === 'string' && (ALL_PIECES as readonly string[]).includes(value);
}

/** Comprueba que un valor es un número entero no negativo. */
function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Comprueba que un valor es un identificador de modo conocido. */
function isModeId(value: unknown): value is ModeId {
  return typeof value === 'string' && VALID_MODES.includes(value);
}

/**
 * Valida el tablero: tiene que ser exactamente de 20 por 10, y cada celda debe
 * ser null o una letra de pieza válida.
 */
function isBoard(value: unknown): value is Board {
  if (!Array.isArray(value) || value.length !== BOARD_HEIGHT) return false;

  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === BOARD_WIDTH &&
      row.every((cell) => cell === null || isPieceType(cell)),
  );
}

/** Valida la pieza activa. La fila puede ser negativa mientras entra por arriba. */
function isActivePiece(value: unknown): value is ActivePiece {
  if (typeof value !== 'object' || value === null) return false;

  const piece = value as Record<string, unknown>;

  return (
    isPieceType(piece.type) &&
    typeof piece.rotation === 'number' &&
    [0, 1, 2, 3].includes(piece.rotation) &&
    typeof piece.row === 'number' &&
    Number.isInteger(piece.row) &&
    typeof piece.col === 'number' &&
    Number.isInteger(piece.col)
  );
}

/**
 * Lee la partida guardada.
 * Devuelve null si no hay ninguna, si la versión no coincide o si algún dato
 * no supera la validación.
 *
 * Los campos de la v4 (modo, nivel de inicio, tiempo) se rellenan con valores
 * por defecto si faltan, en lugar de invalidar la partida entera: una partida
 * guardada con la v3 se puede reanudar perfectamente como modo clásico.
 */
export function loadSavedGame(): SavedGame | null {
  const data = readJson(STORAGE_KEYS.save);

  if (!hasValidVersion(data)) return null;

  if (
    !isBoard(data.board) ||
    !isActivePiece(data.active) ||
    !isPieceType(data.next) ||
    !isCount(data.score) ||
    !isCount(data.lines) ||
    !isCount(data.level)
  ) {
    // Datos corruptos o de otra versión: se borran para no reintentarlo cada vez.
    removeKey(STORAGE_KEYS.save);
    return null;
  }

  return {
    board: data.board,
    active: data.active,
    next: data.next,
    score: data.score,
    lines: data.lines,
    level: data.level,
    mode: isModeId(data.mode) ? data.mode : 'classic',
    startLevel: isCount(data.startLevel) && data.startLevel > 0 ? data.startLevel : 1,
    elapsed: isCount(data.elapsed) ? data.elapsed : 0,
  };
}

/** Guarda la partida en curso. */
export function saveGame(game: SavedGame): void {
  writeJson(STORAGE_KEYS.save, { v: STORAGE_VERSION, ...game });
}

/** Borra la partida guardada. Se llama al empezar una nueva y al perder. */
export function clearSavedGame(): void {
  removeKey(STORAGE_KEYS.save);
}