import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  // এই অংশটি যোগ করুন
  optimizeDeps: {
    include: ['i18next-browser-languagedetector'],
  },
})
