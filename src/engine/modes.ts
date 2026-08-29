// Los cinco modos de juego, como datos (v4, requisitos M1 y M3).
//
// Esto es una tabla, no lógica. Aquí no se importa React, ni el store, ni nada
// del navegador: solo se describe en qué se diferencia cada modo.
//
// La regla que sostiene esta tabla: entre modos solo pueden cambiar cuatro
// cosas.
//
//   1. En qué nivel empieza
//   2. Si la pieza cae sola
//   3. Cuándo termina la partida
//   4. Qué marca guarda
//
// El modo arena de la v5 es la excepción consciente: no cabe en esas cuatro
// variaciones porque cambia el tablero entero. Por eso tiene su propio store y
// su propio bucle, y aquí solo aparece para que el menú pueda ofrecerlo.

import type { ModeId } from '../storage/records';

export type { ModeId };

/** Cómo se comporta el cronómetro en un modo. */
export type TimerKind = 'none' | 'up' | 'down';

export interface GameMode {
  id: ModeId;
  /** Nombre visible en el menú. */
  name: string;
  /** Una línea explicando de qué va, para el menú. */
  description: string;
  /**
   * Nivel de inicio. 'choose' significa que lo elige el jugador antes de
   * empezar, y solo lo usa Nivel fijo.
   */
  startLevel: number | 'choose';
  /** Si la pieza baja sola con el paso del tiempo. */
  gravity: boolean;
  /** Cuenta hacia arriba, hacia atrás, o no hay cronómetro. */
  timer: TimerKind;
  /** Segundos totales. Solo tiene sentido si timer es 'down'. */
  timeLimit?: number;
  /** Líneas que terminan la partida. Solo en Sprint. */
  lineGoal?: number;
  /** Qué marca guarda al terminar. */
  record: 'score' | 'time' | 'none';
  /**
   * Si el modo usa su propio motor en lugar del clásico (v5).
   *
   * Solo el modo arena. Quien lo lea sabe que tiene que montar otro tablero y
   * otro bucle, en vez de los de siempre.
   */
  ownEngine?: boolean;
}

export const MODES: Record<ModeId, GameMode> = {
  classic: {
    id: 'classic',
    name: 'Clásico',
    description: 'Juega hasta que se llene el tablero.',
    startLevel: 1,
    gravity: true,
    timer: 'none',
    record: 'score',
  },

  sprint: {
    id: 'sprint',
    name: 'Sprint',
    description: '40 líneas lo más rápido posible.',
    startLevel: 1,
    gravity: true,
    timer: 'up',
    lineGoal: 40,
    record: 'time',
  },

  ultra: {
    id: 'ultra',
    name: 'Ultra',
    description: 'Máxima puntuación en 3 minutos.',
    startLevel: 1,
    gravity: true,
    timer: 'down',
    timeLimit: 180,
    record: 'score',
  },

  fixed: {
    id: 'fixed',
    name: 'Nivel fijo',
    description: 'Empieza directamente a la velocidad que elijas.',
    startLevel: 'choose',
    gravity: true,
    timer: 'none',
    record: 'score',
  },

  zero: {
    id: 'zero',
    name: 'Cero gravedad',
    description: 'Las piezas no caen solas. Para practicar sin prisa.',
    startLevel: 1,
    gravity: false,
    timer: 'none',
    // Sin límite de tiempo ni de gravedad, una marca alta solo significaría
    // haber jugado mucho rato (requisito M22).
    record: 'none',
  },

  sand: {
    id: 'sand',
    name: 'Arena',
    description: 'Las piezas se desmoronan. Une un color de pared a pared.',
    startLevel: 1,
    gravity: true,
    timer: 'none',
    record: 'score',
    ownEngine: true,
  },
};

/** Los modos en el orden en que se muestran en el menú. */
export const MODE_ORDER: readonly ModeId[] = [
  'classic',
  'sprint',
  'ultra',
  'fixed',
  'zero',
  'sand',
];

/** Niveles que se pueden elegir en Nivel fijo (requisito M15). */
export const FIXED_LEVELS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

/**
 * Formatea milisegundos como tiempo legible.
 *
 * Con centésimas en Sprint, donde la precisión importa para comparar marcas
 * (requisito M30); sin ellas en Ultra, donde solo interesa cuánto queda.
 */
export function formatTime(ms: number, withHundredths = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const base = `${minutes}:${String(seconds).padStart(2, '0')}`;

  if (!withHundredths) return base;

  const hundredths = Math.floor((ms % 1000) / 10);
  return `${base}.${String(hundredths).padStart(2, '0')}`;
}