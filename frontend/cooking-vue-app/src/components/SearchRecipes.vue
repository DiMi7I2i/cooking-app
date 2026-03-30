<template>
  <div>
    <!-- Filter bar -->
    <div v-show="showFilters" class="filter-bar">
      <div class="filter-bar-content">
        <Select
          v-model="filterCategory"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Catégorie"
          showClear
          class="filter-select"
        />
        <Select
          v-model="filterDifficulty"
          :options="difficultyOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Difficulté"
          showClear
          class="filter-select"
        />
        <Select
          v-model="filterCost"
          :options="costOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Coût"
          showClear
          class="filter-select"
        />
        <div class="filter-tags">
          <span
            v-for="option in tagOptions"
            :key="option.value"
            :class="['filter-chip', { active: filterTags.includes(option.value) }]"
            @click="toggleTag(option.value)"
          >
            {{ option.label }}
          </span>
        </div>
        <div class="filter-actions">
          <Button label="Appliquer" icon="pi pi-search" size="small" @click="applyFilters" />
          <Button
            v-if="hasActiveFilters"
            label="Réinitialiser"
            icon="pi pi-times"
            severity="secondary"
            text
            size="small"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 max-w-6xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center p-8">
        <ProgressSpinner />
      </div>

      <!-- Results -->
      <div v-else-if="recipes.length > 0">
        <!-- Results count -->
        <div class="mb-4 text-surface-600">
          <span v-if="searchTitle"
            >Résultats pour « <strong>{{ searchTitle }}</strong> » —
          </span>
          <strong>{{ total }}</strong> recette{{ total > 1 ? 's' : '' }} trouvée{{
            total > 1 ? 's' : ''
          }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels } from '@/enums/category'
import { DifficultyLabels } from '@/enums/difficulty'
import { CostLabels } from '@/enums/cost'
import { TagLabels } from '@/enums/tag'
import RecipeCard from './RecipeCard.vue'
import { useFilters } from '@/composables/useFilters'

const { showFilters, filtersActive } = useFilters()

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

// Filter bar state
const filterCategory = ref<string | null>(null)
const filterDifficulty = ref<string | null>(null)
const filterCost = ref<string | null>(null)
const filterTags = ref<string[]>([])

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({ value, label }))
const difficultyOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({
  value,
  label,
}))
const costOptions = Object.entries(CostLabels).map(([value, label]) => ({ value, label }))
const tagOptions = Object.entries(TagLabels).map(([value, label]) => ({ value, label }))

const hasActiveFilters = computed(
  () =>
    filterCategory.value || filterDifficulty.value || filterCost.value || filterTags.value.length > 0
)

function toggleTag(tag: string) {
  const index = filterTags.value.indexOf(tag)
  if (index === -1) {
    filterTags.value.push(tag)
  } else {
    filterTags.value.splice(index, 1)
  }
}

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
  filtersActive.value = false
  router.push({ path: '/', query: searchTitle.value ? { title: searchTitle.value } : {} })
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

  // Sync filter bar state
  filterCategory.value = searchCategory.value
  filterDifficulty.value = searchDifficulty.value
  filterCost.value = searchCost.value
  filterTags.value = searchTags.value ? searchTags.value.split(',') : []

  // Update header filter button state
  filtersActive.value = !!(searchCategory.value || searchDifficulty.value || searchCost.value || searchTags.value)
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

<style scoped>
.filter-bar {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 16px;
}

.filter-bar-content {
  max-width: 1152px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 140px;
  font-size: 0.875rem;
}

.filter-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  background: white;
  border: 1px solid #ddd;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.filter-chip:hover {
  border-color: var(--color-primary-500);
}

.filter-chip.active {
  background-color: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.filter-actions {
  display: flex;
  gap: 6px;
}

@media (max-width: 640px) {
  .filter-bar-content {
    gap: 8px;
  }

  .filter-select {
    min-width: 100%;
  }

  .filter-actions {
    width: 100%;
    margin-left: 0;
  }
}
</style>
