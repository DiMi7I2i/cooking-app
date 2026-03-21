<template>
  <div class="p-4 max-w-6xl mx-auto">
    <!-- Advanced filters toggle -->
    <div class="mb-4">
      <Button
        :label="showFilters ? 'Masquer les filtres' : 'Filtres avancés'"
        :icon="showFilters ? 'pi pi-chevron-up' : 'pi pi-filter'"
        severity="secondary"
        outlined
        size="small"
        @click="showFilters = !showFilters"
      />
    </div>

    <!-- Advanced filters panel -->
    <div v-show="showFilters" class="mb-6 bg-surface-100 rounded-lg p-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div class="flex flex-col gap-1">
          <label class="font-medium text-sm">Catégorie</label>
          <Select
            v-model="filterCategory"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Toutes"
            showClear
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-medium text-sm">Difficulté</label>
          <Select
            v-model="filterDifficulty"
            :options="difficultyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Toutes"
            showClear
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-medium text-sm">Coût</label>
          <Select
            v-model="filterCost"
            :options="costOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous"
            showClear
          />
        </div>
      </div>
      <div class="mb-4">
        <label class="font-medium text-sm mb-2 block">Tags</label>
        <div class="flex flex-wrap gap-3">
          <label v-for="option in tagOptions" :key="option.value" class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :value="option.value"
              v-model="filterTags"
              class="accent-[#3eb9a1]"
            />
            <span class="text-sm">{{ option.label }}</span>
          </label>
        </div>
      </div>
      <div class="flex gap-2">
        <Button label="Appliquer" icon="pi pi-search" size="small" @click="applyFilters" />
        <Button label="Réinitialiser" icon="pi pi-times" severity="secondary" outlined size="small" @click="resetFilters" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <!-- Results -->
    <div v-else-if="recipes.length > 0">
      <!-- Results count -->
      <div class="mb-4 text-surface-600">
        <span v-if="searchTitle">Résultats pour « <strong>{{ searchTitle }}</strong> » — </span>
        <strong>{{ total }}</strong> recette{{ total > 1 ? 's' : '' }} trouvée{{ total > 1 ? 's' : '' }}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RecipeCard v-for="recipe in recipes" :key="recipe._id" :recipe="recipe" />
      </div>
      <Paginator
        v-if="total > limit"
        :rows="limit"
        :totalRecords="total"
        :first="(page - 1) * limit"
        @page="onPageChange"
        class="mt-6"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center p-8 text-surface-500">
      <i class="pi pi-search text-4xl mb-4 block"></i>
      <p>Aucune recette trouvée.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels } from '@/enums/category'
import { DifficultyLabels } from '@/enums/difficulty'
import { CostLabels } from '@/enums/cost'
import { TagLabels } from '@/enums/tag'
import RecipeCard from './RecipeCard.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const recipes = ref<Recipe[]>([])
const loading = ref(false)
const searchTitle = ref('')
const searchCategory = ref<string | null>(null)
const searchDifficulty = ref<string | null>(null)
const searchCost = ref<string | null>(null)
const searchTags = ref<string | null>(null)
const page = ref(1)
const limit = ref(9)
const total = ref(0)

// Advanced filters panel
const showFilters = ref(false)
const filterCategory = ref<string | null>(null)
const filterDifficulty = ref<string | null>(null)
const filterCost = ref<string | null>(null)
const filterTags = ref<string[]>([])

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({ value, label }))
const difficultyOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({ value, label }))
const costOptions = Object.entries(CostLabels).map(([value, label]) => ({ value, label }))
const tagOptions = Object.entries(TagLabels).map(([value, label]) => ({ value, label }))

function applyFilters() {
  const query: Record<string, string> = {}
  if (searchTitle.value) query.title = searchTitle.value
  if (filterCategory.value) query.categoryCode = filterCategory.value
  if (filterDifficulty.value) query.difficultyCode = filterDifficulty.value
  if (filterCost.value) query.costCode = filterCost.value
  if (filterTags.value.length > 0) query.tags = filterTags.value.join(',')
  router.push({ path: '/', query })
}

function resetFilters() {
  filterCategory.value = null
  filterDifficulty.value = null
  filterCost.value = null
  filterTags.value = []
  router.push({ path: '/' })
}

async function fetchRecipes() {
  loading.value = true
  try {
    const result = await RecipeService.getRecipes({
      title: searchTitle.value || undefined,
      categoryCode: searchCategory.value || undefined,
      difficultyCode: searchDifficulty.value || undefined,
      costCode: searchCost.value || undefined,
      tags: searchTags.value || undefined,
      page: page.value,
      limit: limit.value,
    })
    recipes.value = result.data
    total.value = result.total
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les recettes',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function onPageChange(event: { page: number }) {
  page.value = event.page + 1
  fetchRecipes()
}

function syncFromQuery(query: Record<string, any>) {
  searchTitle.value = (query.title as string) || ''
  searchCategory.value = (query.categoryCode as string) || null
  searchDifficulty.value = (query.difficultyCode as string) || null
  searchCost.value = (query.costCode as string) || null
  searchTags.value = (query.tags as string) || null

  // Sync filter panel state
  filterCategory.value = searchCategory.value
  filterDifficulty.value = searchDifficulty.value
  filterCost.value = searchCost.value
  filterTags.value = searchTags.value ? searchTags.value.split(',') : []

  // Auto-show filters if any filter is active
  if (searchCategory.value || searchDifficulty.value || searchCost.value || searchTags.value) {
    showFilters.value = true
  }
}

// React to URL query changes
watch(
  () => route.query,
  (query) => {
    syncFromQuery(query)
    page.value = 1
    fetchRecipes()
  },
)

onMounted(() => {
  syncFromQuery(route.query)
  fetchRecipes()
})
</script>
