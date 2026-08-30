// Botones táctiles para móvil (reglas C5 y C6).
//
// Se usan eventos pointer en lugar de touch porque funcionan igual con dedo,
// ratón y lápiz, y así hay un solo camino de código.
//
// Van repartidos por la pantalla en vez de juntos en una barra: girar y bajar
// pegados al lado izquierdo del tablero, caída rápida al derecho, y los de
// mover en la fila de abajo, uno en cada extremo. Así ningún botón se solapa
// con el tablero ni con el HUD.
//
// Desde la v5 reciben las acciones desde fuera en lugar de leerlas del store
// clásico: el modo arena tiene su propio store, y sin esto habría que duplicar
// los botones para cada motor.

import { useEffect, useRef } from 'react';
import { REPEAT_DELAY, REPEAT_INTERVAL } from '../engine/constants';

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

/** Las acciones que necesitan los botones. Las provee quien los monta. */
export interface TouchActions {
  moveLeft: () => void;
  moveRight: () => void;
  softDrop: () => void;
  rotateCW: () => void;
  hardDrop: () => void;
}

/** Girar y bajar, al lado izquierdo del tablero. */
export function TouchSideLeft({ actions }: { actions: TouchActions }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <TouchButton label="Rotar" symbol="⟳" onPress={actions.rotateCW} />
      <TouchButton label="Bajar" symbol="↓" onPress={actions.softDrop} repeat />
    </div>
  );
}

/** Caída rápida, al lado derecho del tablero. */
export function TouchSideRight({ actions }: { actions: TouchActions }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <TouchButton label="Caída rápida" symbol="⤓" onPress={actions.hardDrop} />
    </div>
  );
}

/** Mover a la izquierda, en el extremo izquierdo de la fila inferior. */
export function TouchMoveLeft({ actions }: { actions: TouchActions }) {
  return (
    <div className="md:hidden">
      <TouchButton
        label="Mover a la izquierda"
        symbol="←"
        onPress={actions.moveLeft}
        repeat
      />
    </div>
  );
}

/** Mover a la derecha, en el extremo derecho de la fila inferior. */
export function TouchMoveRight({ actions }: { actions: TouchActions }) {
  return (
    <div className="md:hidden">
      <TouchButton
        label="Mover a la derecha"
        symbol="→"
        onPress={actions.moveRight}
        repeat
      />
    </div>
  );
}