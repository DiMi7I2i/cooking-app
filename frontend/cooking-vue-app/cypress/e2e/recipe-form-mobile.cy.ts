// Régression mobile : sur le formulaire de modification, les lignes d'ingrédients
// (poignée + nom + quantité + unité + corbeille) étaient plus larges que l'écran.
// Elles élargissaient toute la page : le header (barre de recherche) et le
// formulaire sortaient de l'écran, rognés par le overflow-x: hidden du body.

const recipe = {
  _id: 'abc',
  id: 'abc',
  title: 'Pad Thaï',
  description: 'Nouilles sautées',
  categoryCode: 'PLAT',
  difficultyCode: 'EASY',
  costCode: 'CHEAP',
  tags: [],
  servings: 4,
  preparationDuration: 10,
  cookDuration: 15,
  breakDuration: 0,
  steps: ['Faire cuire les nouilles.', 'Mélanger.'],
  ingredients: [
    { name: 'Nouilles de riz', quantity: 200, unit: 'g' },
    { name: 'Crevettes décortiquées', quantity: 300, unit: 'g' },
    { name: 'Sauce de poisson', quantity: 2, unit: 'càs' }
  ]
}

// Bord droit d'un élément, en pixels
function rightEdge(selector: string) {
  return cy.get(selector).first().then(($el) => $el[0].getBoundingClientRect().right)
}

describe('Formulaire de modification sur mobile (portrait)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/data/recipes/abc', recipe)
  })

  for (const [width, device] of [
    [390, 'iPhone'],
    [360, 'petit Android']
  ] as const) {
    describe(`${width}px (${device})`, () => {
      beforeEach(() => {
        cy.viewport(width, 800)
        cy.visit('/recipes/abc/edit')
        // Les ingrédients de la recette sont chargés
        cy.get('input[placeholder="Nom *"]').should('have.length', 3)
      })

      it('la page ne déborde pas horizontalement', () => {
        cy.document().should((doc) => {
          const root = doc.documentElement
          expect(root.scrollWidth, 'largeur du contenu').to.be.at.most(root.clientWidth)
        })
      })

      it('la barre de recherche du header reste entièrement visible', () => {
        cy.document().then((doc) => {
          const usable = doc.documentElement.clientWidth
          cy.get('header').should(($header) => {
            expect($header[0].getBoundingClientRect().right).to.be.at.most(usable)
          })
          rightEdge('.search-button').should('be.at.most', usable)
          rightEdge('.filter-toggle-button').should('be.at.most', usable)
        })
      })

      it('chaque ligne d’ingrédient tient dans l’écran, corbeille comprise', () => {
        cy.document().then((doc) => {
          const usable = doc.documentElement.clientWidth
          cy.get('form button:has(.pi-trash)').each(($button) => {
            expect($button[0].getBoundingClientRect().right).to.be.at.most(usable)
          })
          for (const placeholder of ['Nom *', 'Qté', 'Unité']) {
            cy.get(`input[placeholder="${placeholder}"]`).each(($input) => {
              const rect = $input[0].getBoundingClientRect()
              expect(rect.right, `champ « ${placeholder} »`).to.be.at.most(usable)
              expect(rect.width, `largeur du champ « ${placeholder} »`).to.be.at.least(40)
            })
          }
        })
      })

      it('nom, quantité, unité et corbeille restent sur la même ligne', () => {
        cy.get('input[placeholder="Nom *"]')
          .first()
          .then(($name) => {
            const name = $name[0].getBoundingClientRect()
            const quantity = Cypress.$('input[placeholder="Qté"]')[0].getBoundingClientRect()
            const unit = Cypress.$('input[placeholder="Unité"]')[0].getBoundingClientRect()
            const trash = Cypress.$('form button:has(.pi-trash)')[0].getBoundingClientRect()
            expect(quantity.top, 'quantité sur la ligne du nom').to.equal(name.top)
            expect(unit.top, 'unité sur la ligne du nom').to.equal(name.top)
            // Corbeille centrée verticalement sur la ligne du nom
            expect(Math.abs(trash.top + trash.height / 2 - (name.top + name.height / 2))).to.be.at.most(2)
            // Le nom garde de la place pour être lisible
            expect(name.width, 'largeur du champ nom').to.be.at.least(100)
            // La quantité (3-4 caractères) est plus étroite que l'unité, mais reste utilisable
            expect(quantity.width, 'quantité plus étroite que l’unité').to.be.lessThan(unit.width)
            expect(quantity.width, 'largeur du champ quantité').to.be.at.least(48)
          })
      })
    })
  }

  it('sur PC, une ligne d’ingrédient reste sur une seule ligne', () => {
    cy.viewport(1280, 800)
    cy.visit('/recipes/abc/edit')
    cy.get('input[placeholder="Nom *"]').should('have.length', 3)
    cy.get('input[placeholder="Nom *"]')
      .first()
      .then(($name) => {
        const name = $name[0].getBoundingClientRect()
        const quantity = Cypress.$('input[placeholder="Qté"]')[0].getBoundingClientRect()
        const unit = Cypress.$('input[placeholder="Unité"]')[0].getBoundingClientRect()
        expect(quantity.top, 'quantité sur la ligne du nom').to.equal(name.top)
        expect(unit.top, 'unité sur la ligne du nom').to.equal(name.top)
      })
  })
})
