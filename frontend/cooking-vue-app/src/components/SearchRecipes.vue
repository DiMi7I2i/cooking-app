<template>
  <div class="p-4 max-w-6xl mx-auto">
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
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import RecipeCard from './RecipeCard.vue'

const route = useRoute()
const toast = useToast()

const recipes = ref<Recipe[]>([])
const loading = ref(false)
const searchTitle = ref('')
const searchCategory = ref<string | null>(null)
const page = ref(1)
const limit = ref(9)
const total = ref(0)

async function fetchRecipes() {
  loading.value = true
  try {
    const result = await RecipeService.getRecipes({
      title: searchTitle.value || undefined,
      categoryCode: searchCategory.value || undefined,
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

function search() {
  page.value = 1
  fetchRecipes()
}

function onPageChange(event: { page: number }) {
  page.value = event.page + 1
  fetchRecipes()
}

// React to URL query changes (search from Header)
watch(
  () => route.query,
  (query) => {
    searchTitle.value = (query.title as string) || ''
    searchCategory.value = (query.categoryCode as string) || null
    page.value = 1
    fetchRecipes()
  },
)

onMounted(() => {
  searchTitle.value = (route.query.title as string) || ''
  searchCategory.value = (route.query.categoryCode as string) || null
  fetchRecipes()
})
</script>
