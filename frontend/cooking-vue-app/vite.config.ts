import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Le frontend appelle l'API en relatif : en dev (et en preview, qui reprend
  // cette config), on relaie vers le backend local. En prod, c'est nginx.
  server: {
    proxy: {
      '/data': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
})
