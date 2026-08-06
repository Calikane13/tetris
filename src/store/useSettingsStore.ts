// Store de los ajustes, separado del de la partida.
//
// Van aparte porque tienen ciclos de vida distintos: la partida se reinicia
// constantemente, los ajustes sobreviven a todo. Mezclarlos obligaría a
// acordarse de preservar los ajustes en cada startGame().

import { create } from 'zustand';
import type { Action, Settings } from '../storage/settings';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../storage/settings';

interface SettingsStore extends Settings {
  toggleSound: () => void;
  toggleGhost: () => void;
  setKey: (action: Action, code: string) => void;
  resetKeys: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadSettings(),

  toggleSound: () => {
    const next = !get().sound;
    set({ sound: next });
    persist(get);
  },

  toggleGhost: () => {
    const next = !get().ghost;
    set({ ghost: next });
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
}));

/** Vuelca los ajustes actuales a localStorage. */
function persist(get: () => SettingsStore): void {
  const { sound, ghost, keys } = get();
  saveSettings({ sound, ghost, keys });
}