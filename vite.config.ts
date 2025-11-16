import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // এটি অবশ্যই যোগ করতে হবে

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  resolve: {
    alias: {
      // এই লাইনটি যোগ করুন
      '@components': path.resolve(__dirname, './src/components'),
      // যদি আপনার @/locales ইমপোর্ট থাকে, তবে এটিও যোগ করুন:
      '@': path.resolve(__dirname, './src'),
    },
  },
})
