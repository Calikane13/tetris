// Marcas por modo de juego (v4, requisitos M23 a M28).
//
// ATENCIÓN, lo más importante de este archivo: aquí vive el récord del jugador,
// y hasta la v3 estaba en otro formato. La migración tiene que ser correcta a
// la primera, porque una vez sobrescrito no hay forma de recuperarlo.
//
// Por eso la clave antigua NO se borra nunca. Ocupa unos pocos bytes y es la
// única red de seguridad que hay.

import {
  hasValidVersion,
  readJson,
  RECORDS_VERSION,
  STORAGE_KEYS,
  writeJson,
} from './safeStorage';

/** Los modos de juego. */
export type ModeId = 'classic' | 'sprint' | 'ultra' | 'fixed' | 'zero' | 'sand';

export interface Records {
  /** Mayor puntuación en modo clásico. */
  classic: number;
  /** Mayor puntuación en Ultra. */
  ultra: number;
  /** Menor tiempo en Sprint, en milisegundos. 0 significa sin marca. */
  sprint: number;
  /** Mayor puntuación por nivel de inicio en Nivel fijo. */
  fixed: Record<number, number>;
  /** Mayor puntuación en el modo arena (v5). */
  sand: number;
}

const EMPTY_RECORDS: Records = {
  classic: 0,
  ultra: 0,
  sprint: 0,
  fixed: {},
  sand: 0,
};

/** Comprueba que un valor es un número entero no negativo. */
function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Lee el récord del formato antiguo, el de la v1 a la v3.
 * Devuelve 0 si no hay nada válido.
 */
function readLegacyBest(): number {
  const data = readJson(STORAGE_KEYS.best);

  // El formato viejo usaba la versión general, que era 1.
  if (!hasValidVersion(data, 1)) return 0;

  const best = data.best;
  return isCount(best) ? best : 0;
}

/**
 * Lee las marcas de todos los modos.
 *
 * Si no hay marcas en el formato nuevo, intenta migrar desde el antiguo: el
 * récord único pasa a ser la marca del modo clásico, que es lo que era.
 *
 * Los campos que no existan se rellenan con 0 en lugar de invalidar el objeto
 * entero. Así, cuando la v5 añadió el modo arena, las marcas guardadas con la
 * v4 siguieron sirviendo sin tocar nada.
 */
export function loadRecords(): Records {
  const data = readJson(STORAGE_KEYS.records);

  if (hasValidVersion(data, RECORDS_VERSION)) {
    const fixed: Record<number, number> = {};

    // Se copia nivel a nivel en lugar de aceptar el objeto entero: un valor
    // corrupto en un nivel no debe invalidar los demás.
    if (typeof data.fixed === 'object' && data.fixed !== null) {
      for (const [level, score] of Object.entries(data.fixed)) {
        const parsedLevel = Number(level);
        if (Number.isInteger(parsedLevel) && isCount(score)) {
          fixed[parsedLevel] = score;
        }
      }
    }

    return {
      classic: isCount(data.classic) ? data.classic : 0,
      ultra: isCount(data.ultra) ? data.ultra : 0,
      sprint: isCount(data.sprint) ? data.sprint : 0,
      fixed,
      sand: isCount(data.sand) ? data.sand : 0,
    };
  }

  // No hay formato nuevo. Se busca el viejo.
  const legacy = readLegacyBest();

  const migrated: Records = { ...EMPTY_RECORDS, classic: legacy };

  // Solo se escribe si había algo que migrar. Si el jugador es nuevo, no hay
  // motivo para dejar un objeto vacío en localStorage.
  if (legacy > 0) {
    saveRecords(migrated);
  }

  return migrated;
}

/** Guarda todas las marcas de golpe. */
export function saveRecords(records: Records): void {
  writeJson(STORAGE_KEYS.records, { v: RECORDS_VERSION, ...records });
}

/**
 * Guarda una puntuación si supera a la marca del modo.
 * Devuelve las marcas resultantes.
 *
 * Vale para los modos donde mayor es mejor.
 */
export function saveScoreRecord(
  records: Records,
  mode: 'classic' | 'ultra' | 'sand',
  score: number,
): Records {
  if (score <= records[mode]) return records;

  const updated = { ...records, [mode]: score };
  saveRecords(updated);
  return updated;
}

/**
 * Guarda un tiempo de Sprint si es mejor que el anterior.
 *
 * Aquí menor es mejor, y el 0 significa "sin marca todavía", así que no puede
 * tratarse como un tiempo buenísimo.
 */
export function saveSprintRecord(records: Records, timeMs: number): Records {
  if (timeMs <= 0) return records;
  if (records.sprint > 0 && timeMs >= records.sprint) return records;

  const updated = { ...records, sprint: timeMs };
  saveRecords(updated);
  return updated;
}

/**
 * Guarda una puntuación de Nivel fijo, que lleva una marca por nivel de inicio
 * (requisito M25): empezar en el nivel 12 no tiene nada que ver con empezar en
 * el 2, y una marca conjunta no diría nada.
 */
export function saveFixedRecord(
  records: Records,
  startLevel: number,
  score: number,
): Records {
  const current = records.fixed[startLevel] ?? 0;
  if (score <= current) return records;

  const updated = {
    ...records,
    fixed: { ...records.fixed, [startLevel]: score },
  };
  saveRecords(updated);
  return updated;
}

/** La marca que se muestra en el menú para un modo dado. */
export function recordForMode(
  records: Records,
  mode: ModeId,
  startLevel = 1,
): number {
  switch (mode) {
    case 'classic':
      return records.classic;
    case 'ultra':
      return records.ultra;
    case 'sprint':
      return records.sprint;
    case 'sand':
      return records.sand;
    case 'fixed':
      return records.fixed[startLevel] ?? 0;
    case 'zero':
      // Cero gravedad no guarda marca (requisito M22).
      return 0;
  }
}