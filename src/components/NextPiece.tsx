// Recuadro de la siguiente pieza (regla R8).
// Se dibuja siempre en una rejilla de 4x4 para que el recuadro no cambie de
// tamaño según la pieza que toque.

import { PIECE_STYLES } from '../engine/constants';
import { getCells } from '../engine/tetrominoes';
import type { PieceType } from '../engine/types';

const PREVIEW_SIZE = 4;

export function NextPiece({ type }: { type: PieceType }) {
  const cells = getCells(type, 0);
  const occupied = new Set(cells.map((cell) => `${cell.row}-${cell.col}`));
  const style = PIECE_STYLES[type];

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-wide text-slate-500">Siguiente</h2>
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${PREVIEW_SIZE}, calc(var(--cell) * 0.7))`,
          gridTemplateRows: `repeat(${PREVIEW_SIZE}, calc(var(--cell) * 0.7))`,
        }}
      >
        {Array.from({ length: PREVIEW_SIZE * PREVIEW_SIZE }, (_, index) => {
          const row = Math.floor(index / PREVIEW_SIZE);
          const col = index % PREVIEW_SIZE;
          const isFilled = occupied.has(`${row}-${col}`);

          // Mismo relieve que en el tablero (requisito V14).
          return (
            <div
              key={index}
              className={
                isFilled
                  ? `border-2 border-solid ${style.fill} ${style.light} ${style.dark}`
                  : 'bg-slate-900'
              }
            />
          );
        })}
      </div>
    </div>
  );
}