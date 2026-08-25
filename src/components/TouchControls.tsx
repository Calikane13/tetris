// Botones táctiles para móvil (reglas C5 y C6).
//
// Se usan eventos pointer en lugar de touch porque funcionan igual con dedo,
// ratón y lápiz, y así hay un solo camino de código.
//
// Se exportan en tres grupos porque van repartidos por la pantalla en vez de
// juntos en una barra: girar y bajar pegados al lado izquierdo del tablero,
// caída rápida al derecho, y los de mover en la fila de abajo, uno en cada
// extremo. Así ningún botón se solapa con el tablero ni con el HUD, y los
// pulgares caen de forma natural sobre los de mover, que son los más usados.

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
      className="flex h-12 w-12 shrink-0 touch-none select-none items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-200 active:bg-slate-700"
    >
      {symbol}
    </button>
  );
}

/** Girar y bajar, al lado izquierdo del tablero. */
export function TouchSideLeft() {
  const softDrop = useGameStore((state) => state.softDrop);
  const rotateCW = useGameStore((state) => state.rotateCW);

  return (
    <div className="flex flex-col gap-2 md:hidden">
      <TouchButton label="Rotar" symbol="⟳" onPress={rotateCW} />
      <TouchButton label="Bajar" symbol="↓" onPress={softDrop} repeat />
    </div>
  );
}

/** Caída rápida, al lado derecho del tablero. */
export function TouchSideRight() {
  const hardDrop = useGameStore((state) => state.hardDrop);

  return (
    <div className="flex flex-col gap-2 md:hidden">
      <TouchButton label="Caída rápida" symbol="⤓" onPress={hardDrop} />
    </div>
  );
}

/** Mover a la izquierda, en el extremo izquierdo de la fila inferior. */
export function TouchMoveLeft() {
  const moveLeft = useGameStore((state) => state.moveLeft);

  return (
    <div className="md:hidden">
      <TouchButton label="Mover a la izquierda" symbol="←" onPress={moveLeft} repeat />
    </div>
  );
}

/** Mover a la derecha, en el extremo derecho de la fila inferior. */
export function TouchMoveRight() {
  const moveRight = useGameStore((state) => state.moveRight);

  return (
    <div className="md:hidden">
      <TouchButton label="Mover a la derecha" symbol="→" onPress={moveRight} repeat />
    </div>
  );
}