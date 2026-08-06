// Aviso breve al subir de nivel (regla R36).
//
// Se muestra sobre el tablero durante poco más de un segundo y desaparece solo.
// No interrumpe la partida ni requiere ninguna acción: es información, no un
// diálogo.
//
// La animación está definida en index.css dentro de una consulta de
// prefers-reduced-motion, de modo que quien tenga esa preferencia activa ve el
// aviso igual, pero sin movimiento (criterio NF6).

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

/** Milisegundos que permanece visible. */
const VISIBLE_MS = 1200;

export function LevelUpBanner() {
  const level = useGameStore((state) => state.level);
  const status = useGameStore((state) => state.status);

  const [visible, setVisible] = useState(false);
  const previousLevel = useRef(level);

  useEffect(() => {
    // Solo interesa cuando el nivel sube durante una partida. Al empezar una
    // nueva, el nivel vuelve a 1 y eso no debe disparar el aviso.
    if (level > previousLevel.current && status === 'playing') {
      setVisible(true);

      const timer = window.setTimeout(() => setVisible(false), VISIBLE_MS);

      previousLevel.current = level;
      return () => window.clearTimeout(timer);
    }

    previousLevel.current = level;
  }, [level, status]);

  if (!visible) return null;

  return (
    <div
      // Decorativo: el mismo cambio ya se anuncia desde LiveRegion, y
      // duplicarlo haría que el lector lo dijera dos veces.
      aria-hidden="true"
      className="level-up-banner pointer-events-none absolute inset-x-0 top-1/3 z-20 flex justify-center"
    >
      <span className="rounded-lg bg-cyan-400/90 px-6 py-3 text-xl font-bold text-slate-900 shadow-lg">
        Nivel {level}
      </span>
    </div>
  );
}