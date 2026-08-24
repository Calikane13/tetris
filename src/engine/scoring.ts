// Puntuación, nivel y velocidad de caída.
// Funciones puras de aritmética; toda la tabla de valores vive en constants.ts.

import {
  BASE_DROP_INTERVAL,
  COMBO_BASE,
  LEVEL_SPEEDUP,
  LINES_PER_LEVEL,
  LINE_POINTS,
  MIN_DROP_INTERVAL,
} from './constants';

/**
 * Puntos por eliminar varias líneas de una vez, multiplicados por el nivel
 * actual (regla R31). Eliminar cuatro de golpe da mucho más que cuatro de una
 * en una: es lo que premia arriesgarse.
 */
export function scoreForLines(lines: number, level: number): number {
  return (LINE_POINTS[lines] ?? 0) * level;
}

/**
 * Puntos extra por encadenar eliminaciones (v3, requisitos C7 a C9).
 *
 * Se suman aparte de los puntos de línea, no los multiplican: un multiplicador
 * dispararía la puntuación de forma descontrolada en rachas largas, y un extra
 * identificable se entiende mejor que un número que sube sin explicación.
 *
 * El extra no depende de cuántas líneas se eliminaron: una suelta en racha 5 da
 * lo mismo que un cuádruple en racha 5. Lo que se premia es la continuidad.
 *
 * La comprobación de racha menor que 2 vive aquí dentro y no en quien llama:
 * así no hay forma de olvidarla desde otro sitio.
 */
export function comboBonus(combo: number, level: number): number {
  if (combo < 2) return 0;
  return COMBO_BASE * combo * level;
}

/**
 * Nivel a partir del total de líneas eliminadas en la partida (regla R35).
 * Cada 10 líneas se sube uno. La partida empieza en el nivel 1.
 */
export function levelForLines(totalLines: number): number {
  return Math.floor(totalLines / LINES_PER_LEVEL) + 1;
}

/**
 * Milisegundos entre caída y caída para un nivel dado (regla R10).
 * Nivel 1: 800 ms. Baja 70 ms por nivel hasta un suelo de 80 ms, que se alcanza
 * en el nivel 12 y ya no baja más.
 */
export function dropIntervalForLevel(level: number): number {
  return Math.max(
    MIN_DROP_INTERVAL,
    BASE_DROP_INTERVAL - (level - 1) * LEVEL_SPEEDUP,
  );
}