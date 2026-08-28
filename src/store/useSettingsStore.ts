// Store de los ajustes, separado del de la partida.
//
// Van aparte porque tienen ciclos de vida distintos: la partida se reinicia
// constantemente, los ajustes sobreviven a todo. Mezclarlos obligaría a
// acordarse de preservar los ajustes en cada startGame().

import { create } from 'zustand';
import type { StyleId } from '../engine/blockStyles';
import type { Action, Settings } from '../storage/settings';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../storage/settings';
import { loadUnlocks, unlockStyle } from '../storage/unlocks';

interface SettingsStore extends Settings {
  /** Estilos que el jugador tiene disponibles. */
  unlocked: StyleId[];
  /** Estilo recién desbloqueado, para avisar en pantalla. Se limpia al mostrarlo. */
  justUnlocked: StyleId | null;

  toggleSound: () => void;
  toggleGhost: () => void;
  setKey: (action: Action, code: string) => void;
  resetKeys: () => void;
  setBlockStyle: (style: StyleId) => void;
  unlock: (style: StyleId) => void;
  clearJustUnlocked: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadSettings(),
  unlocked: loadUnlocks(),
  justUnlocked: null,

  toggleSound: () => {
    set({ sound: !get().sound });
    persist(get);
  },

  toggleGhost: () => {
    set({ ghost: !get().ghost });
    persist(get);
  },

  setKey: (action, code) => {
    const keys = { ...get().keys };

    // Si la tecla ya estaba asignada a otra acción, se libera: dos acciones con
    // la misma tecla dejarían una de ellas inalcanzable.
    for (const key of Object.keys(keys) as Action[]) {
      if (keys[key] === code) {
        keys[key] = '';
      }
    }

    keys[action] = code;
    set({ keys });
    persist(get);
  },

  resetKeys: () => {
    set({ keys: { ...DEFAULT_SETTINGS.keys } });
    persist(get);
  },

  setBlockStyle: (style) => {
    // Solo se puede elegir lo que está desbloqueado. La interfaz ya lo impide,
    // pero comprobarlo aquí evita que un estado raro deje el tablero sin pintar.
    if (!get().unlocked.includes(style)) return;

    set({ blockStyle: style });
    persist(get);
  },

  unlock: (style) => {
    const updated = unlockStyle(get().unlocked, style);

    // null significa que ya estaba desbloqueado: no hay nada que avisar.
    if (!updated) return;

    set({ unlocked: updated, justUnlocked: style });
  },

  clearJustUnlocked: () => set({ justUnlocked: null }),
}));

/** Vuelca los ajustes actuales a localStorage. */
function persist(get: () => SettingsStore): void {
  const { sound, ghost, keys, blockStyle } = get();
  saveSettings({ sound, ghost, keys, blockStyle });
}