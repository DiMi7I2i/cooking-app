export interface Ingredient {
  name: string
  quantity?: number
  unit?: string
}

export interface Recipe {
  _id: string
  title: string
  description?: string
  thumbnail?: string
  categoryCode: string
  difficultyCode: string
  costCode: string
  preparationDuration?: number
  cookDuration?: number
  breakDuration?: number
  servings: number
  tags?: string[]
  steps: string[]
  ingredients: Ingredient[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface RecipeFilters {
  title?: string
  categoryCode?: string
  difficultyCode?: string
  costCode?: string
  tags?: string
  page?: number
  limit?: number
}
