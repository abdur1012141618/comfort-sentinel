import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteCommonjs } from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    viteCommonjs({
      include: [
        'lucide-react',
        'date-fns',
        '@radix-ui/react-slot',
        'class-variance-authority',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-dropdown-menu',
        'clsx',
        'tailwind-merge'
      ]
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
