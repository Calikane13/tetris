// Acceso a localStorage a prueba de fallos (principio P11).
//
// localStorage puede fallar por varios motivos: modo privado en algunos
// navegadores, cuota llena, o permisos bloqueados. Y lo que hay guardado puede
// estar corrupto o ser de una versión anterior del juego.
//
// La regla es que ninguna de esas situaciones puede tumbar la aplicación. Ante
// la duda, se devuelve null y quien llama usa sus valores por defecto.

/** Nombres de las claves. Se agrupan aquí para no repetir literales sueltos. */
export const STORAGE_KEYS = {
  /** Récord único de la v1 a la v3. Se conserva solo para poder migrarlo. */
  best: 'bloques:best',
  /** Marcas por modo, desde la v4. */
  records: 'bloques:records',
  save: 'bloques:save',
  settings: 'bloques:settings',
  /** Estilos de bloque desbloqueados, desde la v4. */
  unlocks: 'bloques:unlocks',
} as const;

/** Versión del formato guardado. Si cambia, lo antiguo se descarta. */
export const STORAGE_VERSION = 1;

/**
 * Versión del formato de récords.
 *
 * Va aparte de STORAGE_VERSION porque los récords cambiaron de forma en la v4
 * y el resto de claves no. Subir la versión general obligaría a descartar
 * ajustes y partidas que siguen siendo válidos.
 */
export const RECORDS_VERSION = 2;

/**
 * Lee y convierte un valor guardado.
 * Devuelve null si no existe, si no es JSON válido o si localStorage falla.
 */
export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Guarda un valor.
 * Devuelve true si se pudo guardar. Un false no es motivo para hacer nada
 * especial: el juego sigue igual, simplemente no se recordará.
 */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Borra una clave. Silencioso si falla. */
export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // No hay nada sensato que hacer aquí.
  }
}

/** Comprueba que un valor guardado es un objeto con la versión esperada. */
export function hasValidVersion(value: unknown, version = STORAGE_VERSION): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>).v === version
  );
}