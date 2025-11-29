import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

// সমস্যা সৃষ্টিকারী প্যাকেজগুলির তালিকা
const UNRESOLVED_PACKAGES = [
  'lucide-react',
  'date-fns',
  '@radix-ui/react-slot',
  'class-variance-authority',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-dropdown-menu',
  'clsx',
  'tailwind-merge'
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    commonjs() // commonjs প্লাগইনটি রাখুন
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
        // UNRESOLVED_IMPORT warning-টি দমন করুন যদি এটি সমস্যা সৃষ্টিকারী প্যাকেজগুলির মধ্যে একটি হয়
        if (warning.code === 'UNRESOLVED_IMPORT' && UNRESOLVED_PACKAGES.some(pkg => warning.message.includes(pkg))) {
          return;
        }
        // অন্যান্য warning-এর জন্য ডিফল্ট আচরণ বজায় রাখুন
        warn(warning);
      }
    }
  }
})
