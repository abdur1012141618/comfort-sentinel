x
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteCommonjs } from 'vite-plugin-commonjs' // <-- নতুন ইমপোর্ট

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    viteCommonjs() // <-- নতুন প্লাগইন যোগ করা হয়েছে
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src'),
      // পূর্বের সব alias অপশন সরিয়ে দেওয়া হয়েছে
    },
  },
  // পূর্বের build সেকশনটি সম্পূর্ণভাবে সরিয়ে দেওয়া হয়েছে
})
