import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs' // নতুন প্লাগইন ইমপোর্ট

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    // CommonJS প্লাগইন যোগ করা হয়েছে
    commonjs({
      // Vite-এর সাথে কাজ করার জন্য কিছু কনফিগারেশন
      include: /node_modules/,
      // যদি date-fns বা অন্য কোনো প্যাকেজ সমস্যা করে, তাহলে এখানে যোগ করুন
      // namedExports: {
      //   'node_modules/date-fns/index.js': ['format', 'parseISO'],
      // }
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  // build.rollupOptions.external অপশনটি সরিয়ে দেওয়া হয়েছে, কারণ CommonJS প্লাগইন এখন এটি হ্যান্ডেল করবে।
})
