// Estado de la partida y acciones que lo modifican.
//
// Este archivo no contiene reglas del juego: cada acción llama al motor y
// guarda lo que devuelve. Si aquí apareciera un bucle recorriendo el tablero,
// esa lógica estaría en el sitio equivocado.

import { create } from 'zustand';
import { clearLines, createEmptyBoard, isValidPosition, lockPiece } from '../engine/board';
import {
  COMBO_GRACE,
  HARD_DROP_POINTS,
  LINE_CLEAR_MS,
  SOFT_DROP_POINTS,
} from '../engine/constants';
import { MODES } from '../engine/modes';
import {
  getDropDistance,
  move,
  randomPiece,
  rotate,
  spawnPiece,
} from '../engine/piece';
import {
  comboBonus,
  dropIntervalForLevel,
  levelForLines,
  scoreForLines,
} from '../engine/scoring';
import type { ActivePiece, Board, GameStatus, PieceType } from '../engine/types';
import { sfx } from '../audio/sfx';
import type { ModeId, Records } from '../storage/records';
import {
  loadRecords,
  recordForMode,
  saveFixedRecord,
  saveScoreRecord,
  saveSprintRecord,
} from '../storage/records';
import { clearSavedGame, loadSavedGame, saveGame } from '../storage/savedGame';
import { NEON_SCORE } from '../storage/unlocks';
import { useSettingsStore } from './useSettingsStore';

/**
 * Cómo terminó la partida.
 *
 * 'blocked'  el tablero se llenó
 * 'goal'     Sprint llegó a las 40 líneas
 * 'timeout'  Ultra agotó el tiempo
 */
export type GameOverReason = 'blocked' | 'goal' | 'timeout';

interface GameStore {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
  /** Si hay una partida guardada que se puede reanudar desde el menú. */
  hasSavedGame: boolean;
  /** Filas que se están limpiando ahora mismo. Vacío fuera de la fase. */
  clearingRows: number[];
  /** Racha actual de eliminaciones consecutivas. 0 significa sin racha. */
  combo: number;
  /** Piezas seguidas fijadas sin eliminar líneas. Implementa el margen de C3. */
  dryPieces: number;
  /** Extra ganado en la última eliminación. Lo lee el cartel de combo. */
  lastComboBonus: number;

  /** Modo de la partida en curso (v4). */
  mode: ModeId;
  /** Nivel en el que arrancó. Solo difiere de 1 en Nivel fijo. */
  startLevel: number;
  /** Milisegundos jugados. Lo usan los cronómetros de Sprint y Ultra. */
  elapsed: number;
  /** Marcas de todos los modos. */
  records: Records;
  /** Por qué terminó la última partida. Lo lee la pantalla de resultado. */
  overReason: GameOverReason | null;

  startGame: (mode?: ModeId, startLevel?: number) => void;
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
 * Temporizador de la fase de limpieza.
 *
 * Se guarda fuera del estado para poder cancelarlo si se empieza una partida
 * nueva a media fase. Sin esto, el temporizador de la partida anterior seguiría
 * vivo y borraría filas del tablero recién creado (requisito V4).
 */
let clearTimer: number | null = null;

function cancelClearTimer(): void {
  if (clearTimer !== null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
}

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
  lines: 0,
  level: 1,
  status: 'menu',
  hasSavedGame: loadSavedGame() !== null,
  clearingRows: [],
  combo: 0,
  dryPieces: 0,
  lastComboBonus: 0,

  mode: 'classic',
  startLevel: 1,
  elapsed: 0,
  records: loadRecords(),
  overReason: null,

  startGame: (mode = 'classic', startLevel = 1) => {
    const first = randomPiece();
    dropAccumulator = 0;
    cancelClearTimer();
    clearSavedGame();

    // En Nivel fijo el jugador elige; en los demás lo dice la tabla de modos.
    const config = MODES[mode];
    const level = config.startLevel === 'choose' ? startLevel : config.startLevel;

    set({
      board: createEmptyBoard(),
      active: spawnPiece(first),
      next: randomPiece(first),
      score: 0,
      lines: 0,
      level,
      status: 'playing',
      hasSavedGame: false,
      clearingRows: [],
      combo: 0,
      dryPieces: 0,
      lastComboBonus: 0,
      mode,
      startLevel: level,
      elapsed: 0,
      overReason: null,
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
    cancelClearTimer();

    set({
      board: saved.board,
      active: saved.active,
      next: saved.next,
      score: saved.score,
      lines: saved.lines,
      level: saved.level,
      status: 'playing',
      clearingRows: [],
      // La racha no se guarda: al reanudar se retoma desde cero (requisito C6).
      combo: 0,
      dryPieces: 0,
      lastComboBonus: 0,
      mode: saved.mode,
      startLevel: saved.startLevel,
      elapsed: saved.elapsed,
      overReason: null,
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

    // Pausar a media limpieza dejaría la animación congelada y el temporizador
    // corriendo por debajo. Se ignora la pulsación: son 300 ms.
    if (status === 'playing') {
      get().persist();
      set({ status: 'paused' });
    } else if (status === 'paused') {
      set({ status: 'playing' });
    }
  },

  exitToMenu: () => {
    cancelClearTimer();
    get().persist();
    set({ status: 'menu', hasSavedGame: loadSavedGame() !== null, clearingRows: [] });
  },

  /**
   * Vuelca la partida actual a localStorage. La llaman la pausa, la salida al
   * menú y el evento de ocultar la pestaña.
   */
  persist: () => {
    const { board, active, next, score, lines, level, status, mode, startLevel, elapsed } =
      get();

    // Solo tiene sentido guardar una partida viva.
    if (status !== 'playing' || !active) return;

    saveGame({ board, active, next, score, lines, level, mode, startLevel, elapsed });
  },
}));

/**
 * Fija la pieza y decide qué pasa después.
 *
 * Si no hay filas completas, la partida continúa al instante como en la v1.
 * Si las hay, se entra en la fase de limpieza: las filas se quedan visibles,
 * el juego se detiene, y finishClearing() remata el trabajo cuando termina la
 * animación (requisitos V1, V2, V7).
 */
function lockAndAdvance(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): void {
  const state = get();
  if (!state.active) return;

  const locked = lockPiece(state.board, state.active);

  // Se buscan las filas completas sin borrarlas todavía: hay que poder pintarlas
  // durante la animación.
  const fullRows: number[] = [];
  locked.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) fullRows.push(index);
  });

  if (fullRows.length === 0) {
    play(sfx.lock);
    advance(set, get, locked, 0);
    return;
  }

  play(() => sfx.clear(fullRows.length));

  // La pieza ya está fijada y visible, pero las filas todavía no se borran.
  set({
    board: locked,
    active: null,
    status: 'clearing',
    clearingRows: fullRows,
  });

  cancelClearTimer();
  clearTimer = window.setTimeout(() => {
    clearTimer = null;
    finishClearing(set, get);
  }, LINE_CLEAR_MS);
}

/** Borra las filas marcadas y continúa la partida. */
function finishClearing(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): void {
  const state = get();

  // Si la partida cambió mientras corría el temporizador, no se toca nada.
  if (state.status !== 'clearing') return;

  const { board: cleared, cleared: clearedCount } = clearLines(state.board);
  advance(set, get, cleared, clearedCount);
}

/**
 * Guarda la marca que corresponda al modo y devuelve las marcas actualizadas.
 *
 * Cada modo puntúa distinto, así que el fin de partida no tiene que saber de
 * esas diferencias: pregunta aquí y ya está.
 *
 * Sprint solo guarda marca si se completó el objetivo: quedarse a medias no es
 * un tiempo comparable (requisito M9).
 */
function saveRecordForMode(
  state: GameStore,
  finalScore: number,
  reason: GameOverReason,
): Records {
  switch (state.mode) {
    case 'classic':
      return saveScoreRecord(state.records, 'classic', finalScore);

    case 'ultra':
      // En Ultra la puntuación cuenta aunque el tablero se llene antes de
      // agotarse el tiempo (requisito M14).
      return saveScoreRecord(state.records, 'ultra', finalScore);

    case 'fixed':
      return saveFixedRecord(state.records, state.startLevel, finalScore);

    case 'sprint':
      if (reason !== 'goal') return state.records;
      return saveSprintRecord(state.records, state.elapsed);

    default:
      // Cero gravedad no guarda nada (requisito M22).
      return state.records;
  }
}

/**
 * Comprueba si la partida que acaba de terminar desbloquea algún estilo
 * (requisitos M40 y M41).
 *
 * Vive junto al fin de partida porque las dos condiciones se evalúan ahí: una
 * mira la puntuación final y la otra si el Sprint llegó a su objetivo.
 *
 * El store de ajustes se encarga de no avisar dos veces si ya estaba
 * desbloqueado, así que aquí no hace falta comprobarlo.
 */
function checkUnlocks(
  mode: ModeId,
  finalScore: number,
  reason: GameOverReason,
): void {
  const { unlock } = useSettingsStore.getState();

  if (mode === 'classic' && finalScore >= NEON_SCORE) {
    unlock('neon');
  }

  if (mode === 'sprint' && reason === 'goal') {
    unlock('retro');
  }
}

/** Termina la partida, guarda la marca y deja el estado listo para mostrarla. */
function endGame(
  set: (partial: Partial<GameStore>) => void,
  state: GameStore,
  board: Board,
  finalScore: number,
  finalLines: number,
  finalLevel: number,
  reason: GameOverReason,
): void {
  clearSavedGame();
  cancelClearTimer();
  play(sfx.gameOver);

  checkUnlocks(state.mode, finalScore, reason);

  set({
    board,
    active: null,
    score: finalScore,
    lines: finalLines,
    level: finalLevel,
    records: saveRecordForMode(state, finalScore, reason),
    status: 'gameover',
    hasSavedGame: false,
    clearingRows: [],
    combo: 0,
    dryPieces: 0,
    lastComboBonus: 0,
    overReason: reason,
  });
}

/**
 * Puntúa, actualiza la racha, saca la siguiente pieza, guarda y comprueba el
 * fin de partida.
 *
 * Vive aparte porque la llaman los dos caminos: el de "no hubo líneas", que va
 * directo, y el de "hubo líneas", que llega tras la animación. Separarla es la
 * forma de que los dos hagan exactamente lo mismo.
 */
function advance(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
  board: Board,
  clearedCount: number,
): void {
  const state = get();

  // Racha (v3, requisitos C1 a C4).
  let combo = state.combo;
  let dryPieces = state.dryPieces;
  let bonus = 0;

  if (clearedCount > 0) {
    combo += 1;
    dryPieces = 0;
    bonus = comboBonus(combo, state.level);
  } else {
    dryPieces += 1;
    if (dryPieces >= COMBO_GRACE) {
      combo = 0;
      dryPieces = 0;
    }
  }

  const totalLines = state.lines + clearedCount;

  // El nivel calculado por líneas nunca puede bajar del nivel de inicio: en
  // Nivel fijo se empieza en el 10 con cero líneas, y levelForLines devolvería
  // 1, tirando la velocidad elegida al fijar la primera pieza.
  const newLevel = Math.max(state.startLevel, levelForLines(totalLines));
  const newScore =
    state.score + scoreForLines(clearedCount, state.level) + bonus;

  const config = MODES[state.mode];

  // Objetivo de líneas cumplido: Sprint terminado (requisito M8).
  // Se comprueba antes que el bloqueo porque completar el objetivo con la
  // última pieza posible cuenta como victoria, no como derrota.
  if (config.lineGoal !== undefined && totalLines >= config.lineGoal) {
    endGame(set, state, board, newScore, totalLines, newLevel, 'goal');
    return;
  }

  const upcoming = spawnPiece(state.next);
  dropAccumulator = 0;

  if (newLevel > state.level) {
    play(sfx.levelUp);
  }

  // Si la pieza nueva no cabe nada más aparecer, la partida termina (regla R38).
  if (!isValidPosition(board, upcoming)) {
    endGame(set, state, board, newScore, totalLines, newLevel, 'blocked');
    return;
  }

  const nextPiece = randomPiece(state.next);

  set({
    board,
    active: upcoming,
    next: nextPiece,
    score: newScore,
    lines: totalLines,
    level: newLevel,
    status: 'playing',
    clearingRows: [],
    combo,
    dryPieces,
    lastComboBonus: bonus,
  });

  // Se guarda al fijar cada pieza: es el punto natural de la partida, y así
  // como mucho se pierde una pieza si el navegador se cierra de golpe.
  saveGame({
    board,
    active: upcoming,
    next: nextPiece,
    score: newScore,
    lines: totalLines,
    level: newLevel,
    mode: state.mode,
    startLevel: state.startLevel,
    elapsed: state.elapsed,
  });
}

/**
 * Acumula el tiempo transcurrido y aplica la gravedad cuando toca.
 * La llama el bucle de juego en cada fotograma.
 *
 * También lleva la cuenta del tiempo jugado, porque es el único sitio que se
 * ejecuta en cada fotograma y que ya se detiene al pausar. Un temporizador
 * aparte se desincronizaría al pausar o al volver de segundo plano.
 */
export function addTime(delta: number): void {
  const state = useGameStore.getState();
  if (state.status !== 'playing') return;

  const elapsed = state.elapsed + delta;
  useGameStore.setState({ elapsed });

  const config = MODES[state.mode];

  // Tiempo agotado: Ultra terminado (requisito M13). Se comprueba aquí porque
  // es el único sitio que se ejecuta con el paso del tiempo, no al fijar
  // piezas.
  if (config.timeLimit !== undefined && elapsed >= config.timeLimit * 1000) {
    endGame(
      useGameStore.setState,
      state,
      state.board,
      state.score,
      state.lines,
      state.level,
      'timeout',
    );
    return;
  }

  // En Cero gravedad la pieza no baja sola: se acaba aquí (requisito M19).
  if (!config.gravity) return;

  dropAccumulator += delta;

  const interval = dropIntervalForLevel(state.level);

  while (dropAccumulator >= interval) {
    dropAccumulator -= interval;
    state.tick();
  }
}

/** La marca del modo indicado, para mostrarla en el menú. */
export function getRecordForMode(mode: ModeId, startLevel = 1): number {
  return recordForMode(useGameStore.getState().records, mode, startLevel);
}