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
    rollupOptions: {
      // এই অংশটি যোগ করুন
      external: [
        'lucide-react',
        'date-fns',
        '@radix-ui/react-slot',
        'class-variance-authority',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-dropdown-menu',
        'clsx',
        'tailwind-merge'
      ],
    }
  }
})
