import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Hud } from './components/Hud';
import { LevelUpBanner } from './components/LevelUpBanner';
import { LiveRegion } from './components/LiveRegion';
import { Overlay, OverlayButton } from './components/Overlay';
import { ScoreBar } from './components/ScoreBar';
import { SettingsPanel } from './components/SettingsPanel';
import { TouchControls } from './components/TouchControls';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameStore } from './store/useGameStore';

function App() {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const lines = useGameStore((state) => state.lines);
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const startGame = useGameStore((state) => state.startGame);
  const resumeSavedGame = useGameStore((state) => state.resumeSavedGame);
  const togglePause = useGameStore((state) => state.togglePause);
  const exitToMenu = useGameStore((state) => state.exitToMenu);

  const [showSettings, setShowSettings] = useState(false);

  useGameLoop();
  useKeyboard();

  // Guarda la partida cuando la pestaña deja de verse. Es el único momento
  // fiable para hacerlo en móvil: al cambiar de aplicación el navegador puede
  // descargar la página sin previo aviso, y eventos como beforeunload no se
  // disparan de forma consistente.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        useGameStore.getState().persist();
      }
    };

    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
        {/* La barra de puntuación va sobre el tablero y comparte su ancho. */}
        <div className="flex flex-col gap-2">
          <ScoreBar />

          {/* relative para que las capas se posicionen sobre el tablero */}
          <div className="relative">
            <Board />
            <LevelUpBanner />

            {showSettings && (
              <Overlay title="Ajustes">
                <SettingsPanel onClose={() => setShowSettings(false)} />
              </Overlay>
            )}

            {!showSettings && status === 'menu' && (
              <Overlay title="Bloques">
                <p className="max-w-xs text-sm text-slate-400">
                  Flechas para mover y rotar. Espacio para caída rápida. P para pausar.
                </p>

                {hasSavedGame && (
                  <OverlayButton onClick={resumeSavedGame}>Continuar partida</OverlayButton>
                )}

                <button
                  type="button"
                  onClick={startGame}
                  className={
                    hasSavedGame
                      ? 'text-sm text-slate-400 underline hover:text-slate-200'
                      : 'rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                  }
                >
                  {hasSavedGame ? 'Empezar de cero' : 'Jugar'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="text-sm text-slate-400 underline hover:text-slate-200"
                >
                  Ajustes
                </button>
              </Overlay>
            )}

            {!showSettings && status === 'paused' && (
              <Overlay title="Pausa">
                <OverlayButton onClick={togglePause}>Continuar</OverlayButton>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="text-sm text-slate-400 underline hover:text-slate-200"
                >
                  Ajustes
                </button>

                <button
                  type="button"
                  onClick={exitToMenu}
                  className="text-sm text-slate-400 underline hover:text-slate-200"
                >
                  Salir al menú
                </button>
              </Overlay>
            )}

            {!showSettings && status === 'gameover' && (
              <Overlay title="Fin de partida">
                <p className="text-slate-300">
                  {score} puntos · {lines} líneas
                </p>
                <OverlayButton onClick={startGame}>Jugar otra vez</OverlayButton>
              </Overlay>
            )}
          </div>
        </div>

        <Hud />
      </div>

      <div className="fixed inset-x-0 bottom-0 p-3 md:hidden">
        <TouchControls />
      </div>

      <LiveRegion />
    </main>
  );
}

export default App;