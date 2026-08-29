// Bucle del modo arena (v5).
//
// Igual que el del juego clásico: mide el tiempo entre fotogramas y se lo pasa
// al store. Va aparte porque el modo tiene su propio estado y sus propias
// fases, y mezclarlos obligaría a llenar el bucle clásico de condicionales.
//
// Corre durante 'falling' y durante 'settling': en la primera fase mueve la
// pieza, y en la segunda hace caer la arena un paso por fotograma, que es lo
// que permite ver el asentamiento (requisito A14).

import { useEffect } from 'react';
import { MAX_FRAME_DELTA } from '../engine/constants';
import { sandTick, useSandStore } from './useSandStore';

export function useSandLoop(): void {
  const phase = useSandStore((state) => state.phase);

  useEffect(() => {
    if (phase !== 'falling' && phase !== 'settling') return;

    let frameId = 0;
    let previous = performance.now();

    const frame = (now: number) => {
      // Si la pestaña ha estado en segundo plano, el salto puede ser de varios
      // segundos. Se recorta para que la pieza no caiga de golpe al volver.
      const delta = Math.min(now - previous, MAX_FRAME_DELTA);
      previous = now;

      sandTick(delta);
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, [phase]);
}