// Controles de teclado.
//
// La repetición al mantener pulsado no se delega al navegador: la lleva este
// hook con sus propios tiempos (regla R13). Por eso se ignoran los eventos que
// llegan con event.repeat.
//
// Se compara con event.code y no con event.key para que las teclas de letra
// funcionen igual en cualquier distribución de teclado.

import { useEffect, useRef } from 'react';
import { REPEAT_DELAY, REPEAT_INTERVAL } from '../engine/constants';
import { useGameStore } from '../store/useGameStore';

/** Teclas que el juego consume y que no deben desplazar la página. */
const GAME_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'Space',
  'KeyZ',
  'KeyP',
]);

export function useKeyboard(): void {
  // Guarda el temporizador de la tecla de movimiento que se mantiene pulsada.
  const repeatRef = useRef<number | null>(null);

  useEffect(() => {
    const stopRepeat = () => {
      if (repeatRef.current !== null) {
        clearInterval(repeatRef.current);
        repeatRef.current = null;
      }
    };

    const startRepeat = (action: () => void) => {
      stopRepeat();
      action();

      // Primera repetición tras una pausa, para que un toque suelto mueva una
      // sola celda; después, repeticiones rápidas.
      const timeout = window.setTimeout(() => {
        repeatRef.current = window.setInterval(action, REPEAT_INTERVAL);
      }, REPEAT_DELAY);

      repeatRef.current = timeout;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (GAME_KEYS.has(event.code)) {
        event.preventDefault();
      }

      // La repetición la controlamos nosotros, no el navegador.
      if (event.repeat) return;

      const store = useGameStore.getState();

      switch (event.code) {
        case 'ArrowLeft':
          startRepeat(() => useGameStore.getState().moveLeft());
          break;
        case 'ArrowRight':
          startRepeat(() => useGameStore.getState().moveRight());
          break;
        case 'ArrowDown':
          startRepeat(() => useGameStore.getState().softDrop());
          break;
        case 'ArrowUp':
          store.rotateCW();
          break;
        case 'KeyZ':
          store.rotateCCW();
          break;
        case 'Space':
          store.hardDrop();
          break;
        case 'KeyP':
          store.togglePause();
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.code)) {
        stopRepeat();
      }
    };

    // Si la ventana pierde el foco con una tecla pulsada, el keyup nunca llega
    // y la pieza se movería sola para siempre.
    const onBlur = () => stopRepeat();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      stopRepeat();
    };
  }, []);
}