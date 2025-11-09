import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path' // <--- এই লাইনটি যোগ করুন

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  // এই resolve অপশনটি যোগ করুন
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <--- এই লাইনটি যোগ করুন
    },
  },
  // আপনার build অপশনটি যেমন আছে তেমনই থাকবে
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
