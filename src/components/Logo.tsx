// Logo del juego (requisitos C21 a C25).
//
// Un cuadrado macizo de bloques de colores abajo, y una pieza T morada flotando
// arriba, a punto de caer. Cuenta la mecánica del juego en una sola imagen: hay
// algo construido y algo que va a encajar en ello.
//
// SVG dibujado aquí, no un archivo de imagen (restricción C3 de la
// constitución). Usa los colores de las piezas para que se reconozca como parte
// del mismo juego.
//
// El brillo de cada bloque es una elipse blanca semitransparente arriba a la
// izquierda: es lo que le da el aspecto de pieza física en lugar de cuadrado
// plano, y a 32 px sigue funcionando porque es una forma grande y suave.
//
// Ojo: este dibujo está duplicado en public/logo.svg, que es lo que carga el
// navegador como icono. No se puede unificar porque el icono se lee antes de
// que exista React. Si se cambia uno, hay que cambiar el otro.

interface LogoProps {
  /** Lado en píxeles. El dibujo es cuadrado. */
  size?: number;
  className?: string;
}

/** Un bloque del cuadrado, con su brillo. */
function Block({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <>
      <rect x={x} y={y} width="11" height="11" rx="2.5" fill={fill} />
      <ellipse
        cx={x + 3.5}
        cy={y + 3}
        rx="2.4"
        ry="1.4"
        fill="#ffffff"
        opacity="0.45"
      />
    </>
  );
}

/** Un bloque de la pieza T, en degradado morado. */
function TBlock({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="11" height="11" rx="2.5" fill="url(#logo-t)" />
      <ellipse
        cx={x + 3.5}
        cy={y + 3}
        rx="2.4"
        ry="1.4"
        fill="#ffffff"
        opacity="0.5"
      />
    </>
  );
}

export function Logo({ size = 64, className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Bloque a Bloque"
      className={className}
    >
      <defs>
        <linearGradient id="logo-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d5ff" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>

      {/* La pieza T, arriba y separada: está cayendo, no apoyada. */}
      <TBlock x={21} y={0} />
      <TBlock x={33} y={0} />
      <TBlock x={45} y={0} />
      <TBlock x={33} y={12} />

      {/* El cuadrado ya construido: dos filas de cuatro. */}
      <Block x={7} y={41} fill="#22d3ee" />
      <Block x={19} y={41} fill="#4ade80" />
      <Block x={31} y={41} fill="#fbbf24" />
      <Block x={43} y={41} fill="#fb923c" />
      <Block x={7} y={53} fill="#f87171" />
      <Block x={19} y={53} fill="#60a5fa" />
      <Block x={31} y={53} fill="#a3e635" />
      <Block x={43} y={53} fill="#c084fc" />
    </svg>
  );
}
