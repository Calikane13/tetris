// Pantalla del modo arena (v5).
//
// De momento se monta sola, para poder probar S04. En S09 se integra con el
// menú y los modos del juego principal.

import { useEffect } from 'react';
import { useSandLoop } from './useSandLoop';
import { useSandStore } from './useSandStore';
import { SandCanvas } from './SandCanvas';

export function SandGame() {
  const grid = useSandStore((state) => state.grid);
  const active = useSandStore((state) => state.active);
  const activeColor = useSandStore((state) => state.activeColor);
  const phase = useSandStore((state) => state.phase);
  const score = useSandStore((state) => state.score);
  const startGame = useSandStore((state) => state.startGame);

  useSandLoop();

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
        <span className="text-xs text-slate-600">{phase}</span>
      </div>

      <div className="relative">
        <SandCanvas grid={grid} active={active} activeColor={activeColor} />

        {(phase === 'menu' || phase === 'gameover') && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/85 p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-100">
              {phase === 'menu' ? 'Arena' : 'Fin de partida'}
            </h2>

            {phase === 'gameover' && (
              <p className="text-slate-300">{score} puntos</p>
            )}

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