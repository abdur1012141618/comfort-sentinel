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
    target: 'es2022',
    rollupOptions: {
      onwarn(warning, warn) {
        // lucide-react এর জন্য UNRESOLVED_IMPORT warning-টি দমন করুন
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message.includes('lucide-react')) {
          return;
        }
        // অন্যান্য warning-এর জন্য ডিফল্ট আচরণ বজায় রাখুন
        warn(warning);
      }
    }
  }
})
