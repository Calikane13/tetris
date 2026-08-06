// Mejor puntuación histórica (regla R40).

import {
  hasValidVersion,
  readJson,
  STORAGE_KEYS,
  STORAGE_VERSION,
  writeJson,
} from './safeStorage';

/** Lee la mejor puntuación guardada. Devuelve 0 si no hay nada válido. */
export function loadBestScore(): number {
  const data = readJson(STORAGE_KEYS.best);

  if (!hasValidVersion(data)) return 0;

  const best = data.best;

  // Se comprueba el tipo aunque venga de nuestro propio código: el usuario
  // puede haber editado localStorage a mano, y un NaN aquí contaminaría el HUD.
  if (typeof best !== 'number' || !Number.isFinite(best) || best < 0) {
    return 0;
  }

  return best;
}

/** Guarda la puntuación si supera a la anterior. Devuelve la mejor resultante. */
export function saveBestScore(score: number): number {
  const current = loadBestScore();

  if (score <= current) return current;

  writeJson(STORAGE_KEYS.best, { v: STORAGE_VERSION, best: score });
  return score;
}