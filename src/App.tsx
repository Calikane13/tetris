import { useEffect } from 'react';
import { Board } from './components/Board';
import { Hud } from './components/Hud';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameStore } from './store/useGameStore';

function App() {
  const startGame = useGameStore((state) => state.startGame);

  useGameLoop();
  useKeyboard();

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
        <Board />
        <Hud />
      </div>
    </main>
  );
}

export default App;