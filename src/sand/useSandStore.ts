// Estado del modo arena (v5, requisitos A6 a A9, A13 a A20, A25 a A27).
//
// Store propio, separado del clásico. Comparte la forma de las acciones (mover,
// rotar, caídas) para que los controles funcionen igual, pero no comparte
// código: el tablero, la caída y la limpieza son otra cosa.
//
// La pieza activa vive en la rejilla gruesa de 10x20, no en la de granos. Eso
// es lo que permite reutilizar las formas y la lógica de rotación sin
// reescribirlas: mientras cae, la pieza es un bloque rígido normal. Solo al
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
  COLOR_THRESHOLDS,
  DANGER_ROW,
  GRAINS_PER_CELL,
  INITIAL_COLORS,
  MASS_FLASH_MS,
  MAX_CHAIN,
  POINTS_PER_GRAIN,
  SAND_COLORS,
} from './constants';
import { copyGrid, createGrid, fillCell, type SandGrid } from './grid';
import { findConnectedMasses, removeMass } from './masses';
import { isAboveDanger, stepPhysics } from './physics';

/**
 * Fase del modo.
 *
 * 'falling'   la pieza se controla, como siempre
 * 'settling'  la pieza se desmoronó, la arena cae, no se acepta entrada
 * 'flashing'  hay masas iluminándose antes de desaparecer
 *
 * Es el mismo patrón de fases que la animación de línea de la v2.
 */
export type SandPhase =
  | 'menu'
  | 'falling'
  | 'settling'
  | 'flashing'
  | 'paused'
  | 'gameover';

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
  /** Eliminaciones encadenadas de la secuencia actual. */
  chain: number;
  /** Granos iluminándose ahora mismo, o null. */
  flashing: Uint8Array | null;
  /** Color recién añadido, para avisar en pantalla. */
  newColor: number | null;

  startGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  exitToMenu: () => void;
  clearNewColor: () => void;
}

/** Acumulador de gravedad, fuera del estado para no provocar renderizados. */
let dropAccumulator = 0;

/** Temporizador del destello de las masas. */
let flashTimer: number | null = null;

/** Intervalo de caída de la pieza, en milisegundos. */
const DROP_INTERVAL = 700;

function cancelFlashTimer(): void {
  if (flashTimer !== null) {
    clearTimeout(flashTimer);
    flashTimer = null;
  }
}

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
 * Cuántos colores corresponden a una puntuación dada (requisitos A21, A22).
 *
 * Nunca baja de INITIAL_COLORS ni sube de los colores que existen.
 */
function colorsForScore(score: number): number {
  let count = INITIAL_COLORS;

  for (let i = INITIAL_COLORS + 1; i < COLOR_THRESHOLDS.length; i++) {
    if (score >= COLOR_THRESHOLDS[i]) count = i;
  }

  return Math.min(count, SAND_COLORS.length - 1);
}

/**
 * Comprueba si la pieza cabe en el tablero grueso.
 *
 * Se traduce cada celda de la pieza a su cuadrado de granos y se mira si alguno
 * está ocupado. Es lo que hace que la pieza se comporte como un bloque rígido
 * aunque debajo haya arena suelta.
 */
function fits(grid: SandGrid, piece: ActivePiece): boolean {
  const cols = CELL_COLS * GRAINS_PER_CELL;

  for (const cell of getCells(piece.type, piece.rotation)) {
    const cellRow = piece.row + cell.row;
    const cellCol = piece.col + cell.col;

    // Fuera por los lados o por abajo.
    if (cellCol < 0 || cellCol >= CELL_COLS || cellRow >= CELL_ROWS) return false;

    // Por encima del tablero se permite, como en el juego clásico.
    if (cellRow < 0) continue;

    const startRow = cellRow * GRAINS_PER_CELL;
    const startCol = cellCol * GRAINS_PER_CELL;

    for (let r = 0; r < GRAINS_PER_CELL; r++) {
      for (let c = 0; c < GRAINS_PER_CELL; c++) {
        if (grid[(startRow + r) * cols + startCol + c] !== 0) return false;
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

/**
 * Rota la pieza contra la rejilla de granos.
 *
 * Misma idea que la rotación del motor clásico, incluidos los desplazamientos
 * laterales, pero comprobando contra granos.
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

export const useSandStore = create<SandStore>((set, get) => ({
  grid: createGrid(),
  active: null,
  activeColor: 1,
  next: randomPiece(),
  nextColor: 1,
  phase: 'menu',
  score: 0,
  colorCount: INITIAL_COLORS,
  chain: 0,
  flashing: null,
  newColor: null,

  startGame: () => {
    dropAccumulator = 0;
    cancelFlashTimer();

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
      chain: 0,
      flashing: null,
      newColor: null,
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
      crumble();
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
    crumble();
  },

  togglePause: () => {
    const { phase } = get();
    if (phase === 'falling') set({ phase: 'paused' });
    else if (phase === 'paused') set({ phase: 'falling' });
  },

  exitToMenu: () => {
    cancelFlashTimer();
    set({ phase: 'menu' });
  },

  clearNewColor: () => set({ newColor: null }),
}));

/**
 * Desmorona la pieza activa en granos (requisito A9).
 *
 * Cada bloque de la pieza se convierte en GRAINS_PER_CELL granos por lado, del
 * color de la pieza. A partir de ese momento cada grano cae por su cuenta.
 */
function crumble(): void {
  const state = useSandStore.getState();
  if (!state.active) return;

  const grid = copyGrid(state.grid);

  for (const cell of getCells(state.active.type, state.active.rotation)) {
    const cellRow = state.active.row + cell.row;
    const cellCol = state.active.col + cell.col;

    if (cellRow < 0) continue;

    fillCell(grid, cellRow, cellCol, state.activeColor, GRAINS_PER_CELL);
  }

  play(sfx.lock);

  useSandStore.setState({
    grid,
    active: null,
    phase: 'settling',
    // La cadena empieza de cero con cada pieza nueva.
    chain: 0,
  });
}

/**
 * La arena terminó de asentarse: se buscan masas que unan ambas paredes.
 *
 * Si hay, se iluminan y se borran tras un instante, y la arena vuelve a caer,
 * lo que puede provocar otra eliminación (requisito A19). Si no hay, sale la
 * siguiente pieza.
 */
function checkMasses(grid: SandGrid): void {
  const state = useSandStore.getState();

  // Tope de seguridad por si una combinación se realimentara (plan, sección 5.3).
  if (state.chain >= MAX_CHAIN) {
    spawnNext(grid);
    return;
  }

  const found = findConnectedMasses(grid);

  if (!found) {
    spawnNext(grid);
    return;
  }

  const chain = state.chain + 1;

  // Cada eliminación encadenada vale más que la anterior (requisito A20).
  const points = found.count * POINTS_PER_GRAIN * chain;
  const newScore = state.score + points;

  play(() => sfx.clear(Math.min(chain, 4)));

  // Los granos se iluminan antes de desaparecer (requisito A18).
  useSandStore.setState({
    grid,
    flashing: found.mask,
    phase: 'flashing',
    chain,
    score: newScore,
  });

  cancelFlashTimer();
  flashTimer = window.setTimeout(() => {
    flashTimer = null;

    const current = useSandStore.getState();
    if (current.phase !== 'flashing') return;

    const cleared = copyGrid(current.grid);
    removeMass(cleared, found.mask);

    // ¿Toca añadir un color? (requisitos A22, A23)
    const nextColors = colorsForScore(newScore);
    const gained = nextColors > current.colorCount ? nextColors : null;

    useSandStore.setState({
      grid: cleared,
      flashing: null,
      // Vuelve a caer: lo que había encima de la masa ahora está en el aire.
      phase: 'settling',
      colorCount: nextColors,
      newColor: gained,
    });
  }, MASS_FLASH_MS);
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

/**
 * Un paso del bucle del modo. La llama useSandLoop en cada fotograma.
 *
 * En 'falling' aplica la gravedad de la pieza. En 'settling' hace caer la
 * arena un paso; cuando ya no se mueve nada, busca masas.
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

    // La arena se asentó.
    checkMasses(grid);
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
      crumble();
      return;
    }
  }
}