// PROVISIONAL — Tarea T14.
// Muestra el tablero en texto para comprobar que la gravedad funciona.
// Se sustituye por los componentes reales en la fase 3.

import { useEffect } from 'react';
import { getCells } from './engine/tetrominoes';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';

function App() {
  const board = useGameStore((state) => state.board);
  const active = useGameStore((state) => state.active);
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const startGame = useGameStore((state) => state.startGame);

  useGameLoop();

  // Arranca una partida automáticamente al cargar, para no necesitar botones.
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Combina el tablero con la pieza activa solo para pintar.
  const view = board.map((row) => [...row]);

  if (active) {
    for (const cell of getCells(active.type, active.rotation)) {
      const row = active.row + cell.row;
      const col = active.col + cell.col;
      if (row >= 0 && row < view.length && col >= 0 && col < view[0].length) {
        view[row][col] = active.type;
      }
    }
  }

  return (
    <main className="min-h-dvh bg-slate-950 p-8 font-mono text-slate-200">
      <h1 className="mb-4 text-xl font-bold">Prueba de gravedad (T14)</h1>
      <p className="mb-4 text-sm text-slate-400">
        estado: {status} · puntuación: {score}
      </p>

      <pre className="text-sm leading-tight">
        {view.map((row) => row.map((cell) => (cell ? '#' : '.')).join(' ')).join('\n')}
      </pre>
    </main>
  );
}

export default App;