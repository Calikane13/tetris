// Panel de ajustes: sonido, fantasma y reasignación de teclas (regla R42).
//
// Para reasignar, se pulsa el botón de una acción y el panel entra en modo
// escucha: la siguiente tecla que se pulse queda asignada. Es más directo que
// una lista desplegable y evita tener que enumerar todas las teclas posibles.

import { useEffect, useState } from 'react';
import type { Action } from '../storage/settings';
import { ACTION_LABELS, ALL_ACTIONS, keyLabel } from '../storage/settings';
import { useSettingsStore } from '../store/useSettingsStore';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-slate-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 cursor-pointer accent-cyan-400"
      />
    </label>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const sound = useSettingsStore((state) => state.sound);
  const ghost = useSettingsStore((state) => state.ghost);
  const keys = useSettingsStore((state) => state.keys);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const toggleGhost = useSettingsStore((state) => state.toggleGhost);
  const setKey = useSettingsStore((state) => state.setKey);
  const resetKeys = useSettingsStore((state) => state.resetKeys);

  /** Acción que está esperando una tecla, o null si no hay ninguna. */
  const [listening, setListening] = useState<Action | null>(null);

  useEffect(() => {
    if (!listening) return;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      // Escape cancela en lugar de asignarse: si alguien lo asignara, perdería
      // la única forma cómoda de salir de este modo.
      if (event.code === 'Escape') {
        setListening(null);
        return;
      }

      setKey(listening, event.code);
      setListening(null);
    };

    // capture true para adelantarse al hook del juego, que si no ejecutaría la
    // acción de la tecla mientras se está reasignando.
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [listening, setKey]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 text-left">
      <div className="flex flex-col gap-3">
        <Toggle label="Sonido" checked={sound} onChange={toggleSound} />
        <Toggle label="Pieza fantasma" checked={ghost} onChange={toggleGhost} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs uppercase tracking-wide text-slate-500">Teclas</h3>

        {ALL_ACTIONS.map((action) => (
          <div key={action} className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-300">{ACTION_LABELS[action]}</span>
            <button
              type="button"
              onClick={() => setListening(action)}
              aria-label={`Cambiar tecla de ${ACTION_LABELS[action]}`}
              className={`min-w-24 rounded-md px-3 py-1 font-mono text-sm ${
                listening === action
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {listening === action ? 'pulsa…' : keyLabel(keys[action]) || 'sin asignar'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={resetKeys}
          className="text-sm text-slate-400 underline hover:text-slate-200"
        >
          Restaurar teclas
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-slate-100 px-5 py-2 font-semibold text-slate-900 hover:bg-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}