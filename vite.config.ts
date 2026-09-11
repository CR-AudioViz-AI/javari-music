import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Public variables only: VITE_* and NEXT_PUBLIC_* (the names this Vercel project uses).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
