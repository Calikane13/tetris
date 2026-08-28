import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { ComboBanner } from './components/ComboBanner';
import { GameOverPanel } from './components/GameOverPanel';
import { Hud } from './components/Hud';
import { LevelUpBanner } from './components/LevelUpBanner';
import { LiveRegion } from './components/LiveRegion';
import { Logo } from './components/Logo';
import { ModePicker } from './components/ModePicker';
import { Overlay, OverlayButton } from './components/Overlay';
import { ScoreBar } from './components/ScoreBar';
import { SettingsPanel } from './components/SettingsPanel';
import { Timer } from './components/Timer';
import { UnlockBanner } from './components/UnlockBanner';
import {
  TouchMoveLeft,
  TouchMoveRight,
  TouchSideLeft,
  TouchSideRight,
} from './components/TouchControls';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameStore } from './store/useGameStore';

function App() {
  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const startLevel = useGameStore((state) => state.startLevel);
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const startGame = useGameStore((state) => state.startGame);
  const resumeSavedGame = useGameStore((state) => state.resumeSavedGame);
  const togglePause = useGameStore((state) => state.togglePause);
  const exitToMenu = useGameStore((state) => state.exitToMenu);

  const [showSettings, setShowSettings] = useState(false);

  useGameLoop();
  useKeyboard();

  // Al terminar una partida, "jugar otra vez" repite el mismo modo y nivel.
  const restart = () => startGame(mode, startLevel);

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
    // h-dvh y overflow-hidden en lugar de min-h-dvh: en móvil no debe haber
    // nada que desplazar. Si la página puede moverse, el contenido acaba
    // deslizándose bajo los botones y el HUD se pierde de vista.
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-slate-950 p-2 md:p-4">
      <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:items-start md:gap-10">
        <div className="flex flex-col items-stretch gap-2">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <ScoreBar />
            </div>
            <Timer />
          </div>

          {/* Fila del tablero: girar y bajar a su izquierda, caída rápida a su
              derecha. En escritorio los botones no se muestran y solo queda el
              tablero. */}
          <div className="flex items-center justify-center gap-2">
            <TouchSideLeft />

            {/* relative para que las capas se posicionen sobre el tablero */}
            <div className="relative">
              {/* El apagado se aplica a un envoltorio del tablero, no a la capa
                  de encima: si no, el texto del resultado también se volvería
                  gris y perdería legibilidad (requisito V22). */}
              <div className={status === 'gameover' ? 'board-dead' : undefined}>
                <Board />
              </div>

              <LevelUpBanner />
              <ComboBanner />
              <UnlockBanner />

              {showSettings && (
                <Overlay title="Ajustes">
                  <SettingsPanel onClose={() => setShowSettings(false)} />
                </Overlay>
              )}

              {!showSettings && status === 'menu' && (
                <Overlay title="Bloque a Bloque">
                  <Logo size={44} className="md:hidden" />
                  <Logo size={72} className="hidden md:block" />

                  <ModePicker onPlay={startGame} />

                  {hasSavedGame && (
                    <button
                      type="button"
                      onClick={resumeSavedGame}
                      className="text-sm text-slate-400 underline hover:text-slate-200"
                    >
                      Continuar partida
                    </button>
                  )}

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
                  <GameOverPanel onRestart={restart} />
                </Overlay>
              )}
            </div>

            <TouchSideRight />
          </div>

          {/* Fila inferior, solo en móvil: mover a la izquierda en un extremo,
              mover a la derecha en el otro, y el HUD entre los dos. */}
          <div className="flex items-center justify-between gap-2 md:hidden">
            <TouchMoveLeft />
            <Hud />
            <TouchMoveRight />
          </div>
        </div>

        {/* En escritorio el HUD va en su columna lateral de siempre. */}
        <div className="hidden md:block">
          <Hud />
        </div>
      </div>

      <LiveRegion />
    </main>
  );
}

export default App;