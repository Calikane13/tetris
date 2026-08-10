// Corona del marcador de récord (requisito V18).
//
// SVG en línea, no una imagen ni un emoji: la constitución prohíbe los assets
// externos (restricción C3), y un emoji se dibuja distinto en cada sistema.
//
// Usa currentColor, así que hereda el color del texto que lo rodea y no hay que
// pasarle ningún color desde fuera.

export function CrownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.5l3.6 2.7L12 4l5.4 7.2L21 8.5l-1.8 9.2H4.8L3 8.5z" />
      <rect x="4.8" y="18.4" width="14.4" height="2.2" rx="0.6" />
    </svg>
  );
}
