// Estado de la partida y acciones que lo modifican.
//
// Este archivo no contiene reglas del juego: cada acción llama al motor y
// guarda lo que devuelve. Si aquí apareciera un bucle recorriendo el tablero,
// esa lógica estaría en el sitio equivocado.

import { create } from 'zustand';
import { clearLines, createEmptyBoard, isValidPosition, lockPiece } from '../engine/board';
import { HARD_DROP_POINTS, SOFT_DROP_POINTS } from '../engine/constants';
import {
  getDropDistance,
  move,
  randomPiece,
  rotate,
  spawnPiece,
} from '../engine/piece';
import { dropIntervalForLevel, levelForLines, scoreForLines } from '../engine/scoring';
import type { ActivePiece, Board, GameStatus, PieceType } from '../engine/types';

interface GameStore {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;

  startGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  tick: () => void;
  togglePause: () => void;
  exitToMenu: () => void;
}

/**
 * El acumulador de gravedad vive fuera del estado de React a propósito: cambia
 * en cada fotograma y no debe provocar renderizados. Solo lo lee y escribe el
 * bucle de juego a través de addTime().
 */
let dropAccumulator = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(),
  active: null,
  next: randomPiece(),
  score: 0,
  lines: 0,
  level: 1,
  status: 'menu',

  startGame: () => {
    const first = randomPiece();
    dropAccumulator = 0;

    set({
      board: createEmptyBoard(),
      active: spawnPiece(first),
      next: randomPiece(first),
      score: 0,
      lines: 0,
      level: 1,
      status: 'playing',
    });
  },

  moveLeft: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 0, -1);
    if (moved) set({ active: moved });
  },

  moveRight: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 0, 1);
    if (moved) set({ active: moved });
  },

  rotateCW: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const rotated = rotate(board, active, 1);
    if (rotated) set({ active: rotated });
  },

  rotateCCW: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const rotated = rotate(board, active, -1);
    if (rotated) set({ active: rotated });
  },

  softDrop: () => {
    const { board, active, score, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 1, 0);

    if (moved) {
      dropAccumulator = 0;
      set({ active: moved, score: score + SOFT_DROP_POINTS });
    } else {
      lockAndAdvance(set, get);
    }
  },

  hardDrop: () => {
    const { board, active, score, status } = get();
    if (status !== 'playing' || !active) return;

    const distance = getDropDistance(board, active);

    set({
      active: { ...active, row: active.row + distance },
      score: score + distance * HARD_DROP_POINTS,
    });

    lockAndAdvance(set, get);
  },

  tick: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 1, 0);

    if (moved) {
      set({ active: moved });
    } else {
      lockAndAdvance(set, get);
    }
  },

  togglePause: () => {
    const { status } = get();

    if (status === 'playing') set({ status: 'paused' });
    else if (status === 'paused') set({ status: 'playing' });
  },

  exitToMenu: () => set({ status: 'menu' }),
}));

/**
 * Secuencia completa de fijar una pieza: fijarla, limpiar líneas, puntuar,
 * recalcular el nivel, sacar la siguiente y comprobar el fin de partida.
 *
 * Vive en una sola función porque la llaman tres sitios distintos (la gravedad,
 * la caída suave y la caída dura), y separarla es la forma de que los tres
 * hagan exactamente lo mismo.
 */
function lockAndAdvance(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): void {
  const state = get();
  if (!state.active) return;

  const locked = lockPiece(state.board, state.active);
  const { board: cleared, cleared: clearedCount } = clearLines(locked);

  const totalLines = state.lines + clearedCount;
  const newLevel = levelForLines(totalLines);
  const newScore = state.score + scoreForLines(clearedCount, state.level);

  const upcoming = spawnPiece(state.next);
  dropAccumulator = 0;

  // Si la pieza nueva no cabe nada más aparecer, la partida termina (regla R38).
  if (!isValidPosition(cleared, upcoming)) {
    set({
      board: cleared,
      active: null,
      score: newScore,
      lines: totalLines,
      level: newLevel,
      status: 'gameover',
    });
    return;
  }

  set({
    board: cleared,
    active: upcoming,
    next: randomPiece(state.next),
    score: newScore,
    lines: totalLines,
    level: newLevel,
  });
}

/**
 * Acumula el tiempo transcurrido y aplica la gravedad cuando toca.
 * La llama el bucle de juego en cada fotograma.
 */
export function addTime(delta: number): void {
  const { status, level, tick } = useGameStore.getState();
  if (status !== 'playing') return;

  dropAccumulator += delta;

  const interval = dropIntervalForLevel(level);

  while (dropAccumulator >= interval) {
    dropAccumulator -= interval;
    tick();
  }
}