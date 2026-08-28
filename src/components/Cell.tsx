// Una celda del tablero. Es el componente que más veces se dibuja (200 por
// tablero), así que va envuelto en memo para que solo se repinte si cambia.

import { memo } from 'react';
import { BLOCK_STYLES } from '../engine/blockStyles';
import type { StyleId } from '../engine/blockStyles';
import { GHOST_BORDERS, LINE_CLEAR_STEP_MS } from '../engine/constants';
import type { PieceType } from '../engine/types';

interface CellProps {
  /** Pieza que ocupa la celda, o null si está vacía. */
  filled: PieceType | null;
  /** Pieza cuya sombra pasa por aquí, o null. Solo se pinta si filled es null. */
  ghost: PieceType | null;
  /** Si esta celda pertenece a una fila que se está limpiando. */
  clearing: boolean;
  /** Si esa limpieza forma parte de una racha de combo. */
  combo: boolean;
  /** Columna de la celda. Escalona el barrido para que parezca desplazarse. */
  col: number;
  /** Estilo de bloque elegido en los ajustes. */
  style: StyleId;
}

function CellComponent({ filled, ghost, clearing, combo, col, style }: CellProps) {
  if (filled) {
    const look = BLOCK_STYLES[style][filled];

    return (
      <div className={`relative h-full w-full ${look.base}`}>
        {/* Brillo del estilo Gel: una elipse clara arriba a la izquierda, que
            es lo que da el aspecto de caramelo. Los demás estilos no lo usan. */}
        {look.shine && (
          <span
            className={`pointer-events-none absolute left-[15%] top-[12%] h-[22%] w-[38%] rounded-full opacity-60 ${look.shine}`}
          />
        )}

        {clearing && (
          // El retraso creciente por columna es lo que convierte encendidos
          // individuales en un barrido que recorre la fila (requisitos V5, V6).
          //
          // En racha, el barrido es amarillo en lugar de blanco (requisito C13).
          <span
            className={combo ? 'line-sweep-combo' : 'line-sweep'}
            style={{ animationDelay: `${col * LINE_CLEAR_STEP_MS}ms` }}
          />
        )}
      </div>
    );
  }

  if (ghost) {
    // El fantasma no cambia con el estilo: siempre contorno hueco, para que no
    // se confunda con un bloque real (requisito V13).
    return (
      <div
        className={`h-full w-full rounded-sm border-2 bg-transparent ${GHOST_BORDERS[ghost]}`}
      />
    );
  }

  return <div className="h-full w-full bg-slate-900" />;
}

export const Cell = memo(CellComponent);