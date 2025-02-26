import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [  tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
