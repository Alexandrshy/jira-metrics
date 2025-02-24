import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react()
    ],
    server: {
      port: 3000,
      host: true,
      open: true,
      watch: {
        usePolling: true
      },
      proxy: {
        '/rest/api': {
          target: env.VITE_JIRA_HOST,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const auth = Buffer.from(`${env.VITE_JIRA_EMAIL}:${env.VITE_JIRA_API_TOKEN}`).toString('base64');
              proxyReq.setHeader('Authorization', `Basic ${auth}`);
            });
          }
        }
      }
    },
    build: {
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ['@swc/wasm-web']
    }
  };
}); 