import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(new URL('./src', import.meta.url).pathname),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/backend/**', '**/*.timestamp-*.mjs'],
    },
  },
})
