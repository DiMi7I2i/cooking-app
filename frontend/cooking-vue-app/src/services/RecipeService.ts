import type { Recipe, PaginatedResponse, RecipeFilters } from '@/types/recipe'

const API_BASE = 'http://localhost:3000/data/recipes'

export const RecipeService = {
  async getRecipes(filters: RecipeFilters = {}): Promise<PaginatedResponse<Recipe>> {
    const params = new URLSearchParams()
    if (filters.title) params.set('title', filters.title)
    if (filters.categoryCode) params.set('categoryCode', filters.categoryCode)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const res = await fetch(`${API_BASE}?${params}`)
    if (!res.ok) throw new Error('Erreur lors de la récupération des recettes')
    return res.json()
  },

  async getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) throw new Error('Recette non trouvée')
    return res.json()
  },

  async createRecipe(data: FormData): Promise<Recipe> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      body: data,
    })
    if (!res.ok) throw new Error('Erreur lors de la création de la recette')
    return res.json()
  },

  async updateRecipe(id: string, data: FormData): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: data,
    })
    if (!res.ok) throw new Error('Erreur lors de la modification de la recette')
    return res.json()
  },

  async deleteRecipe(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Erreur lors de la suppression de la recette')
  },
}
