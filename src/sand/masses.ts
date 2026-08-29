// Detección de masas de color que unen las dos paredes (v5, requisitos A15 a
// A17).
//
// El algoritmo es un recorrido en anchura desde la pared izquierda:
//
//   1. Por cada grano de la columna 0 que no se haya visitado, se explora su
//      masa.
//   2. La masa se expande a los vecinos del mismo color.
//   3. Si en algún momento se alcanza la última columna, esa masa une ambas
//      paredes y hay que eliminarla.
//
// Solo se empieza desde la pared izquierda a propósito: una masa que toque las
// dos paredes tiene que pasar por la columna 0 necesariamente, así que explorar
// desde el resto del tablero sería trabajo tirado.
//
// La forma de la masa no importa (requisito A17): puede serpentear, subir y
// bajar. Lo único que cuenta es que esté conectada y llegue de lado a lado.
//
// Este archivo es lógica pura: no importa React ni el navegador.

import { DIAGONAL_CONNECTION, EMPTY, SAND_COLS, SAND_ROWS } from './constants';
import { index, type SandGrid } from './grid';

/**
 * Direcciones de vecindad.
 *
 * Las cuatro primeras son los lados; las cuatro últimas, las esquinas. Que se
 * usen las ocho o solo las cuatro primeras depende de DIAGONAL_CONNECTION, y es
 * la decisión más delicada del modo: con diagonales, basta que dos granos se
 * toquen por una esquina para estar conectados, y las masas se forman con mucha
 * más facilidad.
 */
const NEIGHBORS: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

/**
 * Busca todas las masas que unen las dos paredes.
 *
 * Devuelve una máscara del mismo tamaño que la rejilla, con 1 en los granos que
 * hay que eliminar, y cuántos son. Si no hay ninguna masa, devuelve null.
 *
 * Se devuelve una máscara en lugar de una lista de coordenadas porque quien la
 * recibe la usa para dos cosas: iluminar esos granos y luego borrarlos, y en
 * ambos casos lo cómodo es preguntar "¿este grano está marcado?".
 */
export function findConnectedMasses(
  grid: SandGrid,
): { mask: Uint8Array; count: number } | null {
  const neighborCount = DIAGONAL_CONNECTION ? 8 : 4;

  const visited = new Uint8Array(grid.length);
  const mask = new Uint8Array(grid.length);
  let total = 0;

  // Cola reutilizada entre búsquedas: crear un array nuevo por cada masa
  // generaría basura innecesaria en cada asentamiento.
  const queue = new Int32Array(grid.length);

  for (let startRow = 0; startRow < SAND_ROWS; startRow++) {
    const startIndex = index(startRow, 0);
    const color = grid[startIndex];

    if (color === EMPTY || visited[startIndex] === 1) continue;

    // Explora la masa de este color desde aquí.
    let head = 0;
    let tail = 0;
    let touchesRight = false;

    queue[tail++] = startIndex;
    visited[startIndex] = 1;

    // Se guardan los índices de esta masa para poder marcarlos solo si al final
    // resulta que llega a la otra pared.
    const massIndices: number[] = [];

    while (head < tail) {
      const current = queue[head++];
      massIndices.push(current);

      const row = Math.floor(current / SAND_COLS);
      const col = current % SAND_COLS;

      if (col === SAND_COLS - 1) touchesRight = true;

      for (let n = 0; n < neighborCount; n++) {
        const [dr, dc] = NEIGHBORS[n];
        const nextRow = row + dr;
        const nextCol = col + dc;

        if (nextRow < 0 || nextRow >= SAND_ROWS) continue;
        if (nextCol < 0 || nextCol >= SAND_COLS) continue;

        const nextIndex = index(nextRow, nextCol);

        if (visited[nextIndex] === 1) continue;
        if (grid[nextIndex] !== color) continue;

        visited[nextIndex] = 1;
        queue[tail++] = nextIndex;
      }
    }

    if (touchesRight) {
      for (const i of massIndices) {
        mask[i] = 1;
      }
      total += massIndices.length;
    }
  }

  return total > 0 ? { mask, count: total } : null;
}

/** Borra de la rejilla los granos marcados en la máscara. */
export function removeMass(grid: SandGrid, mask: Uint8Array): void {
  for (let i = 0; i < grid.length; i++) {
    if (mask[i] === 1) grid[i] = EMPTY;
  }
}