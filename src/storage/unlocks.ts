// Estilos de bloque desbloqueados (v4, requisitos M40, M41, M45).
//
// Clave aparte de los récords porque se consulta cada vez que se abre el panel
// de ajustes y al terminar cada partida, mientras que los récords solo se leen
// al arrancar. Separarlos evita reescribir un objeto grande para cambiar un
// dato pequeño.

import type { StyleId } from '../engine/blockStyles';
import { FREE_STYLES, STYLE_ORDER } from '../engine/blockStyles';
import {
  hasValidVersion,
  readJson,
  STORAGE_KEYS,
  STORAGE_VERSION,
  writeJson,
} from './safeStorage';

/** Umbral de puntuación en Clásico que desbloquea Neón (requisito M40). */
export const NEON_SCORE = 10000;

/** Comprueba que un valor es un identificador de estilo conocido. */
function isStyleId(value: unknown): value is StyleId {
  return typeof value === 'string' && (STYLE_ORDER as readonly string[]).includes(value);
}

/**
 * Lee los estilos desbloqueados.
 *
 * Los estilos libres se añaden siempre, aunque no estén guardados: así no hace
 * falta escribir nada en localStorage la primera vez que alguien abre el juego.
 */
export function loadUnlocks(): StyleId[] {
  const data = readJson(STORAGE_KEYS.unlocks);

  if (!hasValidVersion(data) || !Array.isArray(data.styles)) {
    return [...FREE_STYLES];
  }

  const saved = data.styles.filter(isStyleId);

  // Set para no duplicar si alguno de los libres estuviera también guardado.
  return [...new Set([...FREE_STYLES, ...saved])];
}

/** Guarda la lista de estilos desbloqueados. */
export function saveUnlocks(styles: StyleId[]): void {
  writeJson(STORAGE_KEYS.unlocks, { v: STORAGE_VERSION, styles });
}

/**
 * Desbloquea un estilo si no lo estaba ya.
 * Devuelve la lista nueva, o null si no había nada que desbloquear.
 *
 * El null es lo que permite a quien llama saber si tiene que avisar en pantalla
 * sin comparar listas.
 */
export function unlockStyle(current: StyleId[], style: StyleId): StyleId[] | null {
  if (current.includes(style)) return null;

  const updated = [...current, style];
  saveUnlocks(updated);
  return updated;
}