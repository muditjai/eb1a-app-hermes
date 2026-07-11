import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/feedback/' : '/',
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        feedback: 'feedback/index.html',
      },
    },
  },
  plugins: [
    {
      name: 'feedback-dev-route',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const devRequest = request as { url?: string };

          if (devRequest.url === '/feedback') {
            devRequest.url = '/feedback/';
          }

          next();
        });
      },
    },
    react(),
  ],
}));
