// Puntuación, líneas, nivel y siguiente pieza (regla R30).
//
// La puntuación va en una región aria-live para que un lector de pantalla
// anuncie los cambios sin que el usuario tenga que ir a buscarla.

import { useGameStore } from '../store/useGameStore';
import { NextPiece } from './NextPiece';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-mono text-2xl tabular-nums text-slate-100">{value}</span>
    </div>
  );
}

export function Hud() {
  const score = useGameStore((state) => state.score);
  const lines = useGameStore((state) => state.lines);
  const level = useGameStore((state) => state.level);
  const next = useGameStore((state) => state.next);

  return (
    <aside className="flex flex-row gap-6 md:flex-col md:gap-8">
      <div aria-live="polite" aria-atomic="true">
        <Stat label="Puntos" value={score} />
      </div>
      <Stat label="Líneas" value={lines} />
      <Stat label="Nivel" value={level} />
      <NextPiece type={next} />
    </aside>
  );
}