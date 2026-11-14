import { defineConfig } from 'cypress'
import { readFile, rm } from 'node:fs/promises'
import { PDFParse } from 'pdf-parse'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    setupNodeEvents(on, config) {
      on('task', {
        // Vide le dossier des téléchargements (évite les « fichier (1).pdf »)
        async clearDownloads() {
          await rm(config.downloadsFolder, { recursive: true, force: true })
          return null
        },
        // Nombre d'images intégrées dans un PDF téléchargé
        async countPdfImages(path: string) {
          const parser = new PDFParse({ data: await readFile(path) })
          try {
            const result = await parser.getImage({ imageThreshold: 0 })
            return result.pages.reduce((n, page) => n + page.images.length, 0)
          } finally {
            await parser.destroy()
          }
        },
        // Extrait le texte d'un PDF téléchargé
        async readPdfText(path: string) {
          const parser = new PDFParse({ data: await readFile(path) })
          try {
            const result = await parser.getText()
            return result.text
          } finally {
            await parser.destroy()
          }
        },
      })
      return config
    },
  },
  component: {
    specPattern: 'src/**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  }
})
