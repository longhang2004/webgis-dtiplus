import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      // Treat .geojson files as JSON ES modules
      name: 'geojson-loader',
      transform(code, id) {
        if (id.endsWith('.geojson')) {
          return { code: `export default ${code}`, map: null };
        }
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
