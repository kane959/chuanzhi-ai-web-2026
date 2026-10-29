import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages publishes the app below /<repository>/; relative assets work on both Pages and Vercel.
  base: './',
  server: { port: 5173, host: '0.0.0.0', proxy: { '/api': 'http://127.0.0.1:8787' } },
})
