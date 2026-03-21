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
            <Tag v-for="tag in tagLabels" :key="tag" :value="tag" severity="success" />
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
      <div v-if="totalDuration" class="mb-6 bg-surface-100 rounded-lg p-4">
        <div class="text-center mb-3">
          <i class="pi pi-hourglass mr-2"></i>
          <span class="text-xl font-bold">{{ totalDuration }} min</span>
        </div>
        <div class="flex flex-wrap justify-center gap-6 text-surface-600">
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
      </div>

      <!-- Ingredients -->
      <div v-if="recipe.ingredients && recipe.ingredients.length > 0" class="mb-6 mb-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold m-0">Ingrédients</h2>
          <div v-if="recipe.servings" class="flex items-center gap-2">
            <i class="pi pi-users text-surface-500"></i>
            <Button icon="pi pi-minus" severity="secondary" text rounded size="small" @click="decreaseServings" :disabled="selectedServings <= 1" />
            <span class="font-bold text-lg min-w-8 text-center">{{ selectedServings }}</span>
            <Button icon="pi pi-plus" severity="secondary" text rounded size="small" @click="increaseServings" />
          </div>
        </div>
        <table class="w-full">
          <tr
            v-for="(ingredient, index) in recipe.ingredients.filter(i => i != null)"
            :key="index"
            class="border-b border-surface-200 last:border-b-0"
          >
            <td class="py-2 font-medium text-surface-700">{{ ingredient.name }}</td>
            <td class="py-2 text-right text-surface-500">
              <template v-if="ingredient.quantity && ingredient.unit">
                {{ adjustedQuantity(ingredient.quantity, true) }} {{ ingredient.unit }}
              </template>
              <template v-else-if="ingredient.quantity">
                <span :class="{ fraction: isFraction(ingredient.quantity) }">{{ adjustedQuantity(ingredient.quantity, false) }}</span>
              </template>
            </td>
          </tr>
        </table>
      </div>

      <!-- Steps -->
      <div v-if="recipe.steps && recipe.steps.length > 0" class="mb-6 mb-2">
        <h2 class="text-xl font-semibold mb-4">Étapes</h2>
        <div class="flex flex-col gap-4">
          <div v-for="(step, index) in recipe.steps" :key="index" class="flex gap-3">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="pt-1 text-surface-700">{{ step }}</div>
          </div>
        </div>
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
import { TagLabels, Tag as TagEnum } from '@/enums/tag'

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

const tagLabels = computed(() =>
  recipe.value ? (recipe.value.tags || []).map((t) => TagLabels[t as TagEnum] || t) : []
)

const selectedServings = ref(1)

function increaseServings() {
  selectedServings.value++
}

function decreaseServings() {
  if (selectedServings.value > 1) selectedServings.value--
}

function toFraction(value: number): string {
  const fractions: [number, string][] = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ]
  const whole = Math.floor(value)
  const decimal = value - whole

  if (decimal < 0.01) return String(whole)

  for (const [threshold, symbol] of fractions) {
    if (Math.abs(decimal - threshold) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol
    }
  }

  return value.toFixed(1)
}

function isFraction(originalQuantity: number): boolean {
  if (!recipe.value?.servings) return false
  const ratio = selectedServings.value / recipe.value.servings
  const adjusted = originalQuantity * ratio
  return adjusted < 1 && adjusted % 1 !== 0
}

function adjustedQuantity(originalQuantity: number, hasUnit: boolean): string {
  if (!recipe.value?.servings) return String(originalQuantity)
  const ratio = selectedServings.value / recipe.value.servings
  const adjusted = originalQuantity * ratio

  if (adjusted % 1 === 0) return String(adjusted)
  if (!hasUnit && adjusted < 1) return toFraction(adjusted)
  return adjusted.toFixed(1)
}

const totalDuration = computed(() => {
  if (!recipe.value) return null
  const total =
    (recipe.value.preparationDuration || 0) +
    (recipe.value.cookDuration || 0) +
    (recipe.value.breakDuration || 0)
  return total > 0 ? total : null
})

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
    if (recipe.value.servings) {
      selectedServings.value = recipe.value.servings
    }
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

<style scoped>
.fraction {
  font-size: 1.3em;
}

.step-number {
  width: 32px;
  height: 32px;
  background-color: #3eb9a1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
