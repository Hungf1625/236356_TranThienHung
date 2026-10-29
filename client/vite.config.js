import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api-236356.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    allowedHosts: ['web-236356.onrender.com'],
  },
})
