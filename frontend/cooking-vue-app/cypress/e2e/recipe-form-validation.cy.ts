// Régression mobile : le bouton de validation était désactivé tant que le
// formulaire était incomplet. Sur téléphone, on le touchait sans avoir quitté
// les champs : aucune erreur ne s'affichait et rien ne se passait.
// Le bouton doit afficher toutes les erreurs et amener au premier champ en erreur.

// Le champ est visible à l'écran, sous le header sticky
function shouldBeOnScreen(selector: string) {
  cy.get('header').then(($header) => {
    const headerBottom = $header[0].getBoundingClientRect().bottom
    cy.get(selector).should(($el) => {
      const rect = $el[0].getBoundingClientRect()
      expect(rect.top, 'haut du champ sous le header').to.be.at.least(headerBottom)
      expect(rect.bottom, "bas du champ dans l'écran").to.be.at.most(
        Cypress.config('viewportHeight')
      )
    })
  })
}

function chooseOption(selectId: string, label: string) {
  cy.get(`#${selectId}`).click({ force: true })
  cy.get('.p-select-overlay').should('be.visible').contains(label).click()
}

describe('Formulaire recette sur mobile : validation au clic', () => {
  beforeEach(() => {
    cy.viewport(390, 844)
    cy.intercept('POST', '**/data/recipes', cy.spy().as('create'))
    cy.intercept('PUT', '**/data/recipes/*', cy.spy().as('update'))
  })

  it('création, formulaire vide : affiche toutes les erreurs et cible le titre', () => {
    cy.visit('/recipes/create')
    cy.get('button[type="submit"]').should('not.be.disabled').click()

    cy.contains('Le titre est requis').should('be.visible')
    cy.contains('La catégorie est requise').should('exist')
    cy.contains('La difficulté est requise').should('exist')
    cy.contains('Le coût est requis').should('exist')
    cy.contains('Le nombre de personnes est requis').should('exist')
    cy.contains('Au moins un ingrédient est requis').should('exist')
    cy.get('#title').should('have.class', 'p-invalid')
    cy.focused().should('have.id', 'title')
    shouldBeOnScreen('#title')
    cy.get('@create').should('not.have.been.called')
  })

  it('création, formulaire incomplet : amène au premier champ en erreur', () => {
    cy.visit('/recipes/create')
    cy.get('#title').type('Tarte aux pommes')
    chooseOption('categoryCode', 'Dessert')
    chooseOption('difficultyCode', 'Facile')
    chooseOption('costCode', 'Bon marché')

    cy.get('button[type="submit"]').should('not.be.disabled').click()

    cy.contains('Le nombre de personnes est requis').should('be.visible')
    cy.contains('Le titre est requis').should('not.exist')
    cy.focused().should('have.id', 'servings')
    shouldBeOnScreen('#servings')
    cy.get('@create').should('not.have.been.called')
  })

  it('modification, titre vidé : affiche l’erreur et ne sauvegarde pas', () => {
    cy.intercept('GET', '**/data/recipes/form-validation-test', {
      _id: 'form-validation-test',
      title: 'Recette existante',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      servings: 2,
      tags: [],
      steps: [],
      ingredients: [{ name: 'Farine', quantity: 100, unit: 'g' }],
      createdAt: '2026-11-13T00:00:00.000Z',
      updatedAt: '2026-11-13T00:00:00.000Z'
    })
    cy.visit('/recipes/form-validation-test/edit')
    cy.get('#title').should('have.value', 'Recette existante').clear()

    cy.get('button[type="submit"]').should('not.be.disabled').click()

    cy.contains('Le titre est requis').should('be.visible')
    cy.focused().should('have.id', 'title')
    shouldBeOnScreen('#title')
    cy.get('@update').should('not.have.been.called')
  })
})
