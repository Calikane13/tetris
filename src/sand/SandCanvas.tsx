// Dibujo del tablero de arena (v5, requisitos A4 y A5).
//
// Con canvas y no con divs. 3.200 granos como elementos del DOM obligarían a
// React a reconciliar miles de nodos en cada fotograma; en canvas son 3.200
// rectángulos en un bucle, que es exactamente para lo que sirve.
//
// El precio es que canvas no entiende CSS: los colores tienen que darse en
// hexadecimal, así que hay un mapa propio en constants.ts. Es duplicación
// respecto a los estilos del juego clásico, y se acepta porque son técnicas de
// dibujo distintas.

import { useEffect, useRef } from 'react';
import {
  DANGER_ROW,
  EMPTY,
  GRAINS_PER_CELL,
  SAND_COLORS,
  SAND_COLS,
  SAND_ROWS,
} from './constants';
import { index, type SandGrid } from './grid';
import { getCells } from '../engine/tetrominoes';
import type { ActivePiece } from '../engine/types';

interface SandCanvasProps {
  grid: SandGrid;
  /** Pieza que todavía no se ha desmoronado, o null. */
  active: ActivePiece | null;
  /** Color de la pieza activa. */
  activeColor: number;
  /** Granos que se están iluminando antes de desaparecer, o null. */
  flashing?: Uint8Array | null;
}

export function SandCanvas({ grid, active, activeColor, flashing }: SandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // El tamaño en pantalla lo decide el CSS a partir de --cell, que es el
    // mismo valor que usa el tablero clásico. Así los dos modos ocupan lo
    // mismo.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // Sin esto, en pantallas de alta densidad el canvas se ve borroso: el
    // navegador estira una imagen pequeña.
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const grainW = cssWidth / SAND_COLS;
    const grainH = cssHeight / SAND_ROWS;

    // Fondo.
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Los granos. Se dibuja un poco más grande que el grano (el +1) para que no
    // queden líneas de fondo entre rectángulos por el redondeo de píxeles.
    for (let row = 0; row < SAND_ROWS; row++) {
      for (let col = 0; col < SAND_COLS; col++) {
        const value = grid[index(row, col)];
        if (value === EMPTY) continue;

        const isFlashing = flashing ? flashing[index(row, col)] === 1 : false;

        ctx.fillStyle = isFlashing ? '#ffffff' : SAND_COLORS[value];
        ctx.fillRect(col * grainW, row * grainH, grainW + 1, grainH + 1);
      }
    }

    // La pieza activa, que todavía es un bloque rígido en la rejilla gruesa.
    // Cada uno de sus bloques ocupa GRAINS_PER_CELL granos por lado.
    if (active) {
      ctx.fillStyle = SAND_COLORS[activeColor];

      for (const cell of getCells(active.type, active.rotation)) {
        const cellRow = active.row + cell.row;
        const cellCol = active.col + cell.col;

        if (cellRow < 0) continue;

        ctx.fillRect(
          cellCol * GRAINS_PER_CELL * grainW,
          cellRow * GRAINS_PER_CELL * grainH,
          GRAINS_PER_CELL * grainW + 1,
          GRAINS_PER_CELL * grainH + 1,
        );
      }
    }

    // La línea roja del límite (requisito A5).
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, DANGER_ROW * grainH);
    ctx.lineTo(cssWidth, DANGER_ROW * grainH);
    ctx.stroke();
  }, [grid, active, activeColor, flashing]);

  return (
    <canvas
      ref={canvasRef}
      // Decorativo para el lector de pantalla: el estado se anuncia en texto
      // desde LiveRegion, igual que en el tablero clásico.
      aria-hidden="true"
      className="border-2 border-slate-700"
      style={{
        width: `calc(var(--cell) * 10)`,
        height: `calc(var(--cell) * 20)`,
      }}
    />
  );
}