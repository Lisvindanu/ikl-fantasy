import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@tanstack')) return 'vendor-router';
          if (id.includes('framer-motion')) return 'vendor-motion';
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://hokapi.project-n.site',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: { '.project-n.site': 'localhost' },
      },
    },
  },
})
