// Cartel de combo (v3, requisitos C11, C12, C14, C15).
//
// Hermano de LevelUpBanner y con la misma forma: observa un valor del store, se
// muestra un rato y desaparece solo sin bloquear el juego.
//
// Amarillo, para distinguirlo del aviso de nivel, que es cian.

import { useEffect, useRef, useState } from 'react';
import { COMBO_BANNER_MS } from '../engine/constants';
import { useGameStore } from '../store/useGameStore';

export function ComboBanner() {
  const combo = useGameStore((state) => state.combo);
  const bonus = useGameStore((state) => state.lastComboBonus);
  const status = useGameStore((state) => state.status);

  const [shown, setShown] = useState<{ combo: number; bonus: number } | null>(null);
  const previousCombo = useRef(combo);

  useEffect(() => {
    // Solo interesa cuando la racha sube y ya vale al menos 2: la primera
    // eliminación es simplemente eliminar una línea, no un combo.
    if (combo > previousCombo.current && combo >= 2 && status === 'playing') {
      setShown({ combo, bonus });

      const timer = window.setTimeout(() => setShown(null), COMBO_BANNER_MS);

      previousCombo.current = combo;
      return () => window.clearTimeout(timer);
    }

    previousCombo.current = combo;
  }, [combo, bonus, status]);

  if (!shown) return null;

  return (
    <div
      // Decorativo: la racha ya se anuncia desde LiveRegion, y duplicarlo haría
      // que el lector de pantalla la dijera dos veces.
      aria-hidden="true"
      className="combo-banner pointer-events-none absolute inset-x-0 top-1/2 z-20 flex flex-col items-center gap-1"
    >
      <span className="text-3xl font-extrabold tracking-wide text-yellow-300 drop-shadow-lg">
        Combo x{shown.combo}
      </span>
      <span className="text-lg font-bold text-yellow-200">+{shown.bonus}</span>
    </div>
  );
}