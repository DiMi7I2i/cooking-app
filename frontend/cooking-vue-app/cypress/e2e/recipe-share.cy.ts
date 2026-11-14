// Partage d'une recette en PDF depuis l'écran de détail.
// Bureau : « Partager » ouvre un menu (Partager le PDF… si le navigateur sait
// partager un fichier, Télécharger le PDF toujours).
// Mobile : « Partager » ouvre directement le partage natif (ou télécharge).

const recipe = {
  _id: 'abc',
  id: 'abc',
  title: 'Pad Thaï',
  description: 'Nouilles sautées à la thaïlandaise',
  categoryCode: 'PLAT',
  difficultyCode: 'EASY',
  costCode: 'CHEAP',
  tags: [],
  servings: 4,
  preparationDuration: 20,
  cookDuration: 10,
  breakDuration: 0,
  steps: ['Faire tremper les nouilles.', 'Sauter le tout au wok.'],
  ingredients: [
    { name: 'Nouilles de riz', quantity: 200, unit: 'g' },
    { name: 'Œufs', quantity: 2 }
  ]
}

const pdfPath = () => `${Cypress.config('downloadsFolder')}/pad-thai.pdf`

type ShareStub = Cypress.Agent<sinon.SinonStub>

// Simule (ou retire) le partage de fichiers du navigateur
function visitRecipe(canShareFiles: boolean) {
  cy.visit('/recipes/abc', {
    onBeforeLoad(win) {
      if (canShareFiles) {
        Object.defineProperty(win.navigator, 'canShare', {
          configurable: true,
          value: cy.stub().as('canShare').returns(true)
        })
        Object.defineProperty(win.navigator, 'share', {
          configurable: true,
          value: cy.stub().as('share').resolves()
        })
      } else {
        Object.defineProperty(win.navigator, 'canShare', { configurable: true, value: undefined })
        Object.defineProperty(win.navigator, 'share', { configurable: true, value: undefined })
      }
    }
  })
  cy.contains('h1', 'Pad Thaï').should('be.visible')
}

function sharedFile(): Cypress.Chainable<File> {
  return cy
    .get<ShareStub>('@share')
    .should('have.been.calledOnce')
    .then((stub) => stub.firstCall.args[0].files[0] as File)
}

describe('Partage d’une recette en PDF', () => {
  beforeEach(() => {
    cy.task('clearDownloads')
    cy.intercept('GET', '**/data/recipes/abc', recipe)
  })

  describe('sur ordinateur', () => {
    beforeEach(() => cy.viewport(1280, 900))

    it('affiche un bouton « Partager » à côté de Modifier et Supprimer', () => {
      visitRecipe(false)
      cy.contains('button', 'Partager').should('be.visible')
      cy.contains('button', 'Modifier').should('be.visible')
    })

    it('propose seulement le téléchargement si le navigateur ne sait pas partager un fichier', () => {
      visitRecipe(false)
      cy.contains('button', 'Partager').click()
      cy.contains('Télécharger le PDF').should('be.visible')
      cy.contains('Partager le PDF').should('not.exist')
    })

    it('partage un fichier PDF nommé d’après la recette', () => {
      visitRecipe(true)
      cy.contains('button', 'Partager').click()
      cy.contains('Partager le PDF').click()
      sharedFile().then((file) => {
        expect(file.name).to.eq('pad-thai.pdf')
        expect(file.type).to.eq('application/pdf')
        expect(file.size).to.be.greaterThan(1000)
      })
    })

    it('télécharge un PDF contenant la recette', () => {
      visitRecipe(false)
      cy.contains('button', 'Partager').click()
      cy.contains('Télécharger le PDF').click()
      cy.readFile(pdfPath(), null, { timeout: 15000 }).should('exist')
      cy.task<string>('readPdfText', pdfPath()).then((text) => {
        expect(text).to.contain('Pad Thaï')
        expect(text).to.contain('Nouilles de riz')
        expect(text).to.contain('200 g')
        expect(text).to.contain('Pour 4 personnes')
        expect(text).to.contain('Faire tremper les nouilles.')
        expect(text).to.contain('Sauter le tout au wok.')
      })
    })

    it('intègre la photo de la recette', () => {
      cy.intercept('GET', '**/data/recipes/abc', { ...recipe, thumbnail: '/uploads/photo.png' })
      cy.intercept('GET', '**/uploads/photo.png', { fixture: 'recipe-photo.png' })
      visitRecipe(false)
      cy.contains('button', 'Partager').click()
      cy.contains('Télécharger le PDF').click()
      cy.readFile(pdfPath(), null, { timeout: 15000 }).should('exist')
      cy.task<number>('countPdfImages', pdfPath()).should('eq', 1)
    })

    it('génère le PDF même si la photo est introuvable', () => {
      cy.intercept('GET', '**/data/recipes/abc', { ...recipe, thumbnail: '/uploads/absente.png' })
      cy.intercept('GET', '**/uploads/absente.png', { statusCode: 404 })
      visitRecipe(false)
      cy.contains('button', 'Partager').click()
      cy.contains('Télécharger le PDF').click()
      cy.readFile(pdfPath(), null, { timeout: 15000 }).should('exist')
      cy.task<number>('countPdfImages', pdfPath()).should('eq', 0)
    })

    it('reprend le nombre de personnes choisi à l’écran', () => {
      visitRecipe(false)
      cy.get('.pi-minus').click()
      cy.get('.pi-minus').click()
      cy.contains('button', 'Partager').click()
      cy.contains('Télécharger le PDF').click()
      cy.readFile(pdfPath(), null, { timeout: 15000 }).should('exist')
      cy.task<string>('readPdfText', pdfPath()).then((text) => {
        expect(text).to.contain('Pour 2 personnes')
        expect(text).to.contain('100 g')
        expect(text).not.to.contain('200 g')
      })
    })
  })

  describe('sur mobile (390 px)', () => {
    beforeEach(() => cy.viewport(390, 844))

    it('ouvre directement le partage natif, sans menu', () => {
      visitRecipe(true)
      cy.contains('button', 'Partager').click()
      sharedFile().its('name').should('eq', 'pad-thai.pdf')
      cy.contains('Télécharger le PDF').should('not.exist')
    })

    it('télécharge le PDF si le partage de fichiers est indisponible', () => {
      visitRecipe(false)
      cy.contains('button', 'Partager').click()
      cy.readFile(pdfPath(), null, { timeout: 15000 }).should('exist')
    })

    it('garde les boutons dans la largeur de l’écran', () => {
      visitRecipe(false)
      cy.contains('button', 'Partager').should(($b) => {
        expect($b[0].getBoundingClientRect().right).to.be.at.most(390)
      })
      cy.contains('button', 'Supprimer').should(($b) => {
        expect($b[0].getBoundingClientRect().right).to.be.at.most(390)
      })
    })
  })
})
