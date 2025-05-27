import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/flex-explorer/', // e.g., '/axle-flex-explorer/'
  plugins: [react()],
})

