import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Vite config - Mode:', mode);
  console.log('Vite config - Backend URL:', env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com');
  
  const backendUrl = env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';
  
  return {
    plugins: [tailwindcss(), react()],
    
    // Define environment variables to expose to the client
    define: {
      'process.env.MODE': JSON.stringify(mode),
      'process.env.BACKEND_URL': JSON.stringify(backendUrl)
    },
    
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
      },
    },
    
    // For better error messages in development
    build: {
      sourcemap: mode !== 'production'
    }
  }
});