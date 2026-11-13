// Régression mobile : une étape se saisissait dans un champ d'une seule ligne.
// Un long libellé défilait horizontalement et on n'en voyait qu'un morceau.
// Le champ doit s'agrandir dès que le texte dépasse la ligne.

const longStep =
  'Faire fondre le beurre à feu doux, ajouter la farine en pluie sans cesser de remuer, ' +
  'puis verser le lait petit à petit jusqu’à obtenir une sauce lisse et nappante.'

// Tout le texte est visible : sur plusieurs lignes, sans défilement dans le champ
function shouldShowWholeText(selector: string) {
  cy.get('#title').then(($title) => {
    const oneLine = $title[0].getBoundingClientRect().height
    cy.get(selector).should(($el) => {
      const el = $el[0]
      expect(el.scrollWidth, 'largeur du texte').to.be.at.most(el.clientWidth + 1)
      // autoResize (PrimeVue) ne compte pas les bordures : 2 px pris sur la marge
      // intérieure (7 px), sans barre de défilement (overflow: hidden) ni texte coupé
      const style = getComputedStyle(el)
      const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
      expect(style.overflowY, 'pas de barre de défilement').to.equal('hidden')
      expect(el.scrollHeight, 'hauteur du texte').to.be.at.most(el.clientHeight + borders)
      expect(el.getBoundingClientRect().height, 'sur plusieurs lignes').to.be.greaterThan(
        oneLine * 2
      )
    })
  })
}

describe('Formulaire recette sur mobile : saisie des étapes', () => {
  beforeEach(() => {
    cy.viewport(390, 844)
  })

  it("le champ d'une étape fait une ligne puis s'agrandit avec le texte", () => {
    cy.visit('/recipes/create')
    cy.contains('Ajouter une étape').click()

    cy.get('#title').then(($title) => {
      const oneLine = $title[0].getBoundingClientRect().height
      cy.get('.step-input').should(($step) => {
        expect($step[0].getBoundingClientRect().height, 'hauteur initiale').to.be.at.most(
          oneLine + 2
        )
      })

      cy.get('.step-input').type(longStep, { delay: 0 })
      cy.get('.step-input').should(($step) => {
        expect($step[0].getBoundingClientRect().height, 'hauteur après saisie').to.be.greaterThan(
          oneLine * 2
        )
      })
      shouldShowWholeText('.step-input')
    })
  })

  it("Entrée n'insère pas de saut de ligne (une étape reste un paragraphe)", () => {
    cy.visit('/recipes/create')
    cy.contains('Ajouter une étape').click()
    cy.get('.step-input').type('Préchauffer le four{enter}à 180 °C')
    cy.get('.step-input').should('have.value', 'Préchauffer le fourà 180 °C')
  })

  it('en modification, une étape longue est affichée en entier dès le chargement', () => {
    cy.intercept('GET', '**/data/recipes/steps-test', {
      _id: 'steps-test',
      title: 'Béchamel',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      servings: 4,
      tags: [],
      steps: [longStep],
      ingredients: [{ name: 'Lait', quantity: 500, unit: 'ml' }],
      createdAt: '2026-11-13T00:00:00.000Z',
      updatedAt: '2026-11-13T00:00:00.000Z'
    })
    cy.visit('/recipes/steps-test/edit')
    cy.get('.step-input').should('have.value', longStep)
    shouldShowWholeText('.step-input')
  })
})
