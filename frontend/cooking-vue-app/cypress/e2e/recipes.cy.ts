describe('Recipes CRUD', () => {
  it('should display the recipe list page', () => {
    cy.visit('/')
    cy.get('input[placeholder*="Rechercher"]').should('be.visible')
  })

  it('should navigate to create recipe form', () => {
    cy.visit('/recipes/create')
    cy.contains('Créer une recette').should('be.visible')
  })

  it('should create a new recipe', () => {
    cy.visit('/recipes/create')

    cy.get('#title').type('Crêpes bretonnes')
    cy.get('#description').type('Délicieuses crêpes de sarrasin')

    // PrimeVue Select: click the dropdown, wait for overlay, then click option
    cy.get('#categoryCode').click({ force: true })
    cy.get('.p-select-overlay').should('be.visible')
    cy.get('.p-select-overlay').contains('Plat').click()

    cy.get('#difficultyCode').click({ force: true })
    cy.get('.p-select-overlay').should('be.visible')
    cy.get('.p-select-overlay').contains('Facile').click()

    cy.get('#costCode').click({ force: true })
    cy.get('.p-select-overlay').should('be.visible')
    cy.get('.p-select-overlay').contains('Bon marché').click()

    cy.get('#preparationDuration').type('15')
    cy.get('#cookDuration').type('20')

    // Add an ingredient
    cy.contains('Ajouter un ingrédient').click()
    cy.get('input[placeholder="Nom *"]').first().type('Farine')
    cy.get('input[placeholder="Qté"]').first().type('250')
    cy.get('input[placeholder="Unité"]').first().type('g')

    // Add a step
    cy.contains('Ajouter une étape').click()
    cy.get('input').last().type('Mélanger la farine et les oeufs')

    // Submit
    cy.get('button[type="submit"]').click()

    // Should redirect to list and show the new recipe
    cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 })
    cy.contains('Crêpes bretonnes').should('be.visible')
  })

  it('should search recipes by title', () => {
    // Create a recipe first so we have data to search
    cy.request('POST', 'http://localhost:3000/data/recipes', {
      title: 'Pad Thaï',
      description: 'Plat thaïlandais',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      steps: ['Étape 1'],
      ingredients: [{ name: 'Nouilles de riz', quantity: 200, unit: 'g' }],
    })

    cy.visit('/')
    cy.get('input[placeholder*="Rechercher"]').type('Pad')
    cy.get('.search-button').click()
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should view recipe detail', () => {
    cy.visit('/')
    // Click on first visible recipe
    cy.get('.border').first().click()
    cy.contains('Modifier').should('be.visible')
  })

  it('should delete a recipe', () => {
    // Create a recipe via API (more reliable than UI)
    cy.request('POST', 'http://localhost:3000/data/recipes', {
      title: 'Recette à supprimer',
      categoryCode: 'DESSERT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      ingredients: [{ name: 'Test' }],
    }).then((response) => {
      const recipeId = response.body._id
      cy.visit(`/recipes/${recipeId}`)
    })

    cy.contains('Recette à supprimer').should('be.visible')
    cy.contains('Supprimer').click()
    cy.contains('Êtes-vous sûr').should('be.visible')
    cy.get('.p-dialog-footer').contains('Supprimer').click()

    // Should redirect to list
    cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 })
  })
})
