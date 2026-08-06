// Una celda del tablero. Es el componente que más veces se dibuja (200 por
// tablero), así que va envuelto en memo para que solo se repinte si cambia.

import { memo } from 'react';
import { GHOST_BORDERS, PIECE_COLORS } from '../engine/constants';
import type { PieceType } from '../engine/types';

interface CellProps {
  /** Pieza que ocupa la celda, o null si está vacía. */
  filled: PieceType | null;
  /** Pieza cuya sombra pasa por aquí, o null. Solo se pinta si filled es null. */
  ghost: PieceType | null;
}

function CellComponent({ filled, ghost }: CellProps) {
  if (filled) {
    return <div className={`h-full w-full rounded-sm ${PIECE_COLORS[filled]}`} />;
  }

  if (ghost) {
    return (
      <div
        className={`h-full w-full rounded-sm border-2 bg-transparent ${GHOST_BORDERS[ghost]}`}
      />
    );
  }

  return <div className="h-full w-full rounded-sm bg-slate-900" />;
}

export const Cell = memo(CellComponent);