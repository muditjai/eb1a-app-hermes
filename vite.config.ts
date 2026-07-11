import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/feedback/',
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        feedback: 'feedback/index.html',
      },
    },
  },
  plugins: [react()],
});
