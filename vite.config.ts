import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
    hmr: true,
    allowedHosts: ['*'],
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
})
