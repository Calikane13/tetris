// Pantalla del modo arena (v5).
//
// Todo lo visual del modo vive aquí. La lógica está en useSandStore, y el
// dibujo del tablero en SandCanvas.

import { useEffect } from 'react';
import { CrownIcon } from '../components/CrownIcon';
import { PauseButton } from '../components/PauseButton';
import {
  TouchMoveLeft,
  TouchMoveRight,
  TouchSideLeft,
  TouchSideRight,
} from '../components/TouchControls';
import { getCells } from '../engine/tetrominoes';
import { useGameStore } from '../store/useGameStore';
import { SAND_COLOR_NAMES, SAND_COLORS } from './constants';
import { SandCanvas } from './SandCanvas';
import { useSandLoop } from './useSandLoop';
import { useSandStore } from './useSandStore';

/** Recuadro de la siguiente pieza, en su color real. */
function NextSandPiece() {
  const next = useSandStore((state) => state.next);
  const nextColor = useSandStore((state) => state.nextColor);

  const cells = getCells(next, 0);
  const occupied = new Set(cells.map((cell) => `${cell.row}-${cell.col}`));

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        Siguiente
      </span>

      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(4, calc(var(--cell) * 0.7))',
          gridTemplateRows: 'repeat(4, calc(var(--cell) * 0.7))',
        }}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const filled = occupied.has(`${row}-${col}`);

          return (
            <span
              key={i}
              style={{
                backgroundColor: filled ? SAND_COLORS[nextColor] : '#0f172a',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function SandGame({ onExit }: { onExit: () => void }) {
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
  const togglePause = useSandStore((state) => state.togglePause);
  const clearNewColor = useSandStore((state) => state.clearNewColor);

  // La marca del modo vive en el store clásico, junto a las de los demás modos.
  const sandRecord = useGameStore((state) => state.records.sand);

  useSandLoop();

  // Acciones para los botones táctiles. Se leen del store en el momento de
  // pulsar, no al montar, para no capturar una versión antigua.
  const touchActions = {
    moveLeft: () => useSandStore.getState().moveLeft(),
    moveRight: () => useSandStore.getState().moveRight(),
    softDrop: () => useSandStore.getState().softDrop(),
    rotateCW: () => useSandStore.getState().rotateCW(),
    hardDrop: () => useSandStore.getState().hardDrop(),
  };

  // El aviso de color nuevo desaparece solo.
  useEffect(() => {
    if (newColor === null) return;
    const timer = window.setTimeout(clearNewColor, 2200);
    return () => window.clearTimeout(timer);
  }, [newColor, clearNewColor]);

  // Controles de teclado.
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
    <div className="flex flex-col items-center gap-2">
      {/* Cabecera: puntuación y récord a la izquierda, siguiente pieza y
          colores en juego a la derecha. */}
      <div className="flex w-full items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">
              Puntos
            </span>
            <span className="block font-mono text-3xl leading-none tabular-nums text-slate-100">
              {score}
            </span>
          </div>

          {/* La marca sube en vivo si la partida la supera, igual que en el
              modo clásico (requisito V21). */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <CrownIcon className="h-4 w-4" />
            <span className="font-mono text-base tabular-nums">
              {Math.max(sandRecord, score)}
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <NextSandPiece />

          {/* Los colores en juego, como referencia visual de la dificultad. */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Colores
            </span>
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

          {/* En móvil no hay tecla P, así que sin este botón no habría forma de
              pausar ni de salir al menú a media partida. */}
          <div className="md:hidden">
            <PauseButton
              onPause={togglePause}
              visible={phase === 'falling' || phase === 'settling'}
            />
          </div>
        </div>
      </div>

      {/* Fila del tablero, con los botones táctiles a los lados. */}
      <div className="flex items-center justify-center gap-2">
        <TouchSideLeft actions={touchActions} />

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

              {phase === 'gameover' && (
                <>
                  <p className="text-slate-300">{score} puntos</p>
                  {score >= sandRecord && score > 0 && (
                    <p className="text-sm font-semibold text-amber-400">
                      ¡Récord nuevo!
                    </p>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={startGame}
                className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 hover:bg-white"
              >
                {phase === 'menu' ? 'Jugar' : 'Otra vez'}
              </button>

              <button
                type="button"
                onClick={onExit}
                className="text-sm text-slate-400 underline hover:text-slate-200"
              >
                Salir al menú
              </button>
            </div>
          )}

          {/* Pausa, con su propia salida al menú: es la única forma de irse a
              media partida en móvil. */}
          {phase === 'paused' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/85">
              <h2 className="text-2xl font-bold text-slate-100">Pausa</h2>

              <button
                type="button"
                onClick={togglePause}
                className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 hover:bg-white"
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={onExit}
                className="text-sm text-slate-400 underline hover:text-slate-200"
              >
                Salir al menú
              </button>
            </div>
          )}
        </div>

        <TouchSideRight actions={touchActions} />
      </div>

      {/* Fila inferior, solo en móvil: los botones de mover en los extremos. */}
      <div className="flex w-full items-center justify-between gap-2 md:hidden">
        <TouchMoveLeft actions={touchActions} />
        <TouchMoveRight actions={touchActions} />
      </div>

      <p className="hidden text-xs text-slate-500 md:block">
        Flechas para mover y rotar. Espacio para caída rápida. P para pausar.
      </p>
    </div>
  );
}