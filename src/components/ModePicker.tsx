// Selector de modo del menú (v4, requisitos M47 a M50).
//
// Los modos van como pastillas en una fila que envuelve, no como lista
// vertical: a 320 px de ancho una lista de cinco elementos con su descripción
// no cabe, y el requisito M50 prohíbe el desplazamiento dentro del menú.

import { useState } from 'react';
import { FIXED_LEVELS, formatTime, MODE_ORDER, MODES } from '../engine/modes';
import type { ModeId } from '../engine/modes';
import { recordForMode } from '../storage/records';
import { useGameStore } from '../store/useGameStore';
import { CrownIcon } from './CrownIcon';

export function ModePicker({
  onPlay,
}: {
  onPlay: (mode: ModeId, startLevel: number) => void;
}) {
  const records = useGameStore((state) => state.records);

  const [mode, setMode] = useState<ModeId>('classic');
  const [level, setLevel] = useState(1);

  const config = MODES[mode];
  const isFixed = config.startLevel === 'choose';
  const best = recordForMode(records, mode, level);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Los cinco modos */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {MODE_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === id
                ? 'bg-cyan-400 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {MODES[id].name}
          </button>
        ))}
      </div>

      <p className="max-w-xs text-xs text-slate-400">{config.description}</p>

      {/* Selector de nivel, solo en Nivel fijo (requisito M49). */}
      {isFixed && (
        <div className="flex flex-wrap justify-center gap-1">
          {FIXED_LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              aria-pressed={level === value}
              aria-label={`Nivel ${value}`}
              className={`h-7 w-7 rounded text-xs font-mono transition-colors ${
                level === value
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {/* La marca del modo elegido. Cero gravedad no tiene (requisito M27). */}
      {config.record !== 'none' && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <CrownIcon className="h-4 w-4" />
          <span className="font-mono text-lg tabular-nums">
            {config.record === 'time'
              ? best > 0
                ? formatTime(best, true)
                : '—'
              : best}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onPlay(mode, level)}
        className="rounded-lg bg-slate-100 px-6 py-2.5 font-semibold text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        Jugar
      </button>
    </div>
  );
}