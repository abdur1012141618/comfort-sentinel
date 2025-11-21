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
      // সমস্ত সমস্যা সৃষ্টিকারী প্যাকেজের জন্য alias যোগ করা হয়েছে
      'lucide-react': path.resolve(__dirname, './node_modules/lucide-react'),
      'date-fns': path.resolve(__dirname, './node_modules/date-fns'),
      '@radix-ui/react-slot': path.resolve(__dirname, './node_modules/@radix-ui/react-slot'),
      'class-variance-authority': path.resolve(__dirname, './node_modules/class-variance-authority'),
      '@radix-ui/react-scroll-area': path.resolve(__dirname, './node_modules/@radix-ui/react-scroll-area'),
      '@radix-ui/react-dropdown-menu': path.resolve(__dirname, './node_modules/@radix-ui/react-dropdown-menu'),
      'clsx': path.resolve(__dirname, './node_modules/clsx'),
      'tailwind-merge': path.resolve(__dirname, './node_modules/tailwind-merge'),
    },
  },
})
