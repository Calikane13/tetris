// Aviso de estilo desbloqueado (v4, requisito M44).
//
// Hermano de LevelUpBanner y ComboBanner, pero con una diferencia: este no se
// dispara por un cambio de número, sino por una marca del store que hay que
// limpiar después. Sin limpiarla, el aviso volvería a salir en la siguiente
// partida.

import { useEffect } from 'react';
import { BLOCK_STYLES, STYLE_INFO } from '../engine/blockStyles';
import { useSettingsStore } from '../store/useSettingsStore';

/** Milisegundos que permanece visible. Más que los otros avisos: es raro. */
const VISIBLE_MS = 2600;

export function UnlockBanner() {
  const justUnlocked = useSettingsStore((state) => state.justUnlocked);
  const clearJustUnlocked = useSettingsStore((state) => state.clearJustUnlocked);

  useEffect(() => {
    if (!justUnlocked) return;

    const timer = window.setTimeout(clearJustUnlocked, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [justUnlocked, clearJustUnlocked]);

  if (!justUnlocked) return null;

  const info = STYLE_INFO[justUnlocked];

  return (
    <div
      // Decorativo: el texto ya se anuncia desde LiveRegion.
      aria-hidden="true"
      className="unlock-banner pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center"
    >
      <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-900/95 px-6 py-4 shadow-xl ring-1 ring-amber-400/50">
        <span className="text-xs uppercase tracking-wide text-amber-400">
          Estilo desbloqueado
        </span>

        <span className="text-xl font-bold text-slate-100">{info.name}</span>

        {/* Una muestra del estilo conseguido, para que se vea qué has ganado. */}
        <span className="flex gap-0.5">
          {(['I', 'T', 'S', 'L', 'O'] as const).map((piece) => (
            <span
              key={piece}
              className={`relative block h-5 w-5 ${BLOCK_STYLES[justUnlocked][piece].base}`}
            />
          ))}
        </span>

        <span className="text-xs text-slate-400">Elígelo en Ajustes</span>
      </div>
    </div>
  );
}