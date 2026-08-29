// Pantalla del modo arena (v5).
//
// De momento se monta sola, para poder probarla. En S09 se integra con el menú
// y los modos del juego principal.

import { useEffect } from 'react';
import { SAND_COLOR_NAMES, SAND_COLORS } from './constants';
import { SandCanvas } from './SandCanvas';
import { useSandLoop } from './useSandLoop';
import { useSandStore } from './useSandStore';

export function SandGame() {
  const grid = useSandStore((state) => state.grid);
  const active = useSandStore((state) => state.active);
  const activeColor = useSandStore((state) => state.activeColor);
  const flashing = useSandStore((state) => state.flashing);
  const phase = useSandStore((state) => state.phase);
  const score = useSandStore((state) => state.score);
  const chain = useSandStore((state) => state.chain);
  const colorCount = useSandStore((state) => state.colorCount);
  const newColor = useSandStore((state) => state.newColor);
  const startGame = useSandStore((state) => state.startGame);
  const clearNewColor = useSandStore((state) => state.clearNewColor);

  useSandLoop();

  // El aviso de color nuevo desaparece solo.
  useEffect(() => {
    if (newColor === null) return;
    const timer = window.setTimeout(clearNewColor, 2200);
    return () => window.clearTimeout(timer);
  }, [newColor, clearNewColor]);

  // Controles de teclado. Provisional: en S09 pasa a usar el hook compartido,
  // con las teclas de los ajustes.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = useSandStore.getState();

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          store.moveLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          store.moveRight();
          break;
        case 'ArrowDown':
          event.preventDefault();
          store.softDrop();
          break;
        case 'ArrowUp':
          event.preventDefault();
          store.rotateCW();
          break;
        case 'KeyZ':
          store.rotateCCW();
          break;
        case 'Space':
          event.preventDefault();
          store.hardDrop();
          break;
        case 'KeyP':
          store.togglePause();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-end justify-between gap-4">
        <div>
          <span className="block text-xs uppercase tracking-wide text-slate-500">
            Puntos
          </span>
          <span className="block font-mono text-3xl tabular-nums text-slate-100">
            {score}
          </span>
        </div>

        {/* Los colores en juego, como referencia visual de la dificultad. */}
        <div className="flex gap-1">
          {Array.from({ length: colorCount }, (_, i) => (
            <span
              key={i}
              className="block h-3 w-3 rounded-sm"
              style={{ backgroundColor: SAND_COLORS[i + 1] }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <SandCanvas
          grid={grid}
          active={active}
          activeColor={activeColor}
          flashing={flashing}
        />

        {/* Cadena de eliminaciones. */}
        {chain >= 2 && phase === 'flashing' && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
            <span className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
              Cadena x{chain}
            </span>
          </div>
        )}

        {/* Color nuevo desbloqueado (requisito A23). */}
        {newColor !== null && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-900/95 px-6 py-4">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Color nuevo
              </span>
              <span
                className="block h-6 w-6 rounded"
                style={{ backgroundColor: SAND_COLORS[newColor] }}
              />
              <span className="text-sm font-semibold text-slate-100">
                {SAND_COLOR_NAMES[newColor]}
              </span>
            </div>
          </div>
        )}

        {(phase === 'menu' || phase === 'gameover') && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/85 p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-100">
              {phase === 'menu' ? 'Arena' : 'Fin de partida'}
            </h2>

            {phase === 'menu' && (
              <p className="max-w-xs text-sm text-slate-400">
                Une una masa del mismo color de una pared a la otra.
              </p>
            )}

            {phase === 'gameover' && <p className="text-slate-300">{score} puntos</p>}

            <button
              type="button"
              onClick={startGame}
              className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 hover:bg-white"
            >
              {phase === 'menu' ? 'Jugar' : 'Otra vez'}
            </button>
          </div>
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85">
            <span className="text-2xl font-bold text-slate-100">Pausa</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Flechas para mover y rotar. Espacio para caída rápida. P para pausar.
      </p>
    </div>
  );
}