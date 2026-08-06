// Ajustes del jugador: sonido, fantasma y asignación de teclas (regla R42).
//
// A diferencia de la partida, los ajustes se guardan en cuanto cambian: son
// pocos bytes y el usuario espera que se recuerden al instante.

import {
  hasValidVersion,
  readJson,
  STORAGE_KEYS,
  STORAGE_VERSION,
  writeJson,
} from './safeStorage';

/** Las acciones que se pueden reasignar a una tecla. */
export type Action =
  | 'left'
  | 'right'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'pause';

/** Nombre legible de cada acción, para el panel de ajustes. */
export const ACTION_LABELS: Record<Action, string> = {
  left: 'Mover a la izquierda',
  right: 'Mover a la derecha',
  softDrop: 'Bajar',
  hardDrop: 'Caída rápida',
  rotateCW: 'Rotar horario',
  rotateCCW: 'Rotar antihorario',
  pause: 'Pausa',
};

/** Todas las acciones, en el orden en que se muestran. */
export const ALL_ACTIONS: readonly Action[] = [
  'left',
  'right',
  'softDrop',
  'hardDrop',
  'rotateCW',
  'rotateCCW',
  'pause',
];

/**
 * Asignación de teclas. Los valores son códigos de event.code, no caracteres,
 * para que funcionen igual en cualquier distribución de teclado.
 */
export type KeyMap = Record<Action, string>;

export interface Settings {
  sound: boolean;
  ghost: boolean;
  keys: KeyMap;
}

export const DEFAULT_KEYS: KeyMap = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: 'Space',
  rotateCW: 'ArrowUp',
  rotateCCW: 'KeyZ',
  pause: 'KeyP',
};

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  ghost: true,
  keys: DEFAULT_KEYS,
};

/**
 * Traduce un código de tecla a algo legible para mostrar en pantalla.
 * Los casos frecuentes se traducen a mano; el resto se limpia del prefijo.
 */
export function keyLabel(code: string): string {
  const named: Record<string, string> = {
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Space: 'Espacio',
    Enter: 'Intro',
    ShiftLeft: 'Mayús izq',
    ShiftRight: 'Mayús der',
    ControlLeft: 'Ctrl izq',
    ControlRight: 'Ctrl der',
  };

  if (named[code]) return named[code];

  // KeyZ pasa a Z, Digit1 pasa a 1.
  return code.replace(/^Key/, '').replace(/^Digit/, '');
}

/** Lee los ajustes guardados, rellenando con los valores por defecto lo que falte. */
export function loadSettings(): Settings {
  const data = readJson(STORAGE_KEYS.settings);

  if (!hasValidVersion(data)) return DEFAULT_SETTINGS;

  const keys: KeyMap = { ...DEFAULT_KEYS };

  // Se copia tecla a tecla en lugar de aceptar el objeto entero: así, si en el
  // futuro se añade una acción nueva, los ajustes antiguos siguen sirviendo y
  // la acción nueva simplemente toma su valor por defecto.
  if (typeof data.keys === 'object' && data.keys !== null) {
    const saved = data.keys as Record<string, unknown>;

    for (const action of ALL_ACTIONS) {
      const value = saved[action];
      if (typeof value === 'string' && value.length > 0) {
        keys[action] = value;
      }
    }
  }

  return {
    sound: typeof data.sound === 'boolean' ? data.sound : DEFAULT_SETTINGS.sound,
    ghost: typeof data.ghost === 'boolean' ? data.ghost : DEFAULT_SETTINGS.ghost,
    keys,
  };
}

/** Guarda los ajustes. */
export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEYS.settings, { v: STORAGE_VERSION, ...settings });
}