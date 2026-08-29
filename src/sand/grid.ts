// El tablero de granos y las operaciones básicas sobre él (v5, requisitos A1 a
// A3).
//
// La rejilla es un Uint8Array plano, no un array de arrays. El motivo es el
// rendimiento: hay 3.200 granos y se recorren hasta 60 veces por segundo, así
// que la memoria contigua marca la diferencia. Un array de arrays obligaría al
// navegador a saltar entre 80 objetos distintos en cada pasada.
//
// A cambio, el índice hay que calcularlo a mano. Las funciones de este archivo
// esconden esa aritmética, de modo que el resto del código sigue hablando de
// filas y columnas y nunca ve un índice plano.
//
// Este archivo es lógica pura: no importa React, ni el store, ni el navegador.

import { EMPTY, SAND_COLS, SAND_ROWS, SAND_SIZE } from './constants';

/** La rejilla: 3.200 posiciones, cada una con 0 (vacío) o un número de color. */
export type SandGrid = Uint8Array;

/** Crea una rejilla vacía. */
export function createGrid(): SandGrid {
  return new Uint8Array(SAND_SIZE);
}

/** Copia una rejilla. Barato: es memoria contigua. */
export function copyGrid(grid: SandGrid): SandGrid {
  return new Uint8Array(grid);
}

/** Índice plano de una posición. Sin comprobaciones: es el camino caliente. */
export function index(row: number, col: number): number {
  return row * SAND_COLS + col;
}

/** Si una posición está dentro del tablero. */
export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < SAND_ROWS && col >= 0 && col < SAND_COLS;
}

/**
 * Lee un grano.
 * Fuera del tablero devuelve un valor distinto de vacío, para que la física
 * trate los bordes como pared sólida sin comprobar límites por separado.
 */
export function get(grid: SandGrid, row: number, col: number): number {
  if (!inBounds(row, col)) return 255;
  return grid[index(row, col)];
}

/** Escribe un grano. Ignora las posiciones fuera del tablero. */
export function set(grid: SandGrid, row: number, col: number, value: number): void {
  if (!inBounds(row, col)) return;
  grid[index(row, col)] = value;
}

/** Si una posición está libre para que caiga un grano. */
export function isEmpty(grid: SandGrid, row: number, col: number): boolean {
  return inBounds(row, col) && grid[index(row, col)] === EMPTY;
}

/**
 * La fila más alta que contiene algún grano, o SAND_ROWS si está todo vacío.
 *
 * Se usa para no recorrer las filas vacías de arriba en cada paso de física.
 * Al principio de la partida eso ahorra la mayor parte del trabajo.
 */
export function highestFilledRow(grid: SandGrid): number {
  for (let row = 0; row < SAND_ROWS; row++) {
    const start = row * SAND_COLS;
    for (let col = 0; col < SAND_COLS; col++) {
      if (grid[start + col] !== EMPTY) return row;
    }
  }
  return SAND_ROWS;
}

/**
 * Rellena el cuadrado de granos que corresponde a una celda del tablero
 * clásico.
 *
 * Es la conversión entre las dos rejillas que conviven en el modo: la pieza se
 * mueve en la de 10x20, y al fijarse cada uno de sus bloques se convierte aquí
 * en un cuadrado de GRAINS_PER_CELL por lado.
 */
export function fillCell(
  grid: SandGrid,
  cellRow: number,
  cellCol: number,
  color: number,
  grainsPerCell: number,
): void {
  const startRow = cellRow * grainsPerCell;
  const startCol = cellCol * grainsPerCell;

  for (let r = 0; r < grainsPerCell; r++) {
    for (let c = 0; c < grainsPerCell; c++) {
      set(grid, startRow + r, startCol + c, color);
    }
  }
}

/** Cuántos granos ocupados hay. Se usa para puntuar. */
export function countFilled(grid: SandGrid): number {
  let total = 0;
  for (let i = 0; i < SAND_SIZE; i++) {
    if (grid[i] !== EMPTY) total++;
  }
  return total;
}