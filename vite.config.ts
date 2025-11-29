import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs' // এই লাইনটি রাখুন

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    commonjs({ // commonjs প্লাগইনটি রাখুন
      // কোনো কনফিগারেশন না দিয়ে ডিফল্ট রাখুন
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    // rollupOptions ব্লকটি সম্পূর্ণভাবে মুছে ফেলুন
  }
})
