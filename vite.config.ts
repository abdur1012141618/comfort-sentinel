// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Supabase Auth UI এর সমস্যা সমাধানের জন্য optimizeDeps যোগ করা হলো
  optimizeDeps: {
    include: [
      '@supabase/auth-ui-react',
      '@supabase/auth-ui-shared',
    ],
  },
});
