// El tablero: combina las piezas fijadas, el fantasma y la pieza activa en una
// sola rejilla, y la dibuja.
//
// El orden importa: la pieza activa se pinta encima del fantasma, y el fantasma
// solo aparece donde no hay nada fijado (reglas R22 y R23).

import { BOARD_HEIGHT, BOARD_WIDTH } from '../engine/constants';
import { getGhostPosition } from '../engine/piece';
import { getCells } from '../engine/tetrominoes';
import type { Board as BoardType, PieceType } from '../engine/types';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Cell } from './Cell';

export function Board() {
  const board = useGameStore((state) => state.board);
  const active = useGameStore((state) => state.active);
  const showGhost = useSettingsStore((state) => state.ghost);

  // Copia del tablero donde se pintará también la pieza activa.
  const filled: BoardType = board.map((row) => [...row]);

  // Capa aparte para el fantasma, para no confundirlo con lo ya fijado.
  const ghost: (PieceType | null)[][] = board.map((row) => row.map(() => null));

  if (active) {
    if (showGhost) {
      const ghostPiece = getGhostPosition(board, active);

      for (const cell of getCells(ghostPiece.type, ghostPiece.rotation)) {
        const row = ghostPiece.row + cell.row;
        const col = ghostPiece.col + cell.col;
        if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
          ghost[row][col] = ghostPiece.type;
        }
      }
    }

    for (const cell of getCells(active.type, active.rotation)) {
      const row = active.row + cell.row;
      const col = active.col + cell.col;
      if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
        filled[row][col] = active.type;
      }
    }
  }

  return (
    <div
      className="grid gap-px border-2 border-slate-700 bg-slate-800 p-px"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, var(--cell))`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, var(--cell))`,
      }}
    >
      {filled.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            filled={cellValue}
            ghost={ghost[rowIndex][colIndex]}
          />
        )),
      )}
    </div>
  );
}