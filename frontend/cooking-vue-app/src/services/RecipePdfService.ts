import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { Recipe } from '@/types/recipe'
import { CategoryLabels, Category } from '@/enums/category'
import { DifficultyLabels, Difficulty } from '@/enums/difficulty'
import { CostLabels, Cost } from '@/enums/cost'
import { formatQuantity } from '@/utils/servings'

const TEAL = '#0f766e'
const MUTED = '#64748b'
const BORDER = '#e2e8f0'

type PdfMake = typeof import('pdfmake/build/pdfmake')

let pdfMakePromise: Promise<PdfMake> | null = null

/** Charge pdfmake et sa police à la demande (hors du bundle principal). */
export function loadPdfMake(): Promise<PdfMake> {
  if (!pdfMakePromise) {
    pdfMakePromise = Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts')
    ])
      .then(([pdfMakeModule, vfsModule]) => {
        const pdfMake = ((pdfMakeModule as { default?: PdfMake }).default ??
          pdfMakeModule) as PdfMake
        const vfs = (vfsModule as { default?: unknown }).default ?? vfsModule
        pdfMake.addVirtualFileSystem(vfs as Parameters<PdfMake['addVirtualFileSystem']>[0])
        return pdfMake
      })
      .catch((e) => {
        pdfMakePromise = null
        throw e
      })
  }
  return pdfMakePromise
}

/** « Pad Thaï » → « pad-thai.pdf » */
export function pdfFileName(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'recette'}.pdf`
}

/** Photo de la recette en JPEG (pdfmake ne lit ni le WebP ni les URL distantes). */
async function loadThumbnail(url: string | undefined): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const bitmap = await createImageBitmap(await res.blob())
    const maxWidth = 1000
    const scale = Math.min(1, maxWidth / bitmap.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null
  }
}

function durationBox(label: string, minutes: number, highlight = false): Content {
  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            stack: [
              { text: label.toUpperCase(), fontSize: 8, color: MUTED, characterSpacing: 0.5 },
              {
                text: `${minutes} min`,
                fontSize: 14,
                bold: true,
                color: highlight ? TEAL : '#1e293b'
              }
            ],
            fillColor: highlight ? '#f0fdfa' : '#f1f5f9',
            margin: [6, 5, 6, 5]
          }
        ]
      ]
    },
    layout: 'noBorders'
  }
}

export function buildRecipeDocument(
  recipe: Recipe,
  servings: number,
  thumbnail: string | null
): TDocumentDefinitions {
  const meta = [
    CategoryLabels[recipe.categoryCode as Category],
    DifficultyLabels[recipe.difficultyCode as Difficulty],
    CostLabels[recipe.costCode as Cost]
  ]
    .filter(Boolean)
    .join(' · ')

  const durations: Content[] = []
  const total =
    (recipe.preparationDuration || 0) + (recipe.cookDuration || 0) + (recipe.breakDuration || 0)
  if (total) durations.push(durationBox('Total', total, true))
  if (recipe.preparationDuration)
    durations.push(durationBox('Préparation', recipe.preparationDuration))
  if (recipe.cookDuration) durations.push(durationBox('Cuisson', recipe.cookDuration))
  if (recipe.breakDuration) durations.push(durationBox('Repos', recipe.breakDuration))

  const ingredients = (recipe.ingredients || []).filter((i) => i != null)
  const steps = recipe.steps || []

  const ingredientRows = ingredients.map((ing) => {
    let qty = ''
    if (ing.quantity) {
      qty = formatQuantity(ing.quantity, !!ing.unit, recipe.servings, servings)
      if (ing.unit) qty += ` ${ing.unit}`
    }
    return [
      { text: ing.name, fontSize: 10 },
      { text: qty, fontSize: 10, color: MUTED, alignment: 'right' as const, noWrap: true }
    ]
  })

  const leftColumn: Content[] = []
  if (ingredients.length) {
    leftColumn.push(
      { text: 'Ingrédients', fontSize: 13, bold: true, color: TEAL, margin: [0, 0, 0, 2] },
      {
        text: `Pour ${servings} personne${servings > 1 ? 's' : ''}`,
        fontSize: 9,
        color: MUTED,
        margin: [0, 0, 0, 6]
      },
      {
        table: { widths: ['*', 'auto'], body: ingredientRows },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => BORDER,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      }
    )
  }

  const rightColumn: Content[] = []
  if (steps.length) {
    rightColumn.push({
      text: 'Étapes',
      fontSize: 13,
      bold: true,
      color: TEAL,
      margin: [0, 0, 0, 8]
    })
    steps.forEach((step, index) => {
      rightColumn.push({
        columns: [
          {
            width: 20,
            table: {
              widths: [12],
              body: [
                [
                  {
                    text: String(index + 1),
                    bold: true,
                    fontSize: 9,
                    color: '#ffffff',
                    alignment: 'center',
                    fillColor: TEAL
                  }
                ]
              ]
            },
            layout: 'noBorders'
          },
          { width: '*', text: step, fontSize: 10, lineHeight: 1.3 }
        ],
        columnGap: 6,
        margin: [0, 0, 0, 8]
      })
    })
  }

  const content: Content[] = [
    {
      columns: [
        { text: 'COOKING APP', fontSize: 9, bold: true, color: TEAL, characterSpacing: 1 },
        { text: meta, fontSize: 9, color: MUTED, alignment: 'right' }
      ]
    },
    {
      canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 2, lineColor: '#14b8a6' }],
      margin: [0, 0, 0, 14]
    },
    { text: recipe.title, fontSize: 24, bold: true, margin: [0, 0, 0, 6] }
  ]

  if (recipe.description) {
    content.push({
      text: recipe.description,
      fontSize: 10,
      color: '#475569',
      lineHeight: 1.3,
      margin: [0, 0, 0, 12]
    })
  }

  if (thumbnail) {
    // Photo à gauche, durées en grille 2 × 2 à droite
    const rows: Content[] = []
    for (let i = 0; i < durations.length; i += 2) {
      rows.push({
        columns: [durations[i]!, durations[i + 1] ?? { text: '' }],
        columnGap: 6,
        margin: [0, 0, 0, 6]
      })
    }
    content.push({
      columns: [
        { image: thumbnail, fit: [230, 150], width: 230 },
        { width: '*', stack: rows }
      ],
      columnGap: 16,
      margin: [0, 0, 0, 16]
    })
  } else if (durations.length) {
    // Sans photo : les durées sur une seule ligne
    content.push({ columns: durations, columnGap: 6, margin: [0, 0, 0, 16] })
  }

  content.push({
    columns: [
      { width: 180, stack: leftColumn },
      { width: '*', stack: rightColumn }
    ],
    columnGap: 24
  })

  return {
    info: { title: recipe.title, creator: 'Cooking App' },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    defaultStyle: { font: 'Roboto', color: '#1e293b' },
    content,
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'Recette partagée depuis Cooking App', fontSize: 8, color: MUTED },
        {
          text: `Page ${currentPage} / ${pageCount}`,
          fontSize: 8,
          color: MUTED,
          alignment: 'right'
        }
      ],
      margin: [40, 20, 40, 0]
    })
  }
}

/** Génère le PDF d'une recette, quantités ajustées au nombre de personnes choisi. */
export async function buildRecipePdf(recipe: Recipe, servings: number): Promise<Blob> {
  const [pdfMake, thumbnail] = await Promise.all([loadPdfMake(), loadThumbnail(recipe.thumbnail)])
  return pdfMake.createPdf(buildRecipeDocument(recipe, servings, thumbnail)).getBlob()
}

/** Vrai si le navigateur sait partager un fichier PDF (feuille de partage native). */
export function canShareFiles(): boolean {
  if (typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') {
    return false
  }
  try {
    const probe = new File([''], 'test.pdf', { type: 'application/pdf' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

/**
 * Ouvre la feuille de partage native avec le PDF.
 * Renvoie false si l'utilisateur a annulé.
 */
export async function sharePdf(blob: Blob, fileName: string, title: string): Promise<boolean> {
  const file = new File([blob], fileName, { type: 'application/pdf' })
  try {
    await navigator.share({ files: [file], title })
    return true
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return false
    throw e
  }
}

export function downloadPdf(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
