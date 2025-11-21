x
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
  build: {
    // এই অপশনটি Rollup-কে বলে যে এই প্যাকেজগুলিকে CommonJS মডিউল হিসাবে বিবেচনা করতে হবে
    commonjsOptions: {
      include: [
        /node_modules/,
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
  },
})
