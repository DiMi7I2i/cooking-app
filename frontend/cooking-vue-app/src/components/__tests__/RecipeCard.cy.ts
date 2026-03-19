// @ts-nocheck — Cypress mount types are incompatible with Vue 3.5 defineComponent
import RecipeCard from '../RecipeCard.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { createRouter, createMemoryHistory } from 'vue-router'

const mockRecipe = {
  _id: '123',
  title: 'Pad Thaï',
  description: 'Plat thaïlandais',
  thumbnail: null,
  categoryCode: 'PLAT',
  difficultyCode: 'EASY',
  costCode: 'CHEAP',
  preparationDuration: 30,
  cookDuration: 15,
  steps: ['Étape 1'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/recipes/:id', component: { template: '<div />' } },
  ],
})

describe('RecipeCard', () => {
  const mountOptions = {
    props: { recipe: mockRecipe },
    global: {
      plugins: [router, [PrimeVue, { theme: { preset: Aura } }]],
      components: { Tag, Button },
    },
  }

  it('should display recipe title', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should display category label', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Plat').should('be.visible')
  })

  it('should display difficulty label', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Facile').should('be.visible')
  })

  it('should display preparation duration', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('30').should('be.visible')
  })
})
