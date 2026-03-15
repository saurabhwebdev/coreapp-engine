import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:44305',
        changeOrigin: true,
        secure: false,
      },
      '/connect': {
        target: 'https://localhost:44305',
        changeOrigin: true,
        secure: false,
      },
      '/signalr': {
        target: 'https://localhost:44305',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
