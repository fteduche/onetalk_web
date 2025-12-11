import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Use a permissive policy so preview/proxy hosts (e.g. Render) can connect.
        allowedHosts: true,
        headers: {
          // Security headers
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        }
      },
      plugins: [react()],
      build: {
        // Enable minification and tree-shaking
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
          },
        },
        // Enable source maps for debugging but separate them
        sourcemap: mode !== 'production',
      },
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
