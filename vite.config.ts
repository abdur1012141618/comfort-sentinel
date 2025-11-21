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
      // এই লাইনটি যোগ করা হয়েছে: Rollup-কে lucide-react খুঁজে পেতে সাহায্য করবে
      'lucide-react': path.resolve(__dirname, './node_modules/lucide-react'),
    },
  },
  // build সেকশনটি সরিয়ে দেওয়া হয়েছে
})
