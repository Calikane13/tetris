// Una celda del tablero. Es el componente que más veces se dibuja (200 por
// tablero), así que va envuelto en memo para que solo se repinte si cambia.

import { memo } from 'react';
import { GHOST_BORDERS, PIECE_STYLES } from '../engine/constants';
import type { PieceType } from '../engine/types';

interface CellProps {
  /** Pieza que ocupa la celda, o null si está vacía. */
  filled: PieceType | null;
  /** Pieza cuya sombra pasa por aquí, o null. Solo se pinta si filled es null. */
  ghost: PieceType | null;
}

function CellComponent({ filled, ghost }: CellProps) {
  if (filled) {
    const style = PIECE_STYLES[filled];

    // Bordes de distinto color en cada lado: claros arriba y a la izquierda,
    // oscuros abajo y a la derecha. Es lo que da la sensación de volumen.
    //
    // Sin border-radius a propósito (requisito V10): con esquinas redondeadas,
    // los cuatro bordes de distinto color se cortan en diagonales que se ven
    // sucias. Cuadrado queda limpio y además encaja con el aspecto retro.
    return (
      <div
        className={`h-full w-full border-2 border-solid ${style.fill} ${style.light} ${style.dark}`}
      />
    );
  }

  if (ghost) {
    // El fantasma no lleva relieve, para que no se confunda con un bloque real
    // (requisito V13).
    return (
      <div
        className={`h-full w-full rounded-sm border-2 bg-transparent ${GHOST_BORDERS[ghost]}`}
      />
    );
  }

  return <div className="h-full w-full bg-slate-900" />;
}

export const Cell = memo(CellComponent);