// PROVISIONAL — Tarea T15. Todavía sin controles ni HUD.

import { useEffect } from 'react';
import { Board } from './components/Board';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameStore } from './store/useGameStore';

function App() {
  const startGame = useGameStore((state) => state.startGame);
  const status = useGameStore((state) => state.status);

  useGameLoop();
  useKeyboard();
  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950">
      <Board />
      <p className="text-sm text-slate-500">estado: {status}</p>
    </main>
  );
}

export default App;