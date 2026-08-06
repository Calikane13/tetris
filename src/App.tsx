// ARCHIVO TEMPORAL — Tarea T09.
// Pinta las 28 formas para revisarlas a ojo. Se sustituye en la fase 3.

import { PIECE_COLORS } from './engine/constants';
import { ALL_PIECES, SHAPES } from './engine/tetrominoes';
import type { PieceType, Rotation } from './engine/types';

const ROTATIONS: Rotation[] = [0, 1, 2, 3];

function ShapeGrid({ type, rotation }: { type: PieceType; rotation: Rotation }) {
  const shape = SHAPES[type][rotation];
  const size = shape.length;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500">rot {rotation}</span>
      <div
        className="grid gap-px bg-slate-800 p-px"
        style={{ gridTemplateColumns: `repeat(${size}, 1.25rem)` }}
      >
        {shape.flatMap((line, row) =>
          line.split('').map((char, col) => (
            <div
              key={`${row}-${col}`}
              className={
                char === 'X'
                  ? `h-5 w-5 ${PIECE_COLORS[type]}`
                  : 'h-5 w-5 bg-slate-900'
              }
            />
          )),
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="min-h-dvh bg-slate-950 p-8 text-slate-200">
      <h1 className="mb-8 text-2xl font-bold">Revisión de piezas (T09)</h1>

      <div className="flex flex-col gap-8">
        {ALL_PIECES.map((type) => (
          <section key={type} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Pieza {type}</h2>
            <div className="flex flex-wrap gap-6">
              {ROTATIONS.map((rotation) => (
                <ShapeGrid key={rotation} type={type} rotation={rotation} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default App;