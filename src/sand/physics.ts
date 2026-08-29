// Física de la arena (v5, requisitos A10 a A12).
//
// Reglas, por cada grano:
//
//   1. Si la posición de debajo está libre, baja.
//   2. Si no, pero las dos diagonales inferiores están libres, elige una al
//      azar y baja por ella.
//   3. Si solo una diagonal está libre, baja por esa.
//   4. Si no, se queda quieto.
//
// La regla 2 es lo que convierte esto en arena y no en bloques apilados: sin el
// deslizamiento diagonal, los granos formarían columnas rectas. Con él, los
// montones se aplanan solos en laderas.
//
// El azar de la regla 2 evita que todas las laderas se inclinen hacia el mismo
// lado, que es lo que pasaría si siempre se eligiera la izquierda.
//
// Este archivo es lógica pura: no importa React ni el navegador.

import { EMPTY, SAND_COLS } from './constants';
import { get, highestFilledRow, index, isEmpty, type SandGrid } from './grid';

/**
 * Ejecuta un paso de física: cada grano se mueve como mucho una posición.
 *
 * Devuelve true si algo se movió. El bucle del juego repite pasos mientras
 * devuelva true, y cuando devuelve false la arena está asentada.
 *
 * IMPORTANTE: se recorre de abajo arriba. Si se hiciera al revés, un grano que
 * acaba de bajar se encontraría otra vez en la fila siguiente del mismo
 * recorrido y volvería a caer, atravesando el tablero de una sola pasada. Este
 * detalle es la diferencia entre arena que cae y arena que teletransporta.
 */
export function stepPhysics(grid: SandGrid): boolean {
  let moved = false;

  // No hace falta mirar las filas vacías de arriba: al principio de la partida
  // eso ahorra casi todo el trabajo.
  const top = highestFilledRow(grid);

  // Se empieza en la penúltima fila: la última no tiene dónde caer.
  for (let row = grid.length / SAND_COLS - 2; row >= top; row--) {
    // La dirección del recorrido horizontal alterna por fila para que la arena
    // no se sesgue sistemáticamente hacia un lado.
    const leftToRight = row % 2 === 0;

    for (let i = 0; i < SAND_COLS; i++) {
      const col = leftToRight ? i : SAND_COLS - 1 - i;
      const value = grid[index(row, col)];

      if (value === EMPTY) continue;

      // Regla 1: directo hacia abajo.
      if (isEmpty(grid, row + 1, col)) {
        grid[index(row, col)] = EMPTY;
        grid[index(row + 1, col)] = value;
        moved = true;
        continue;
      }

      // Reglas 2 y 3: deslizamiento diagonal.
      const canLeft = isEmpty(grid, row + 1, col - 1);
      const canRight = isEmpty(grid, row + 1, col + 1);

      if (!canLeft && !canRight) continue;

      let targetCol: number;

      if (canLeft && canRight) {
        targetCol = Math.random() < 0.5 ? col - 1 : col + 1;
      } else {
        targetCol = canLeft ? col - 1 : col + 1;
      }

      grid[index(row, col)] = EMPTY;
      grid[index(row + 1, targetCol)] = value;
      moved = true;
    }
  }

  return moved;
}

/**
 * Ejecuta pasos de física hasta que la arena deje de moverse.
 *
 * No la usa el juego, que ejecuta un paso por fotograma para que la caída se
 * vea (requisito A14). Sirve para pruebas y para casos donde no importe la
 * animación.
 *
 * El tope evita un bucle infinito si alguna vez hubiera una configuración que
 * se realimentara.
 */
export function settleAll(grid: SandGrid, maxSteps = 500): number {
  let steps = 0;

  while (steps < maxSteps && stepPhysics(grid)) {
    steps++;
  }

  return steps;
}

/** Si algún grano ha superado la fila de peligro (requisito A27). */
export function isAboveDanger(grid: SandGrid, dangerRow: number): boolean {
  for (let row = 0; row <= dangerRow; row++) {
    for (let col = 0; col < SAND_COLS; col++) {
      if (get(grid, row, col) !== EMPTY) return true;
    }
  }
  return false;
}