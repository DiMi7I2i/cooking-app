// Régression : sous Firefox/OS en thème sombre, les labels du menu latéral
// (clair PrimeVue) devenaient blancs sur blanc car les variantes Tailwind `dark:`
// suivaient prefers-color-scheme au lieu de la classe `.dark` utilisée par PrimeVue.
describe('Sidebar - OS en thème sombre', () => {
  beforeEach(() => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setEmulatedMedia',
      params: { features: [{ name: 'prefers-color-scheme', value: 'dark' }] },
    })
  })

  it('garde des labels lisibles (non blancs) sans survol', () => {
    cy.visit('/')
    cy.get('.burger-button').click()
    cy.contains('.p-drawer span', 'Rechercher des recettes')
      .should('be.visible')
      .and('have.css', 'color', 'rgb(55, 65, 81)')
    cy.contains('.p-drawer span', 'Catégories')
      .should('have.css', 'color', 'rgb(75, 85, 99)')
  })
})
