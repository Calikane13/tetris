// Tipos compartidos por todo el juego.
// Este archivo no contiene lógica: solo describe la forma de los datos.

/** Las siete piezas del juego, identificadas por su letra clásica. */
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/**
 * Una celda del tablero. Si está vacía vale null; si está ocupada guarda el
 * tipo de pieza que la llenó, lo que permite deducir su color al pintarla
 * sin necesidad de almacenarlo aparte.
 */
export type Cell = PieceType | null;

/** El tablero completo: 20 filas por 10 columnas, en la forma board[fila][columna]. */
export type Board = Cell[][];

/** Rotación de una pieza. 0 es la posición inicial y se avanza en sentido horario. */
export type Rotation = 0 | 1 | 2 | 3;

/** La pieza que el jugador controla en este momento. */
export interface ActivePiece {
  type: PieceType;
  rotation: Rotation;
  /** Fila de la esquina superior izquierda de la matriz de la pieza. Puede ser negativa mientras entra por arriba. */
  row: number;
  /** Columna de la esquina superior izquierda de la matriz de la pieza. */
  col: number;
}

/**
 * Estado general de la aplicación. Determina qué pantalla se muestra.
 *
 * 'clearing' es una fase breve de la v2 (requisito V1): la pieza ya está fijada
 * y las filas completas siguen visibles mientras se anima su desaparición. El
 * juego no acepta entrada durante esa fase.
 */
export type GameStatus = 'menu' | 'playing' | 'clearing' | 'paused' | 'gameover';

/** Estado completo de una partida. Es lo que se guarda para poder reanudar. */
export interface GameState {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
}