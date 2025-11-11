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
  // Vercel-এর জন্য অতিরিক্ত build বা optimizeDeps কনফিগারেশনের প্রয়োজন নেই
});
