// Bucle de juego: mide el tiempo entre fotogramas y se lo pasa al store.
//
// La velocidad del juego va atada al reloj, no a la frecuencia de refresco de
// la pantalla, así que se juega igual en un monitor de 60 Hz que en uno de 120.

import { useEffect } from 'react';
import { MAX_FRAME_DELTA } from '../engine/constants';
import { addTime, useGameStore } from '../store/useGameStore';

export function useGameLoop(): void {
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    // Solo corre durante la partida. Al pausar, el efecto se limpia y el bucle
    // se detiene: no hace falta comprobar el estado en cada fotograma.
    if (status !== 'playing') return;

    let frameId = 0;
    let previous = performance.now();

    const frame = (now: number) => {
      // Si la pestaña ha estado en segundo plano, el salto puede ser de varios
      // segundos. Se recorta para que la pieza no caiga de golpe al volver.
      const delta = Math.min(now - previous, MAX_FRAME_DELTA);
      previous = now;

      addTime(delta);
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, [status]);
}