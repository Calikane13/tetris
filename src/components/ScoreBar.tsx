// Puntuación y récord, encima del tablero (requisitos V15 a V17).
//
// La puntuación va en una región aria-live para que un lector de pantalla
// anuncie los cambios sin que el usuario tenga que ir a buscarla.
//
// Desde la v4 la marca depende del modo: cada uno tiene la suya, y Cero
// gravedad no tiene ninguna.

import { MODES } from '../engine/modes';
import { recordForMode } from '../storage/records';
import { useGameStore } from '../store/useGameStore';
import { CrownIcon } from './CrownIcon';

export function ScoreBar() {
  const score = useGameStore((state) => state.score);
  const records = useGameStore((state) => state.records);
  const mode = useGameStore((state) => state.mode);
  const startLevel = useGameStore((state) => state.startLevel);

  const config = MODES[mode];
  const stored = recordForMode(records, mode, startLevel);

  // En modos de puntuación, la marca sube en vivo si la partida la supera
  // (requisito V21). En Sprint la marca es un tiempo y no se compara con
  // puntos, y en Cero gravedad no hay marca.
  const showRecord = config.record === 'score';
  const best = showRecord ? Math.max(stored, score) : 0;

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

      {showRecord && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <CrownIcon className="h-4 w-4" />
          <span className="font-mono text-lg tabular-nums">{best}</span>
        </div>
      )}
    </div>
  );
}