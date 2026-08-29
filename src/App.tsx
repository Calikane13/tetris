// TEMPORAL — S04. El original está en Git: git checkout src/App.tsx

import { SandGame } from './sand/SandGame';

function App() {
  return (
    <main className="flex h-dvh items-center justify-center bg-slate-950 p-4">
      <SandGame />
    </main>
  );
}

export default App;