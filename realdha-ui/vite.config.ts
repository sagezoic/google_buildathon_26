import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev only: forward API calls to the local backend (`bun run dev` in backend/).
    proxy: { '/api': 'http://localhost:8080' },
  },
})
