// Efectos de sonido generados con osciladores, sin ningún archivo de audio
// (restricción C3 de la constitución).
//
// Dos detalles que condicionan todo este archivo:
//
// 1. Los navegadores bloquean el audio hasta que el usuario interactúa con la
//    página. Por eso el AudioContext se crea de forma perezosa, en la primera
//    llamada, que siempre viene de una pulsación.
//
// 2. Un oscilador solo se puede arrancar una vez. Se crea uno nuevo por cada
//    sonido y se descarta; es la forma correcta de usar esta API, no un
//    derroche.

let context: AudioContext | null = null;

/** Devuelve el contexto de audio, creándolo si hace falta. */
function getContext(): AudioContext | null {
  if (context) return context;

  try {
    context = new AudioContext();
    return context;
  } catch {
    // Si el navegador no lo permite, el juego sigue: simplemente sin sonido.
    return null;
  }
}

/**
 * Reproduce una nota corta.
 *
 * @param frequency  Frecuencia en hercios.
 * @param duration   Duración en segundos.
 * @param delay      Retraso desde ahora, para encadenar notas.
 * @param type       Forma de onda. 'square' suena retro; 'sine' más suave.
 * @param volume     Volumen de 0 a 1.
 */
function beep(
  frequency: number,
  duration: number,
  delay = 0,
  type: OscillatorType = 'square',
  volume = 0.08,
): void {
  const ctx = getContext();
  if (!ctx) return;

  // Si el contexto quedó suspendido (pestaña en segundo plano), se reanuda.
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const start = ctx.currentTime + delay;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  // Envolvente: subida casi instantánea y caída exponencial. Sin esto, el
  // sonido empieza y acaba con un chasquido muy desagradable.
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration);
}

/**
 * Los efectos del juego.
 *
 * Quien llama decide si suena o no consultando los ajustes; este módulo no
 * conoce el store, para no acoplar el audio al estado de la aplicación.
 */
export const sfx = {
  move: () => beep(180, 0.04),
  rotate: () => beep(320, 0.05),
  lock: () => beep(110, 0.08, 0, 'square', 0.1),
  hardDrop: () => beep(90, 0.1, 0, 'square', 0.12),

  /** Dos notas ascendentes; con cuatro líneas, tres notas y más volumen. */
  clear: (count: number) => {
    beep(520, 0.09, 0, 'sine', 0.12);
    beep(660, 0.09, 0.08, 'sine', 0.12);
    if (count === 4) {
      beep(880, 0.14, 0.16, 'sine', 0.14);
    }
  },

  levelUp: () => {
    beep(440, 0.1, 0, 'sine', 0.12);
    beep(560, 0.1, 0.09, 'sine', 0.12);
    beep(700, 0.16, 0.18, 'sine', 0.12);
  },

  gameOver: () => {
    beep(300, 0.16, 0, 'sine', 0.12);
    beep(220, 0.16, 0.15, 'sine', 0.12);
    beep(140, 0.32, 0.3, 'sine', 0.12);
  },
};