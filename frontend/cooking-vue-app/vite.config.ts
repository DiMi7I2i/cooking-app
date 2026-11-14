import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// HTTPS de dev, ouvert au réseau local, pour tester depuis un téléphone
// (le partage natif de fichiers exige HTTPS hors localhost).
// Activé seulement par `npm run dev:https` ; certificat créé par scripts/dev-https-cert.sh
function devHttps() {
  if (!process.env.DEV_HTTPS) return undefined
  const dir = fileURLToPath(new URL('./.certs', import.meta.url))
  const key = `${dir}/dev.key`
  const cert = `${dir}/dev.crt`
  if (!existsSync(key) || !existsSync(cert)) {
    throw new Error(
      `Certificat HTTPS de dev introuvable dans ${dir}. Lancer d'abord : scripts/dev-https-cert.sh`
    )
  }
  return { key: readFileSync(key), cert: readFileSync(cert) }
}

const https = devHttps()

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
    https,
    host: https ? true : undefined,
    proxy: {
      '/data': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
})
