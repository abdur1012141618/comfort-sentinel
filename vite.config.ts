import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  // এই অংশটি যোগ করুন
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react',
      'react-router-dom'
    ]
  },
  build: {
    commonjsOptions: {
      include: [
        /node_modules/
      ]
    }
  }
})
