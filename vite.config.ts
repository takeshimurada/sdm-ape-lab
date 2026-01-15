import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        allowedHosts: [
          '.sandbox.novita.ai',
          'localhost',
          '127.0.0.1'
        ],
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/uploads': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Vite automatically generates unique hashes when content changes
            entryFileNames: `assets/[name]-[hash].js`,
            chunkFileNames: `assets/[name]-[hash].js`,
            assetFileNames: `assets/[name]-[hash].[ext]`
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
