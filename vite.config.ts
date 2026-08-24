import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve el sitio en una subcarpeta con el nombre del
  // repositorio, no en la raíz del dominio. Sin esta base, el HTML pediría los
  // archivos a /assets/... en lugar de a /tetris/assets/..., no los
  // encontraría, y se vería una pantalla en blanco.
  //
  // Si algún día se despliega en un dominio propio o en Netlify, hay que
  // volver a poner '/'.
  base: '/tetris/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})