import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from 'rollup-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        commonjs({
          include: [
            'node_modules/lucide-react/**',
            'node_modules/date-fns/**',
            'node_modules/@radix-ui/react-slot/**',
            'node_modules/class-variance-authority/**',
            'node_modules/@radix-ui/react-scroll-area/**',
            'node_modules/@radix-ui/react-dropdown-menu/**',
            'node_modules/clsx/**',
            'node_modules/tailwind-merge/**'
          ]
        })
      ]
    }
  }
})
