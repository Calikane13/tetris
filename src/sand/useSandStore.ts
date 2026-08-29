// Estado del modo arena (v5, requisitos A6 a A9, A13, A14).
//
// Store propio, separado del clásico. Comparte la forma de las acciones (mover,
// rotar, caídas) para que los controles funcionen igual, pero no comparte
// código: el tablero, la caída y la limpieza son otra cosa.
//
// La pieza activa vive en la rejilla gruesa de 10x20, no en la de granos. Eso
// es lo que permite reutilizar rotación y colisiones del motor clásico sin
// tocar una línea: mientras cae, la pieza es un bloque rígido normal. Solo al
// fijarse se convierte en arena.

import { create } from 'zustand';
import { randomPiece, spawnPiece } from '../engine/piece';
import { getCells } from '../engine/tetrominoes';
import type { ActivePiece, PieceType } from '../engine/types';
import { sfx } from '../audio/sfx';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  CELL_COLS,
  CELL_ROWS,
  DANGER_ROW,
  GRAINS_PER_CELL,
  INITIAL_COLORS,
} from './constants';
import { copyGrid, createGrid, fillCell, type SandGrid } from './grid';
import { isAboveDanger, stepPhysics } from './physics';

/**
 * Fase del modo.
 *
 * 'falling'   la pieza se controla, como siempre
 * 'settling'  la pieza se desmoronó, la arena cae, no se acepta entrada
 * 'gameover'  se acabó
 *
 * Es el mismo patrón de fases que la animación de línea de la v2.
 */
export type SandPhase = 'menu' | 'falling' | 'settling' | 'paused' | 'gameover';

interface SandStore {
  grid: SandGrid;
  active: ActivePiece | null;
  /** Color de la pieza activa. Va aparte de su forma (requisito A8). */
  activeColor: number;
  next: PieceType;
  nextColor: number;
  phase: SandPhase;
  score: number;
  /** Cuántos colores están en juego ahora mismo. */
  colorCount: number;

  startGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  exitToMenu: () => void;
}

/** Acumulador de gravedad, fuera del estado para no provocar renderizados. */
let dropAccumulator = 0;

/** Intervalo de caída de la pieza, en milisegundos. */
const DROP_INTERVAL = 700;

/** Reproduce un efecto solo si el sonido está activado en los ajustes. */
function play(effect: () => void): void {
  if (useSettingsStore.getState().sound) {
    effect();
  }
}

/** Un color al azar entre los disponibles ahora mismo. */
function randomColor(colorCount: number): number {
  return 1 + Math.floor(Math.random() * colorCount);
}

/**
 * Comprueba si la pieza cabe en el tablero grueso.
 *
 * No se puede usar isValidPosition del motor clásico porque aquel consulta un
 * tablero de celdas, y aquí lo que hay debajo son granos. Se traduce cada celda
 * de la pieza a su cuadrado de granos y se mira si alguno está ocupado.
 */
function fits(grid: SandGrid, piece: ActivePiece): boolean {
  for (const cell of getCells(piece.type, piece.rotation)) {
    const cellRow = piece.row + cell.row;
    const cellCol = piece.col + cell.col;

    // Fuera por los lados o por abajo.
    if (cellCol < 0 || cellCol >= CELL_COLS || cellRow >= CELL_ROWS) return false;

    // Por encima del tablero se permite, como en el juego clásico.
    if (cellRow < 0) continue;

    // ¿Hay algún grano en el cuadrado que ocuparía esta celda?
    const startRow = cellRow * GRAINS_PER_CELL;
    const startCol = cellCol * GRAINS_PER_CELL;

    for (let r = 0; r < GRAINS_PER_CELL; r++) {
      for (let c = 0; c < GRAINS_PER_CELL; c++) {
        const row = startRow + r;
        const col = startCol + c;
        if (grid[row * (CELL_COLS * GRAINS_PER_CELL) + col] !== 0) return false;
      }
    }
  }

  return true;
}

/** Mueve la pieza si cabe. Devuelve la nueva posición o null. */
function tryMove(
  grid: SandGrid,
  piece: ActivePiece,
  deltaRow: number,
  deltaCol: number,
): ActivePiece | null {
  const moved = { ...piece, row: piece.row + deltaRow, col: piece.col + deltaCol };
  return fits(grid, moved) ? moved : null;
}

export const useSandStore = create<SandStore>((set, get) => ({
  grid: createGrid(),
  active: null,
  activeColor: 1,
  next: randomPiece(),
  nextColor: 1,
  phase: 'menu',
  score: 0,
  colorCount: INITIAL_COLORS,

  startGame: () => {
    dropAccumulator = 0;

    const first = randomPiece();

    set({
      grid: createGrid(),
      active: spawnPiece(first),
      activeColor: randomColor(INITIAL_COLORS),
      next: randomPiece(first),
      nextColor: randomColor(INITIAL_COLORS),
      phase: 'falling',
      score: 0,
      colorCount: INITIAL_COLORS,
    });
  },

  moveLeft: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    const moved = tryMove(grid, active, 0, -1);
    if (moved) {
      set({ active: moved });
      play(sfx.move);
    }
  },

  moveRight: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    const moved = tryMove(grid, active, 0, 1);
    if (moved) {
      set({ active: moved });
      play(sfx.move);
    }
  },

  rotateCW: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    // La rotación del motor clásico necesita un tablero de celdas. Aquí se
    // prueba a mano cada desplazamiento contra la rejilla de granos.
    const rotated = rotateAgainstSand(grid, active, 1);
    if (rotated) {
      set({ active: rotated });
      play(sfx.rotate);
    }
  },

  rotateCCW: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    const rotated = rotateAgainstSand(grid, active, -1);
    if (rotated) {
      set({ active: rotated });
      play(sfx.rotate);
    }
  },

  softDrop: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    const moved = tryMove(grid, active, 1, 0);

    if (moved) {
      dropAccumulator = 0;
      set({ active: moved });
    } else {
      crumble(set, get);
    }
  },

  hardDrop: () => {
    const { grid, active, phase } = get();
    if (phase !== 'falling' || !active) return;

    let distance = 0;
    while (tryMove(grid, active, distance + 1, 0)) {
      distance++;
    }

    set({ active: { ...active, row: active.row + distance } });
    play(sfx.hardDrop);
    crumble(set, get);
  },

  togglePause: () => {
    const { phase } = get();
    if (phase === 'falling') set({ phase: 'paused' });
    else if (phase === 'paused') set({ phase: 'falling' });
  },

  exitToMenu: () => set({ phase: 'menu' }),
}));

/**
 * Rota la pieza contra la rejilla de granos.
 *
 * Misma idea que rotate() del motor clásico, incluidos los desplazamientos
 * laterales de la regla R18, pero comprobando contra granos.
 */
function rotateAgainstSand(
  grid: SandGrid,
  piece: ActivePiece,
  direction: 1 | -1,
): ActivePiece | null {
  const nextRotation = ((((piece.rotation + direction) % 4) + 4) % 4) as 0 | 1 | 2 | 3;

  for (const offset of [0, 1, -1, 2, -2]) {
    const candidate = { ...piece, rotation: nextRotation, col: piece.col + offset };
    if (fits(grid, candidate)) return candidate;
  }

  return null;
}

/**
 * Desmorona la pieza activa en granos (requisito A9).
 *
 * Cada bloque de la pieza se convierte en GRAINS_PER_CELL granos por lado, del
 * color de la pieza. A partir de ese momento cada grano cae por su cuenta.
 */
function crumble(
  set: (partial: Partial<SandStore>) => void,
  get: () => SandStore,
): void {
  const state = get();
  if (!state.active) return;

  const grid = copyGrid(state.grid);

  for (const cell of getCells(state.active.type, state.active.rotation)) {
    const cellRow = state.active.row + cell.row;
    const cellCol = state.active.col + cell.col;

    if (cellRow < 0) continue;

    fillCell(grid, cellRow, cellCol, state.activeColor, GRAINS_PER_CELL);
  }

  play(sfx.lock);

  set({
    grid,
    active: null,
    phase: 'settling',
  });
}

/**
 * Un paso del bucle del modo. La llama useSandLoop en cada fotograma.
 *
 * En 'falling' aplica la gravedad de la pieza. En 'settling' hace caer la
 * arena un paso; cuando ya no se mueve nada, saca la siguiente pieza.
 */
export function sandTick(delta: number): void {
  const state = useSandStore.getState();

  if (state.phase === 'settling') {
    const grid = copyGrid(state.grid);
    const moved = stepPhysics(grid);

    if (moved) {
      // Todavía cae arena: se dibuja el paso y se sigue en la próxima vuelta.
      useSandStore.setState({ grid });
      return;
    }

    // La arena se asentó. Aquí entrará la búsqueda de masas en S05.
    spawnNext(grid);
    return;
  }

  if (state.phase !== 'falling' || !state.active) return;

  dropAccumulator += delta;

  while (dropAccumulator >= DROP_INTERVAL) {
    dropAccumulator -= DROP_INTERVAL;

    const current = useSandStore.getState();
    if (!current.active) return;

    const moved = tryMove(current.grid, current.active, 1, 0);

    if (moved) {
      useSandStore.setState({ active: moved });
    } else {
      crumble(useSandStore.setState, useSandStore.getState);
      return;
    }
  }
}

/** Saca la siguiente pieza y comprueba el fin de partida. */
function spawnNext(grid: SandGrid): void {
  const state = useSandStore.getState();

  // Si la arena ha superado la línea roja, se acabó (requisito A27).
  if (isAboveDanger(grid, DANGER_ROW)) {
    play(sfx.gameOver);
    useSandStore.setState({ grid, active: null, phase: 'gameover' });
    return;
  }

  const upcoming = spawnPiece(state.next);

  if (!fits(grid, upcoming)) {
    play(sfx.gameOver);
    useSandStore.setState({ grid, active: null, phase: 'gameover' });
    return;
  }

  dropAccumulator = 0;

  useSandStore.setState({
    grid,
    active: upcoming,
    activeColor: state.nextColor,
    next: randomPiece(state.next),
    nextColor: randomColor(state.colorCount),
    phase: 'falling',
  });
}