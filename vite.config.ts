import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Security: Disable source maps in production to hide source code
    sourcemap: false,
    
    // Performance: Increase chunk size limit warning to reduce noise
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Optimization: Manually split huge vendor libraries into separate chunks
        // This improves browser caching (users don't re-download firebase when you change UI)
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split Firebase (usually the largest chunk)
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Split Recharts (charting library)
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Split React Core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Split Lucide Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // All other node_modules go to a generic vendor file
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true, // Allow LAN access for mobile testing
  },
});