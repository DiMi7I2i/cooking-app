// Le frontend doit appeler l'API et charger les images via des URL relatives
// (même origine que la page), pour fonctionner derrière un reverse proxy
// depuis n'importe quel poste du réseau, et pas seulement sur localhost.
const recipe = {
  _id: 'relative-url-test',
  title: 'Recette avec image',
  thumbnail: '/uploads/test-image.jpg',
  categoryCode: 'PLAT',
  difficultyCode: 'EASY',
  costCode: 'CHEAP',
  servings: 2,
  tags: [],
  steps: [],
  ingredients: [],
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z'
}

describe('URL relatives', () => {
  it("appelle l'API sur la même origine que la page", () => {
    cy.intercept('GET', `${Cypress.config().baseUrl}/data/recipes*`).as('sameOrigin')
    cy.visit('/')
    cy.wait('@sameOrigin').its('response.statusCode').should('eq', 200)
  })

  describe('images', () => {
    beforeEach(() => {
      // Réponses simulées, quel que soit l'hôte appelé
      cy.intercept('GET', /\/data\/recipes\?/, { data: [recipe], total: 1, page: 1, limit: 9 })
      cy.intercept('GET', /\/data\/recipes\/relative-url-test$/, recipe)
    })

    it('liste : affiche la miniature via une URL relative', () => {
      cy.visit('/')
      cy.get(`img[alt="${recipe.title}"]`).should('have.attr', 'src', recipe.thumbnail)
    })

    it('détail : affiche la photo via une URL relative', () => {
      cy.visit(`/recipes/${recipe._id}`)
      cy.get(`img[alt="${recipe.title}"]`).should('have.attr', 'src', recipe.thumbnail)
    })

    it("modification : affiche l'aperçu via une URL relative", () => {
      cy.visit(`/recipes/${recipe._id}/edit`)
      cy.get('img.image-preview').should('have.attr', 'src', recipe.thumbnail)
    })
  })
})
