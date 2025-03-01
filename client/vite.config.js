import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
});
