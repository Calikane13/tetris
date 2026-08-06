// Capa que se superpone al tablero para el menú, la pausa y el fin de partida.
//
// Es un único componente reutilizable porque las tres pantallas tienen la misma
// forma: un título, un texto opcional y uno o dos botones.

import type { ReactNode } from 'react';

interface OverlayProps {
  title: string;
  children?: ReactNode;
}

export function Overlay({ title, children }: OverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/85 p-6 text-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      {children}
    </div>
  );
}

/** Botón de las pantallas. Se define aquí porque solo lo usan ellas. */
export function OverlayButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      {children}
    </button>
  );
}