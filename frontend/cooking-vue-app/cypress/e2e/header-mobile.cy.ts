// Régression mobile : en portrait, le logo prenait trop de place dans la barre
// du haut et le champ de recherche était tronqué (« Rechercher un », « Recherche »).

// Le texte d'aide du champ tient entièrement dans sa zone de saisie
function placeholderShouldFit() {
  cy.get('.search-input').should(($input) => {
    const input = $input[0] as HTMLInputElement
    const style = getComputedStyle(input)
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const textWidth = ctx.measureText(input.placeholder).width
    const available =
      input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    expect(textWidth, `« ${input.placeholder} » (${Math.round(textWidth)}px)`).to.be.at.most(
      available
    )
  })
}

// L'élément est entièrement visible horizontalement
function shouldBeWithinViewport(selector: string, width: number) {
  cy.get(selector).should(($el) => {
    const rect = $el[0].getBoundingClientRect()
    expect(rect.left).to.be.at.least(0)
    expect(rect.right).to.be.at.most(width)
  })
}

describe('Barre du haut sur mobile (portrait)', () => {
  // Liste vide simulée : sans backend, une notification d'erreur recouvrirait la barre
  beforeEach(() => {
    cy.intercept('GET', '**/data/recipes*', { data: [], total: 0, page: 1, limit: 9 })
  })

  for (const [width, device] of [
    [390, 'iPhone'],
    [360, 'petit Android']
  ] as const) {
    it(`${width}px (${device}) : pas de logo, recherche lisible, boutons visibles`, () => {
      cy.viewport(width, 800)
      cy.visit('/')
      // Attendre le chargement de l'image : juste avant, elle passerait pour « invisible »
      cy.get('.application-logo')
        .should(($img) => expect(($img[0] as HTMLImageElement).complete).to.be.true)
        .and('not.be.visible')
      placeholderShouldFit()
      shouldBeWithinViewport('.search-button', width)
      shouldBeWithinViewport('.filter-toggle-button', width)
      shouldBeWithinViewport('.burger-button', width)
    })

    it(`${width}px (${device}) : header bord à bord, contenu toujours avec une marge`, () => {
      cy.viewport(width, 800)
      cy.visit('/recipes/create')
      // Largeur utile de la page : sur téléphone, la barre de défilement
      // se superpose au contenu, alors que dans Cypress elle prend 15 px
      cy.document().then((doc) => {
        const usable = doc.documentElement.clientWidth
        cy.get('header').should(($header) => {
          const rect = $header[0].getBoundingClientRect()
          expect(rect.left, 'bord gauche du header').to.equal(0)
          expect(rect.right, 'bord droit du header').to.equal(usable)
        })
        cy.get('#title').should(($input) => {
          const rect = $input[0].getBoundingClientRect()
          expect(rect.left, 'marge gauche du contenu').to.be.at.least(12)
          expect(usable - rect.right, 'marge droite du contenu').to.be.at.least(12)
        })
      })
    })
  }

  it('sur PC, le logo et le titre restent affichés', () => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.get('.application-logo').should('be.visible')
    cy.get('.application-name').should('be.visible')
    placeholderShouldFit()
  })
})
