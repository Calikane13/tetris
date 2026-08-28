// Los cinco estilos de bloque (v4, requisitos M38, M42, M46).
//
// Viven aparte de constants.ts porque son mucho texto y crecerán si algún día
// se añaden más estilos.
//
// IMPORTANTE, por tercera vez en este proyecto: todas las clases están escritas
// enteras. Tailwind analiza el código buscando nombres literales, así que algo
// como `bg-${color}-400` no generaría ninguna clase y las piezas saldrían sin
// color. Por eso este archivo es tan repetitivo: es la única forma de que el
// analizador las encuentre.
//
// Los colores de las siete piezas no cambian entre estilos (requisito M46). Lo
// que cambia es cómo se dibuja el bloque, no de qué color es cada pieza.

import type { PieceType } from './types';

export type StyleId = 'relief' | 'flat' | 'gel' | 'neon' | 'retro';

/** Clases de un bloque en un estilo concreto. */
export interface BlockLook {
  /** Clases del bloque en sí. */
  base: string;
  /** Clases del brillo interior, si el estilo lo lleva. Vacío si no. */
  shine?: string;
}

export interface StyleInfo {
  id: StyleId;
  name: string;
  description: string;
  /** Si hace falta conseguirlo jugando. */
  locked: boolean;
  /** Qué hay que hacer para desbloquearlo. Solo si locked es true. */
  requirement?: string;
}

export const STYLE_INFO: Record<StyleId, StyleInfo> = {
  relief: {
    id: 'relief',
    name: 'Relieve',
    description: 'Bloques con volumen, como piezas físicas.',
    locked: false,
  },
  flat: {
    id: 'flat',
    name: 'Plano',
    description: 'Color liso y esquinas redondeadas.',
    locked: false,
  },
  gel: {
    id: 'gel',
    name: 'Gel',
    description: 'Degradado y brillo, aspecto de caramelo.',
    locked: false,
  },
  neon: {
    id: 'neon',
    name: 'Neón',
    description: 'Contorno luminoso sobre fondo oscuro.',
    locked: true,
    requirement: 'Supera 10.000 puntos en Clásico',
  },
  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'Bordes gruesos, como una consola de 8 bits.',
    locked: true,
    requirement: 'Completa un Sprint',
  },
};

export const STYLE_ORDER: readonly StyleId[] = [
  'relief',
  'flat',
  'gel',
  'neon',
  'retro',
];

/** Los estilos disponibles sin desbloquear (requisito M39). */
export const FREE_STYLES: readonly StyleId[] = ['relief', 'flat', 'gel'];

/* ------------------------------------------------------------------ */
/* Relieve: el de la v2. Bordes claros arriba e izquierda, oscuros     */
/* abajo y derecha.                                                    */
/* ------------------------------------------------------------------ */

const RELIEF: Record<PieceType, BlockLook> = {
  I: { base: 'border-2 border-solid bg-cyan-400 border-t-cyan-200 border-l-cyan-200 border-b-cyan-700 border-r-cyan-700' },
  O: { base: 'border-2 border-solid bg-yellow-300 border-t-yellow-100 border-l-yellow-100 border-b-yellow-600 border-r-yellow-600' },
  T: { base: 'border-2 border-solid bg-purple-400 border-t-purple-200 border-l-purple-200 border-b-purple-700 border-r-purple-700' },
  S: { base: 'border-2 border-solid bg-green-400 border-t-green-200 border-l-green-200 border-b-green-700 border-r-green-700' },
  Z: { base: 'border-2 border-solid bg-red-400 border-t-red-200 border-l-red-200 border-b-red-700 border-r-red-700' },
  J: { base: 'border-2 border-solid bg-blue-400 border-t-blue-200 border-l-blue-200 border-b-blue-700 border-r-blue-700' },
  L: { base: 'border-2 border-solid bg-orange-400 border-t-orange-200 border-l-orange-200 border-b-orange-700 border-r-orange-700' },
};

/* ------------------------------------------------------------------ */
/* Plano: color sólido y esquinas redondeadas. El más limpio y el que  */
/* mejor se lee con el tablero muy lleno.                              */
/* ------------------------------------------------------------------ */

const FLAT: Record<PieceType, BlockLook> = {
  I: { base: 'rounded-sm bg-cyan-400' },
  O: { base: 'rounded-sm bg-yellow-300' },
  T: { base: 'rounded-sm bg-purple-400' },
  S: { base: 'rounded-sm bg-green-400' },
  Z: { base: 'rounded-sm bg-red-400' },
  J: { base: 'rounded-sm bg-blue-400' },
  L: { base: 'rounded-sm bg-orange-400' },
};

/* ------------------------------------------------------------------ */
/* Gel: degradado vertical más un brillo elíptico arriba a la          */
/* izquierda. El mismo aspecto que tienen los bloques del logo.        */
/* ------------------------------------------------------------------ */

const GEL: Record<PieceType, BlockLook> = {
  I: { base: 'rounded-md bg-gradient-to-b from-cyan-300 to-cyan-600', shine: 'bg-cyan-100' },
  O: { base: 'rounded-md bg-gradient-to-b from-yellow-200 to-yellow-500', shine: 'bg-yellow-50' },
  T: { base: 'rounded-md bg-gradient-to-b from-purple-300 to-purple-600', shine: 'bg-purple-100' },
  S: { base: 'rounded-md bg-gradient-to-b from-green-300 to-green-600', shine: 'bg-green-100' },
  Z: { base: 'rounded-md bg-gradient-to-b from-red-300 to-red-600', shine: 'bg-red-100' },
  J: { base: 'rounded-md bg-gradient-to-b from-blue-300 to-blue-600', shine: 'bg-blue-100' },
  L: { base: 'rounded-md bg-gradient-to-b from-orange-300 to-orange-600', shine: 'bg-orange-100' },
};

/* ------------------------------------------------------------------ */
/* Neón: fondo casi negro, borde de color y resplandor exterior.       */
/* El resplandor se hace con shadow, no con filtros, para no cargar la */
/* GPU con 200 celdas.                                                 */
/* ------------------------------------------------------------------ */

const NEON: Record<PieceType, BlockLook> = {
  I: { base: 'rounded-sm border-2 bg-slate-950 border-cyan-400 shadow-[0_0_6px] shadow-cyan-400' },
  O: { base: 'rounded-sm border-2 bg-slate-950 border-yellow-300 shadow-[0_0_6px] shadow-yellow-300' },
  T: { base: 'rounded-sm border-2 bg-slate-950 border-purple-400 shadow-[0_0_6px] shadow-purple-400' },
  S: { base: 'rounded-sm border-2 bg-slate-950 border-green-400 shadow-[0_0_6px] shadow-green-400' },
  Z: { base: 'rounded-sm border-2 bg-slate-950 border-red-400 shadow-[0_0_6px] shadow-red-400' },
  J: { base: 'rounded-sm border-2 bg-slate-950 border-blue-400 shadow-[0_0_6px] shadow-blue-400' },
  L: { base: 'rounded-sm border-2 bg-slate-950 border-orange-400 shadow-[0_0_6px] shadow-orange-400' },
};

/* ------------------------------------------------------------------ */
/* Retro: sin redondeo, borde grueso oscuro del mismo tono. El aspecto */
/* de las consolas de 8 bits, donde cada bloque era un cuadrado con su */
/* contorno marcado.                                                   */
/* ------------------------------------------------------------------ */

const RETRO: Record<PieceType, BlockLook> = {
  I: { base: 'border-4 bg-cyan-400 border-cyan-800' },
  O: { base: 'border-4 bg-yellow-300 border-yellow-700' },
  T: { base: 'border-4 bg-purple-400 border-purple-800' },
  S: { base: 'border-4 bg-green-400 border-green-800' },
  Z: { base: 'border-4 bg-red-400 border-red-800' },
  J: { base: 'border-4 bg-blue-400 border-blue-800' },
  L: { base: 'border-4 bg-orange-400 border-orange-800' },
};

export const BLOCK_STYLES: Record<StyleId, Record<PieceType, BlockLook>> = {
  relief: RELIEF,
  flat: FLAT,
  gel: GEL,
  neon: NEON,
  retro: RETRO,
};
