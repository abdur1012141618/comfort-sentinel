import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  // এই build অপশনটি যোগ করুন
  build: {
    rollupOptions: {
      output: {
        // এই লাইনটি নিশ্চিত করবে যে জাভাস্ক্রিপ্ট ফাইলগুলি সঠিক এক্সটেনশন দিয়ে তৈরি হচ্ছে
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
