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
  // এই অপশনটি Vite-কে বলে যে এই CJS প্যাকেজগুলিকে প্রি-বান্ডিল করে নিতে হবে
  optimizeDeps: {
    include: [
      'lucide-react', 
      'date-fns', 
      '@radix-ui/react-slot', 
      'class-variance-authority',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-dropdown-menu',
      'clsx',
      'tailwind-merge'
    ],
  },
})
