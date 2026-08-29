// Botón de pausa para móvil.
//
// En escritorio se pausa con la tecla P, pero en un móvil no hay teclado, así
// que sin esto no había forma de pausar ni de salir al menú a media partida.
//
// Sirve para los dos motores: recibe la acción desde fuera, así que no necesita
// saber si está sobre el juego clásico o sobre el de arena.

interface PauseButtonProps {
  onPause: () => void;
  /** Si false, el botón no se dibuja. */
  visible?: boolean;
}

export function PauseButton({ onPause, visible = true }: PauseButtonProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onPause}
      aria-label="Pausar"
      className="flex h-9 w-9 shrink-0 touch-none select-none items-center justify-center rounded-lg bg-slate-800/80 text-slate-200 active:bg-slate-700"
    >
      {/* Dos barras: el símbolo universal de pausa. En SVG y no como texto para
          que se vea igual en cualquier sistema. */}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    </button>
  );
}