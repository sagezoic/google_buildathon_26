import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // maplibre-gl 6 loads its web worker via import.meta.url; pre-bundling moves the main file and breaks that URL.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: {
    // Dev only: forward API calls to the local backend (`bun run dev` in backend/).
    proxy: { '/api': 'http://localhost:8080' },
  },
})
