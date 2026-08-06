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
import { sfx } from '../audio/sfx';
import { loadBestScore, saveBestScore } from '../storage/bestScore';
import { clearSavedGame, loadSavedGame, saveGame } from '../storage/savedGame';
import { useSettingsStore } from './useSettingsStore';

interface GameStore {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  score: number;
  best: number;
  lines: number;
  level: number;
  status: GameStatus;
  /** Si hay una partida guardada que se puede reanudar desde el menú. */
  hasSavedGame: boolean;

  startGame: () => void;
  resumeSavedGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  tick: () => void;
  togglePause: () => void;
  exitToMenu: () => void;
  persist: () => void;
}

/**
 * El acumulador de gravedad vive fuera del estado de React a propósito: cambia
 * en cada fotograma y no debe provocar renderizados. Solo lo lee y escribe el
 * bucle de juego a través de addTime().
 */
let dropAccumulator = 0;

/**
 * Reproduce un efecto solo si el sonido está activado en los ajustes.
 * Centralizarlo aquí evita repetir la comprobación en cada acción.
 */
function play(effect: () => void): void {
  if (useSettingsStore.getState().sound) {
    effect();
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(),
  active: null,
  next: randomPiece(),
  score: 0,
  best: loadBestScore(),
  lines: 0,
  level: 1,
  status: 'menu',
  hasSavedGame: loadSavedGame() !== null,

  startGame: () => {
    const first = randomPiece();
    dropAccumulator = 0;
    clearSavedGame();

    set({
      board: createEmptyBoard(),
      active: spawnPiece(first),
      next: randomPiece(first),
      score: 0,
      lines: 0,
      level: 1,
      status: 'playing',
      hasSavedGame: false,
    });
  },

  resumeSavedGame: () => {
    const saved = loadSavedGame();

    // Si entre la carga del menú y la pulsación del botón la partida dejó de
    // ser válida, se empieza una nueva en lugar de fallar.
    if (!saved) {
      get().startGame();
      return;
    }

    dropAccumulator = 0;

    set({
      board: saved.board,
      active: saved.active,
      next: saved.next,
      score: saved.score,
      lines: saved.lines,
      level: saved.level,
      status: 'playing',
    });
  },

  moveLeft: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 0, -1);
    if (moved) {
      set({ active: moved });
      play(sfx.move);
    }
  },

  moveRight: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const moved = move(board, active, 0, 1);
    if (moved) {
      set({ active: moved });
      play(sfx.move);
    }
  },

  rotateCW: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const rotated = rotate(board, active, 1);
    if (rotated) {
      set({ active: rotated });
      play(sfx.rotate);
    }
  },

  rotateCCW: () => {
    const { board, active, status } = get();
    if (status !== 'playing' || !active) return;

    const rotated = rotate(board, active, -1);
    if (rotated) {
      set({ active: rotated });
      play(sfx.rotate);
    }
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

    play(sfx.hardDrop);
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

    if (status === 'playing') {
      get().persist();
      set({ status: 'paused' });
    } else if (status === 'paused') {
      set({ status: 'playing' });
    }
  },

  exitToMenu: () => {
    get().persist();
    set({ status: 'menu', hasSavedGame: loadSavedGame() !== null });
  },

  /**
   * Vuelca la partida actual a localStorage. La llaman la pausa, la salida al
   * menú y el evento de ocultar la pestaña.
   */
  persist: () => {
    const { board, active, next, score, lines, level, status } = get();

    // Solo tiene sentido guardar una partida viva.
    if (status !== 'playing' || !active) return;

    saveGame({ board, active, next, score, lines, level });
  },
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

  // El sonido de limpiar líneas sustituye al de fijar: si sonaran los dos a la
  // vez se solaparían y se oiría un ruido sucio.
  if (clearedCount > 0) {
    play(() => sfx.clear(clearedCount));
  } else {
    play(sfx.lock);
  }

  if (newLevel > state.level) {
    play(sfx.levelUp);
  }

  // Si la pieza nueva no cabe nada más aparecer, la partida termina (regla R38).
  // Es el único momento en que se guarda el récord: hacerlo en cada punto
  // escribiría en localStorage cientos de veces por partida sin ninguna ganancia.
  if (!isValidPosition(cleared, upcoming)) {
    clearSavedGame();
    play(sfx.gameOver);

    set({
      board: cleared,
      active: null,
      score: newScore,
      best: saveBestScore(newScore),
      lines: totalLines,
      level: newLevel,
      status: 'gameover',
      hasSavedGame: false,
    });
    return;
  }

  const nextPiece = randomPiece(state.next);

  set({
    board: cleared,
    active: upcoming,
    next: nextPiece,
    score: newScore,
    lines: totalLines,
    level: newLevel,
  });

  // Se guarda al fijar cada pieza: es el punto natural de la partida, y así
  // como mucho se pierde una pieza si el navegador se cierra de golpe.
  saveGame({
    board: cleared,
    active: upcoming,
    next: nextPiece,
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