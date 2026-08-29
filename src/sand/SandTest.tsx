// PRUEBA TEMPORAL — Tarea S03.
//
// Comprueba que la física y el dibujo funcionan, antes de que exista el juego.
// Se borra en S04.
//
// Suelta granos de colores en la parte de arriba y deja que caigan. Lo que hay
// que verificar es que se forman LADERAS INCLINADAS y no columnas rectas: eso
// es lo que demuestra que el deslizamiento diagonal funciona.

import { useEffect, useRef, useState } from 'react';
import { GRAINS_PER_CELL, SAND_COLS } from './constants';
import { createGrid, set, type SandGrid } from './grid';
import { stepPhysics } from './physics';
import { SandCanvas } from './SandCanvas';

export function SandTest() {
  const [grid, setGrid] = useState<SandGrid>(() => createGrid());
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    let frame = 0;
    let tick = 0;

    const loop = () => {
      const next = new Uint8Array(gridRef.current);

      // Cada pocos fotogramas, suelta un bloque de granos en una columna al
      // azar. Con GRAINS_PER_CELL por lado, es como si cayera un trozo de
      // pieza.
      tick++;
      if (tick % 6 === 0) {
        const col = Math.floor(Math.random() * (SAND_COLS - GRAINS_PER_CELL));
        const color = 1 + Math.floor(Math.random() * 5);

        for (let r = 0; r < GRAINS_PER_CELL; r++) {
          for (let c = 0; c < GRAINS_PER_CELL; c++) {
            set(next, r, col + c, color);
          }
        }
      }

      stepPhysics(next);
      setGrid(next);

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-slate-400">
        Prueba de física (S03). Deben formarse laderas, no columnas.
      </p>
      <SandCanvas grid={grid} active={null} activeColor={1} />
      <button
        type="button"
        onClick={() => setGrid(createGrid())}
        className="rounded bg-slate-800 px-3 py-1 text-sm text-slate-200 hover:bg-slate-700"
      >
        Limpiar
      </button>
    </div>
  );
}