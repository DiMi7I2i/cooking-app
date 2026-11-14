<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="recipe">
      <BreadcrumbNav :segments="breadcrumbSegments" />
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold m-0">{{ recipe.title }}</h1>
          <div class="flex flex-wrap gap-2 mt-3">
            <Tag :value="categoryLabel" severity="secondary" />
            <Tag :value="difficultyLabel" :severity="difficultySeverity" />
            <Tag :value="costLabel" :severity="costSeverity" />
            <Tag v-for="tag in tagLabels" :key="tag" :value="tag" class="tag-custom" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto">
          <Button
            label="Partager"
            icon="pi pi-share-alt"
            outlined
            :loading="sharing"
            aria-haspopup="true"
            aria-controls="share-menu"
            @click="onShareClick"
          />
          <Menu id="share-menu" ref="shareMenu" :model="shareMenuItems" :popup="true" />
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
          :src="recipe.thumbnail"
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
import { formatQuantity, isFraction as isFractionFor } from '@/utils/servings'
import {
  buildRecipePdf,
  canShareFiles,
  downloadPdf,
  loadPdfMake,
  pdfFileName,
  sharePdf,
} from '@/services/RecipePdfService'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbSegment } from './BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const confirmDelete = ref(false)

// --- Partage en PDF ---
const sharing = ref(false)
const shareMenu = ref<InstanceType<typeof Menu> | null>(null)

const shareMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []
  if (canShareFiles()) {
    items.push({ label: 'Partager le PDF…', icon: 'pi pi-share-alt', command: () => exportPdf('share') })
  }
  items.push({ label: 'Télécharger le PDF', icon: 'pi pi-download', command: () => exportPdf('download') })
  return items
})

function isMobile() {
  return window.matchMedia('(max-width: 639px)').matches
}

function onShareClick(event: Event) {
  if (isMobile()) {
    // Mobile : directement la feuille de partage native (ou téléchargement)
    exportPdf(canShareFiles() ? 'share' : 'download')
  } else {
    shareMenu.value?.toggle(event)
  }
}

async function exportPdf(mode: 'share' | 'download') {
  if (!recipe.value || sharing.value) return
  sharing.value = true
  try {
    const blob = await buildRecipePdf(recipe.value, selectedServings.value)
    const fileName = pdfFileName(recipe.value.title)
    if (mode === 'share') {
      await sharePdf(blob, fileName, recipe.value.title)
    } else {
      downloadPdf(blob, fileName)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de générer le PDF',
      life: 3000,
    })
  } finally {
    sharing.value = false
  }
}

const categoryLabel = computed(
  () => (recipe.value ? CategoryLabels[recipe.value.categoryCode as Category] : '')
)

const breadcrumbSegments = computed<BreadcrumbSegment[]>(() => {
  if (!recipe.value) return []
  const segments: BreadcrumbSegment[] = [
    { label: 'Recettes', to: '/' },
  ]
  if (recipe.value.categoryCode) {
    segments.push({
      label: categoryLabel.value,
      to: `/?categoryCode=${recipe.value.categoryCode}`,
    })
  }
  segments.push({ label: recipe.value.title })
  return segments
})
const difficultyLabel = computed(
  () => (recipe.value ? DifficultyLabels[recipe.value.difficultyCode as Difficulty] : '')
)
const costLabel = computed(
  () => (recipe.value ? CostLabels[recipe.value.costCode as Cost] : '')
)

const tagLabels = computed(() =>
  recipe.value ? (recipe.value.tags || []).map((t) => TagLabels[t as TagEnum] || t) : []
)

const costSeverity = computed(() => {
  if (!recipe.value) return undefined
  switch (recipe.value.costCode) {
    case 'CHEAP':
      return 'success'
    case 'MIDDLE':
      return 'warn'
    case 'EXPENSIVE':
      return 'danger'
    default:
      return undefined
  }
})

const selectedServings = ref(1)

function increaseServings() {
  selectedServings.value++
}

function decreaseServings() {
  if (selectedServings.value > 1) selectedServings.value--
}

function isFraction(originalQuantity: number): boolean {
  return isFractionFor(originalQuantity, recipe.value?.servings, selectedServings.value)
}

function adjustedQuantity(originalQuantity: number, hasUnit: boolean): string {
  return formatQuantity(originalQuantity, hasUnit, recipe.value?.servings, selectedServings.value)
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

onMounted(() => {
  fetchRecipe()
  // Précharge pdfmake : le partage natif doit suivre le clic de près
  loadPdfMake().catch(() => {})
})
</script>

<style scoped>
.tag-custom {
  background-color: var(--color-primary-500) !important;
  color: white !important;
}

.fraction {
  font-size: 1.3em;
}

.step-number {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary-500);
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
