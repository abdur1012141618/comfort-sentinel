import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    commonjs({
      include: /node_modules/,
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022', // Top-Level Await সমস্যার সমাধান
    // **এখানে rollupOptions ব্লকটি আর থাকবে না**
  }
})
