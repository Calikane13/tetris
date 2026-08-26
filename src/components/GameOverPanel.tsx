// Pantalla de fin de partida (requisitos V23 a V25).
//
// Desde la v4 el resultado depende del modo: en Sprint lo que importa es el
// tiempo, en los demás la puntuación. Y el mensaje cambia según cómo terminara:
// completar las 40 líneas de un Sprint no es lo mismo que quedarse bloqueado.

import { useEffect, useState } from 'react';
import { formatTime, MODES } from '../engine/modes';
import { recordForMode } from '../storage/records';
import { useGameStore } from '../store/useGameStore';
import { CrownIcon } from './CrownIcon';

/** Debe coincidir con la duración de board-fade en index.css. */
const FADE_MS = 750;

export function GameOverPanel({ onRestart }: { onRestart: () => void }) {
  const score = useGameStore((state) => state.score);
  const lines = useGameStore((state) => state.lines);
  const elapsed = useGameStore((state) => state.elapsed);
  const records = useGameStore((state) => state.records);
  const mode = useGameStore((state) => state.mode);
  const startLevel = useGameStore((state) => state.startLevel);
  const overReason = useGameStore((state) => state.overReason);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), FADE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const config = MODES[mode];
  const best = recordForMode(records, mode, startLevel);

  const isSprint = config.record === 'time';
  const completed = overReason === 'goal';

  // En Sprint, el resultado es el tiempo, y solo cuenta si se completó el
  // objetivo. En los demás modos, la puntuación.
  const showTime = isSprint && completed;
  const showScore = config.record === 'score';

  // Se compara con >= porque al terminar ya se guardó la marca: si esta partida
  // la batió, ambos valores son iguales.
  const isNewScoreRecord = showScore && score >= best && score > 0;
  const isNewTimeRecord = showTime && elapsed <= best && best > 0;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {isSprint && !completed && (
        <p className="text-sm text-slate-400">Sprint sin terminar</p>
      )}

      {showTime ? (
        <div>
          <span className="block text-xs uppercase tracking-wide text-slate-400">
            Tiempo
          </span>
          <span className="block font-mono text-5xl leading-none tabular-nums text-slate-100">
            {formatTime(elapsed, true)}
          </span>
        </div>
      ) : (
        <div>
          <span className="block text-xs uppercase tracking-wide text-slate-400">
            Puntos
          </span>
          <span className="block font-mono text-5xl leading-none tabular-nums text-slate-100">
            {score}
          </span>
        </div>
      )}

      {showScore && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <CrownIcon className="h-4 w-4" />
          <span className="font-mono text-xl tabular-nums">{best}</span>
        </div>
      )}

      {showTime && best > 0 && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <CrownIcon className="h-4 w-4" />
          <span className="font-mono text-xl tabular-nums">
            {formatTime(best, true)}
          </span>
        </div>
      )}

      {/* El récord se dice con palabras, no solo con el color de la corona
          (criterio C2 de la constitución, requisito V24). */}
      {(isNewScoreRecord || isNewTimeRecord) && (
        <p className="text-sm font-semibold text-amber-400">¡Récord nuevo!</p>
      )}

      <p className="text-sm text-slate-400">{lines} líneas</p>

      {ready && (
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Jugar otra vez
        </button>
      )}
    </div>
  );
}