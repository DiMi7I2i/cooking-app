// @ts-nocheck — Cypress mount types are incompatible with Vue 3.5 defineComponent
import RecipeForm from '../RecipeForm.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/recipes/create', component: RecipeForm },
    { path: '/recipes/:id/edit', component: RecipeForm },
  ],
})

describe('RecipeForm', () => {
  const mountOptions = {
    global: {
      plugins: [router, [PrimeVue, { theme: { preset: Aura } }], ToastService],
      components: { InputText, Button, Select, Textarea, Tag, Toast, ProgressSpinner },
    },
  }

  it('should display the creation title by default', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Créer une recette').should('be.visible')
  })

  it('should show validation errors when submitting empty form', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Créer').click()
    cy.contains('Le titre est requis').should('be.visible')
    cy.contains('La catégorie est requise').should('be.visible')
  })

  it('should allow adding and removing steps', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Ajouter une étape').click()
    cy.contains('Ajouter une étape').click()
    cy.get('input').should('have.length.at.least', 2)
  })
})
