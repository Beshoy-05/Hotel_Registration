import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://hotel-booking.runasp.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
