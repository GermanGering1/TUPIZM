import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Все запросы, начинающиеся с /api, идут на Flask
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})