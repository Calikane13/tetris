// Botones táctiles para móvil (reglas C5 y C6).
//
// Se usan eventos pointer en lugar de touch porque funcionan igual con dedo,
// ratón y lápiz, y así hay un solo camino de código.
//
// La repetición al mantener pulsado replica la del teclado: una pausa inicial
// y después repeticiones rápidas.

import { useEffect, useRef } from 'react';
import { REPEAT_DELAY, REPEAT_INTERVAL } from '../engine/constants';
import { useGameStore } from '../store/useGameStore';

interface TouchButtonProps {
  label: string;
  symbol: string;
  onPress: () => void;
  /** Si es true, se repite al mantener pulsado. */
  repeat?: boolean;
}

function TouchButton({ label, symbol, onPress, repeat = false }: TouchButtonProps) {
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Si el componente desaparece con el dedo apoyado, el temporizador seguiría vivo.
  useEffect(() => stop, []);

  const start = () => {
    onPress();

    if (!repeat) return;

    timerRef.current = window.setTimeout(() => {
      timerRef.current = window.setInterval(onPress, REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        // Evita que el navegador interprete el gesto como desplazamiento o zoom.
        event.preventDefault();
        start();
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="flex h-16 w-16 touch-none select-none items-center justify-center rounded-xl bg-slate-800 text-2xl text-slate-200 active:bg-slate-700"
    >
      {symbol}
    </button>
  );
}

export function TouchControls() {
  const moveLeft = useGameStore((state) => state.moveLeft);
  const moveRight = useGameStore((state) => state.moveRight);
  const softDrop = useGameStore((state) => state.softDrop);
  const rotateCW = useGameStore((state) => state.rotateCW);
  const hardDrop = useGameStore((state) => state.hardDrop);

  return (
    <div className="flex w-full items-center justify-between gap-2 md:hidden">
      <div className="flex gap-2">
        <TouchButton label="Mover a la izquierda" symbol="←" onPress={moveLeft} repeat />
        <TouchButton label="Mover a la derecha" symbol="→" onPress={moveRight} repeat />
      </div>

      <div className="flex gap-2">
        <TouchButton label="Bajar" symbol="↓" onPress={softDrop} repeat />
        <TouchButton label="Rotar" symbol="⟳" onPress={rotateCW} />
        <TouchButton label="Caída rápida" symbol="⤓" onPress={hardDrop} />
      </div>
    </div>
  );
}