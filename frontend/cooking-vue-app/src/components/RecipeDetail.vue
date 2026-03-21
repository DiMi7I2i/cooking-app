<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="recipe">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold m-0">{{ recipe.title }}</h1>
          <div class="flex flex-wrap gap-2 mt-3">
            <Tag :value="categoryLabel" severity="info" />
            <Tag :value="difficultyLabel" :severity="difficultySeverity" />
            <Tag :value="costLabel" />
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            label="Modifier"
            icon="pi pi-pencil"
            severity="info"
            @click="$router.push(`/recipes/${recipe._id}/edit`)"
          />
          <Button
            label="Supprimer"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDelete = true"
          />
        </div>
      </div>

      <!-- Image -->
      <div v-if="recipe.thumbnail" class="mb-6">
        <img
          :src="`http://localhost:3000${recipe.thumbnail}`"
          :alt="recipe.title"
          class="w-full max-h-96 object-cover rounded-lg"
        />
      </div>

      <!-- Description -->
      <p v-if="recipe.description" class="text-surface-600 mb-6">{{ recipe.description }}</p>

      <!-- Durations -->
      <div class="flex flex-wrap gap-6 mb-6 text-surface-600">
        <div v-if="recipe.preparationDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Préparation : {{ recipe.preparationDuration }} min</span>
        </div>
        <div v-if="recipe.cookDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Cuisson : {{ recipe.cookDuration }} min</span>
        </div>
        <div v-if="recipe.breakDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Repos : {{ recipe.breakDuration }} min</span>
        </div>
      </div>

      <!-- Ingredients -->
      <div v-if="recipe.ingredients && recipe.ingredients.length > 0" class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Ingrédients</h2>
        <ul class="list-disc list-inside space-y-2">
          <li
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            class="text-surface-700"
          >
            <template v-if="ingredient.quantity && ingredient.unit">
              {{ ingredient.quantity }} {{ ingredient.unit }} — {{ ingredient.name }}
            </template>
            <template v-else-if="ingredient.quantity">
              {{ ingredient.quantity }} — {{ ingredient.name }}
            </template>
            <template v-else>
              {{ ingredient.name }}
            </template>
          </li>
        </ul>
      </div>

      <!-- Steps -->
      <div v-if="recipe.steps && recipe.steps.length > 0">
        <h2 class="text-xl font-semibold mb-4">Étapes</h2>
        <ol class="list-decimal list-inside space-y-3">
          <li v-for="(step, index) in recipe.steps" :key="index" class="text-surface-700">
            {{ step }}
          </li>
        </ol>
      </div>
    </div>

    <!-- Delete confirmation -->
    <Dialog v-model:visible="confirmDelete" header="Supprimer la recette" :modal="true">
      <p>Êtes-vous sûr de vouloir supprimer cette recette ?</p>
      <template #footer>
        <Button label="Annuler" severity="secondary" @click="confirmDelete = false" />
        <Button label="Supprimer" severity="danger" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels, Category } from '@/enums/category'
import { DifficultyLabels, Difficulty } from '@/enums/difficulty'
import { CostLabels, Cost } from '@/enums/cost'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const confirmDelete = ref(false)

const categoryLabel = computed(
  () => (recipe.value ? CategoryLabels[recipe.value.categoryCode as Category] : '')
)
const difficultyLabel = computed(
  () => (recipe.value ? DifficultyLabels[recipe.value.difficultyCode as Difficulty] : '')
)
const costLabel = computed(
  () => (recipe.value ? CostLabels[recipe.value.costCode as Cost] : '')
)

const difficultySeverity = computed(() => {
  if (!recipe.value) return undefined
  switch (recipe.value.difficultyCode) {
    case 'EASY':
      return 'success'
    case 'MIDDLE':
      return 'info'
    case 'HARD':
      return 'warn'
    case 'VERY_HARD':
    case 'EXPERT':
      return 'danger'
    default:
      return undefined
  }
})

async function fetchRecipe() {
  loading.value = true
  try {
    recipe.value = await RecipeService.getRecipe(route.params.id as string)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Recette non trouvée', life: 3000 })
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!recipe.value) return
  try {
    await RecipeService.deleteRecipe(recipe.value._id)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Recette supprimée',
      life: 3000,
    })
    router.push('/')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de supprimer la recette',
      life: 3000,
    })
  }
  confirmDelete.value = false
}

onMounted(fetchRecipe)
</script>
