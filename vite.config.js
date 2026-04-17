import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://mernbackend-g2q9.onrender.com',
        changeOrigin: true
      }
    }
  }
})
