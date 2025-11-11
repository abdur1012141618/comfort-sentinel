// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  resolve: {
    alias: {
      '@': '/src',
      // এই লাইনটি যোগ করা হলো
      '@supabase/auth-ui-react': '@supabase/auth-ui-react',
    },
  },
  // optimizeDeps অংশটি মুছে দেওয়া হলো
});
