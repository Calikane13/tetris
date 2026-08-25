// Pantalla de fin de partida (requisitos V23 a V25).
//
// El botón no aparece hasta que el tablero termina de apagarse, para que nadie
// lo pulse por accidente a media transición. Ese retraso vive aquí y no en el
// store: es un detalle de presentación y la partida ya ha terminado.

import { useEffect, useState } from 'react';
import { MODES } from '../engine/modes';
import { recordForMode } from '../storage/records';
import { useGameStore } from '../store/useGameStore';
import { CrownIcon } from './CrownIcon';

/** Debe coincidir con la duración de board-fade en index.css. */
const FADE_MS = 750;

export function GameOverPanel({ onRestart }: { onRestart: () => void }) {
  const score = useGameStore((state) => state.score);
  const lines = useGameStore((state) => state.lines);
  const records = useGameStore((state) => state.records);
  const mode = useGameStore((state) => state.mode);
  const startLevel = useGameStore((state) => state.startLevel);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), FADE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const config = MODES[mode];
  const best = recordForMode(records, mode, startLevel);

  // Se compara con >= porque al perder ya se guardó la marca: si esta partida
  // la batió, ambos valores son iguales.
  const showRecord = config.record === 'score';
  const isNewRecord = showRecord && score >= best && score > 0;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div>
        <span className="block text-xs uppercase tracking-wide text-slate-400">
          Puntos
        </span>
        <span className="block font-mono text-5xl leading-none tabular-nums text-slate-100">
          {score}
        </span>
      </div>

      {showRecord && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <CrownIcon className="h-4 w-4" />
          <span className="font-mono text-xl tabular-nums">{best}</span>
        </div>
      )}

      {/* El récord se dice con palabras, no solo con el color de la corona
          (criterio C2 de la constitución, requisito V24). */}
      {isNewRecord && (
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