import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/campus-admin-panel/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: false,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
