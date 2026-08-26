// Cronómetro de Sprint y Ultra (v4, requisitos M29 a M32).
//
// No tiene contador propio: lee `elapsed` del store, que se acumula dentro del
// mismo bucle que la gravedad. Un temporizador aparte se desincronizaría al
// pausar o al volver de una pestaña en segundo plano, que es justo el riesgo
// apuntado en el plan.

import { formatTime, MODES } from '../engine/modes';
import { useGameStore } from '../store/useGameStore';

/** Segundos finales de Ultra que se destacan (requisito M32). */
const WARNING_SECONDS = 10;

export function Timer() {
  const elapsed = useGameStore((state) => state.elapsed);
  const mode = useGameStore((state) => state.mode);

  const config = MODES[mode];

  // En los modos sin cronómetro no se dibuja nada.
  if (config.timer === 'none') return null;

  if (config.timer === 'up') {
    // Sprint: cuenta hacia arriba, con centésimas porque la precisión importa
    // para comparar marcas.
    return (
      <div className="flex flex-col items-end">
        <span className="text-xs uppercase tracking-wide text-slate-500">Tiempo</span>
        <span className="font-mono text-2xl tabular-nums text-slate-100">
          {formatTime(elapsed, true)}
        </span>
      </div>
    );
  }

  // Ultra: cuenta hacia atrás desde el límite del modo.
  const limitMs = (config.timeLimit ?? 0) * 1000;
  const remaining = Math.max(0, limitMs - elapsed);
  const isWarning = remaining <= WARNING_SECONDS * 1000;

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs uppercase tracking-wide text-slate-500">Quedan</span>
      <span
        className={`font-mono text-2xl tabular-nums ${
          isWarning ? 'timer-warning text-red-400' : 'text-slate-100'
        }`}
      >
        {formatTime(remaining)}
      </span>
    </div>
  );
}