import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 5173,
    hmr: {
      // Improved HMR for Docker environment
      clientPort: 443,
      protocol: 'wss',
      // Force full reload on router configuration changes
      path: '/__vite_hmr',
      timeout: 5000,
    },
    watch: {
      // More aggressive watching for Docker environment
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
