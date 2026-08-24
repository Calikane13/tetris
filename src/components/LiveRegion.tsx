// Anuncios de estado para lectores de pantalla (criterio C2 de la constitución).
//
// El tablero es una rejilla de 200 divs: recorrerlo con un lector de pantalla
// sería inútil y agotador, así que se marca como decorativo y toda la
// información relevante se da por aquí, en texto.

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export function LiveRegion() {
  const status = useGameStore((state) => state.status);
  const level = useGameStore((state) => state.level);
  const lines = useGameStore((state) => state.lines);
  const score = useGameStore((state) => state.score);
  const combo = useGameStore((state) => state.combo);

  const [message, setMessage] = useState('');

  // Se guardan los valores anteriores para saber qué ha cambiado y anunciar
  // solo eso, en lugar de repetir el estado completo cada vez.
  const previous = useRef({ level, lines, status });

  useEffect(() => {
    const before = previous.current;

    if (status !== before.status) {
      if (status === 'playing') setMessage('Partida en curso');
      else if (status === 'paused') setMessage('Juego en pausa');
      else if (status === 'gameover') {
        setMessage(`Fin de partida. ${score} puntos con ${lines} líneas.`);
      } else if (status === 'menu') setMessage('Menú principal');
    } else if (level > before.level) {
      setMessage(`Nivel ${level}`);
    } else if (lines > before.lines) {
      const cleared = lines - before.lines;
      const base = cleared === 1 ? 'Una línea' : `${cleared} líneas`;

      // La racha se menciona solo cuando existe, para no repetir "combo 0"
      // en cada línea suelta (requisito C17).
      const comboPart = combo >= 2 ? ` Combo ${combo}.` : '';

      setMessage(`${base}.${comboPart} ${score} puntos.`);
    }

    previous.current = { level, lines, status };
  }, [status, level, lines, score, combo]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}