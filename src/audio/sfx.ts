// Efectos de sonido generados con osciladores, sin ningún archivo de audio
// (restricción C3 de la constitución).
//
// Los de la v1 eran ondas cuadradas: sonaban a consola de los ochenta y
// cansaban al oírse decenas de veces por partida. Tres cambios los suavizan
// (v4, requisitos M33 a M37):
//
//   1. Ondas 'sine' y 'triangle' en lugar de 'square'. Es lo que más cambia:
//      la cuadrada tiene muchos armónicos agudos y por eso pincha.
//   2. Ataque más lento, de 10 a 25 ms, que quita el chasquido del inicio.
//   3. Un filtro paso bajo que recorta lo que quede de agudos.
//
// Y el volumen general baja: mover y rotar suenan constantemente y son los que
// más cansan.
//
// Dos detalles que condicionan todo este archivo:
//
//   - Los navegadores bloquean el audio hasta que el usuario interactúa con la
//     página. Por eso el AudioContext se crea de forma perezosa, en la primera
//     llamada, que siempre viene de una pulsación.
//   - Un oscilador solo se puede arrancar una vez. Se crea uno nuevo por cada
//     sonido y se descarta; es la forma correcta de usar esta API.

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

interface ToneOptions {
  /** Frecuencia en hercios. */
  freq: number;
  /** Duración en segundos. */
  duration: number;
  /** Retraso desde ahora, para encadenar notas. */
  delay?: number;
  /** Forma de onda. */
  type?: OscillatorType;
  /** Volumen de 0 a 1. */
  volume?: number;
  /** Corte del filtro paso bajo, en hercios. */
  cutoff?: number;
  /** Frecuencia final, si se quiere un deslizamiento de tono. */
  slideTo?: number;
}

/**
 * Reproduce una nota corta y suave.
 *
 * La cadena es oscilador → filtro → ganancia → salida. El filtro es lo que
 * separa un sonido agradable de un pitido: recorta los agudos que hacen que un
 * tono corto suene a chasquido.
 */
function tone({
  freq,
  duration,
  delay = 0,
  type = 'sine',
  volume = 0.06,
  cutoff = 2000,
  slideTo,
}: ToneOptions): void {
  const ctx = getContext();
  if (!ctx) return;

  // Si el contexto quedó suspendido (pestaña en segundo plano), se reanuda.
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const start = ctx.currentTime + delay;
  const end = start + duration;

  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);

  // Deslizamiento de tono, para los sonidos que "caen" o "suben".
  if (slideTo !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, end);
  }

  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  // Q bajo: un filtro suave, sin resonancia que vuelva a meter carácter agudo.
  filter.Q.value = 0.7;

  // Envolvente: ataque de 25 ms y caída exponencial. Sin el ataque, el sonido
  // empieza de golpe y se oye un chasquido.
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

/**
 * Los efectos del juego.
 *
 * Quien llama decide si suena o no consultando los ajustes; este módulo no
 * conoce el store, para no acoplar el audio al estado de la aplicación.
 */
export const sfx = {
   /** Corto y discreto, pero audible: se oye cientos de veces por partida. */
  move: () => tone({ freq: 380, duration: 0.06, volume: 0.07, cutoff: 2000 }),

  rotate: () =>
    tone({ freq: 520, duration: 0.07, type: 'triangle', volume: 0.08, cutoff: 2400 }),

  /** Golpe al apoyar la pieza. Cae de tono para dar sensación de peso. */
  lock: () =>
    tone({ freq: 330, duration: 0.14, volume: 0.13, cutoff: 1800, slideTo: 220 }),

  /** Como el anterior pero más rotundo, porque la caída fue intencionada. */
  hardDrop: () =>
    tone({ freq: 300, duration: 0.18, volume: 0.16, cutoff: 1800, slideTo: 170 }),
  /** Dos notas ascendentes; con cuatro líneas, una tercera más aguda. */
  clear: (count: number) => {
    tone({ freq: 523, duration: 0.16, volume: 0.055, cutoff: 2600 });
    tone({ freq: 659, duration: 0.18, delay: 0.09, volume: 0.055, cutoff: 2600 });
    if (count === 4) {
      tone({ freq: 880, duration: 0.28, delay: 0.19, volume: 0.06, cutoff: 3000 });
    }
  },

  /** Arpegio de tres notas, claramente distinto del de línea. */
  levelUp: () => {
    tone({ freq: 440, duration: 0.16, volume: 0.05, cutoff: 2400 });
    tone({ freq: 587, duration: 0.16, delay: 0.1, volume: 0.05, cutoff: 2400 });
    tone({ freq: 784, duration: 0.32, delay: 0.2, volume: 0.055, cutoff: 2600 });
  },

  /** Tono descendente, largo y apagado. */
  gameOver: () => {
    tone({ freq: 392, duration: 0.3, volume: 0.055, cutoff: 1200, slideTo: 262 });
    tone({ freq: 262, duration: 0.6, delay: 0.28, volume: 0.05, cutoff: 900, slideTo: 165 });
  },
};