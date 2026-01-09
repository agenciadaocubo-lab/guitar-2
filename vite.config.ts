
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo (development/production)
  // O terceiro argumento '' carrega todas as variáveis, não apenas as prefixadas com VITE_
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error in some environments.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Mapeia VITE_API_KEY para process.env.API_KEY para o SDK do Gemini
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      }
    }
  };
});
