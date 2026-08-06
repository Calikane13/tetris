import { Board } from './components/Board';
import { Hud } from './components/Hud';
import { Overlay, OverlayButton } from './components/Overlay';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameStore } from './store/useGameStore';

function App() {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const lines = useGameStore((state) => state.lines);
  const startGame = useGameStore((state) => state.startGame);
  const togglePause = useGameStore((state) => state.togglePause);
  const exitToMenu = useGameStore((state) => state.exitToMenu);

  useGameLoop();
  useKeyboard();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
        {/* relative para que las capas se posicionen sobre el tablero */}
        <div className="relative">
          <Board />

          {status === 'menu' && (
            <Overlay title="Bloques">
              <p className="max-w-xs text-sm text-slate-400">
                Flechas para mover y rotar. Espacio para caída rápida. P para pausar.
              </p>
              <OverlayButton onClick={startGame}>Jugar</OverlayButton>
            </Overlay>
          )}

          {status === 'paused' && (
            <Overlay title="Pausa">
              <OverlayButton onClick={togglePause}>Continuar</OverlayButton>
              <button
                type="button"
                onClick={exitToMenu}
                className="text-sm text-slate-400 underline hover:text-slate-200"
              >
                Salir al menú
              </button>
            </Overlay>
          )}

          {status === 'gameover' && (
            <Overlay title="Fin de partida">
              <p className="text-slate-300">
                {score} puntos · {lines} líneas
              </p>
              <OverlayButton onClick={startGame}>Jugar otra vez</OverlayButton>
            </Overlay>
          )}
        </div>

        <Hud />
      </div>
    </main>
  );
}

export default App;