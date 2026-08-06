// Controles de teclado.
//
// Las teclas ya no están fijas en el código: se leen de los ajustes, para que
// el jugador pueda reasignarlas (regla R42).
//
// La repetición al mantener pulsado la lleva este hook con sus propios tiempos
// (regla R13), no el navegador. Por eso se ignoran los eventos con event.repeat.
//
// Se compara con event.code y no con event.key para que las teclas de letra
// funcionen igual en cualquier distribución de teclado.

import { useEffect, useRef } from 'react';
import { REPEAT_DELAY, REPEAT_INTERVAL } from '../engine/constants';
import type { Action } from '../storage/settings';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';

/** Acciones que se repiten al mantener la tecla pulsada. */
const REPEATABLE: readonly Action[] = ['left', 'right', 'softDrop'];

export function useKeyboard(): void {
  const keys = useSettingsStore((state) => state.keys);
  const repeatRef = useRef<number | null>(null);

  useEffect(() => {
    const stopRepeat = () => {
      if (repeatRef.current !== null) {
        clearTimeout(repeatRef.current);
        clearInterval(repeatRef.current);
        repeatRef.current = null;
      }
    };

    const startRepeat = (action: () => void) => {
      stopRepeat();
      action();

      // Primera repetición tras una pausa, para que un toque suelto mueva una
      // sola celda; después, repeticiones rápidas.
      repeatRef.current = window.setTimeout(() => {
        repeatRef.current = window.setInterval(action, REPEAT_INTERVAL);
      }, REPEAT_DELAY);
    };

    /** Busca qué acción tiene asignada un código de tecla. */
    const actionForCode = (code: string): Action | null => {
      for (const [action, assigned] of Object.entries(keys)) {
        if (assigned === code) return action as Action;
      }
      return null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const action = actionForCode(event.code);
      if (!action) return;

      // Solo se bloquea el comportamiento del navegador en las teclas que el
      // juego usa realmente, para no romper atajos como F5 o Ctrl+T.
      event.preventDefault();

      // La repetición la controlamos nosotros.
      if (event.repeat) return;

      const store = useGameStore.getState();

      switch (action) {
        case 'left':
          startRepeat(() => useGameStore.getState().moveLeft());
          break;
        case 'right':
          startRepeat(() => useGameStore.getState().moveRight());
          break;
        case 'softDrop':
          startRepeat(() => useGameStore.getState().softDrop());
          break;
        case 'hardDrop':
          store.hardDrop();
          break;
        case 'rotateCW':
          store.rotateCW();
          break;
        case 'rotateCCW':
          store.rotateCCW();
          break;
        case 'pause':
          store.togglePause();
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const action = actionForCode(event.code);
      if (action && REPEATABLE.includes(action)) {
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
    // El efecto se rehace al cambiar las teclas, para que una reasignación
    // tenga efecto inmediato sin recargar la página.
  }, [keys]);
}