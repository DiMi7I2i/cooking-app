describe('Recipes CRUD', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the recipe list page', () => {
    cy.contains('Rechercher').should('be.visible')
  })

  it('should navigate to create recipe form', () => {
    cy.visit('/recipes/create')
    cy.contains('Créer une recette').should('be.visible')
  })

  it('should create a new recipe', () => {
    cy.visit('/recipes/create')

    cy.get('#title').type('Crêpes bretonnes')
    cy.get('#description').type('Délicieuses crêpes de sarrasin')

    // Select category
    cy.get('#categoryCode').click()
    cy.contains('Plat').click()

    // Select difficulty
    cy.get('#difficultyCode').click()
    cy.contains('Facile').click()

    // Select cost
    cy.get('#costCode').click()
    cy.contains('Bon marché').click()

    cy.get('#preparationDuration').type('15')
    cy.get('#cookDuration').type('20')

    // Add a step
    cy.contains('Ajouter une étape').click()
    cy.get('input').last().type('Mélanger la farine et les oeufs')

    // Submit
    cy.contains('Créer').click()

    // Should redirect to list and show the new recipe
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Crêpes bretonnes').should('be.visible')
  })

  it('should search recipes by title', () => {
    cy.get('input[placeholder*="Rechercher"]').type('Pad')
    cy.contains('Rechercher').click()
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should view recipe detail', () => {
    cy.contains('Pad Thaï').click()
    cy.contains('Pad Thaï').should('be.visible')
    cy.contains('Étapes').should('be.visible')
  })

  it('should delete a recipe', () => {
    // First create a recipe to delete
    cy.visit('/recipes/create')
    cy.get('#title').type('Recette à supprimer')
    cy.get('#categoryCode').click()
    cy.contains('Dessert').click()
    cy.get('#difficultyCode').click()
    cy.contains('Facile').click()
    cy.get('#costCode').click()
    cy.contains('Bon marché').click()
    cy.contains('Créer').click()

    // Navigate to its detail
    cy.contains('Recette à supprimer').click()

    // Delete it
    cy.contains('Supprimer').click()
    cy.contains('Êtes-vous sûr').should('be.visible')
    cy.get('.p-dialog-footer').contains('Supprimer').click()

    // Should redirect to list
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
