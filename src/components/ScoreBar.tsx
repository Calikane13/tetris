// Puntuación y récord, encima del tablero (requisitos V15 a V17).
//
// La puntuación va en una región aria-live para que un lector de pantalla
// anuncie los cambios sin que el usuario tenga que ir a buscarla.

import { useGameStore } from '../store/useGameStore';
import { CrownIcon } from './CrownIcon';

export function ScoreBar() {
  const score = useGameStore((state) => state.score);
  const best = useGameStore((state) => state.best);

  return (
    <div className="flex w-full items-end justify-between gap-4 px-1">
      <div aria-live="polite" aria-atomic="true">
        <span className="block text-xs uppercase tracking-wide text-slate-500">
          Puntos
        </span>
        <span className="block font-mono text-4xl leading-none tabular-nums text-slate-100">
          {score}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-amber-400">
        <CrownIcon className="h-4 w-4" />
        <span className="font-mono text-lg tabular-nums">{best}</span>
      </div>
    </div>
  );
}
