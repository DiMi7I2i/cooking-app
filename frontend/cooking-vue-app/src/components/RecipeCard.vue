<template>
  <div
    class="border border-surface-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
    @click="$router.push(`/recipes/${recipe._id}`)"
  >
    <div class="flex flex-col sm:flex-row gap-4">
      <div
        class="w-full sm:w-32 h-32 bg-surface-100 rounded-md overflow-hidden flex-shrink-0"
      >
        <img
          v-if="recipe.thumbnail"
          :src="`http://localhost:3000${recipe.thumbnail}`"
          :alt="recipe.title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <i class="pi pi-image text-4xl text-surface-400"></i>
        </div>
      </div>
      <div class="flex flex-col gap-2 flex-1">
        <h3 class="text-lg font-semibold m-0">{{ recipe.title }}</h3>
        <p
          v-if="recipe.description"
          class="text-surface-600 text-sm m-0 line-clamp-2"
        >
          {{ recipe.description }}
        </p>
        <div class="flex flex-wrap gap-2 mt-auto">
          <Tag :value="categoryLabel" severity="info" />
          <Tag :value="difficultyLabel" :severity="difficultySeverity" />
          <Tag :value="costLabel" />
        </div>
        <div class="flex gap-4 text-sm text-surface-500">
          <span v-if="recipe.preparationDuration">
            <i class="pi pi-clock mr-1"></i>Prépa {{ recipe.preparationDuration }} min
          </span>
          <span v-if="recipe.cookDuration">
            <i class="pi pi-clock mr-1"></i>Cuisson {{ recipe.cookDuration }} min
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '@/types/recipe'
import { CategoryLabels, Category } from '@/enums/category'
import { DifficultyLabels, Difficulty } from '@/enums/difficulty'
import { CostLabels, Cost } from '@/enums/cost'

const props = defineProps<{
  recipe: Recipe
}>()

const categoryLabel = computed(
  () => CategoryLabels[props.recipe.categoryCode as Category] || props.recipe.categoryCode
)
const difficultyLabel = computed(
  () =>
    DifficultyLabels[props.recipe.difficultyCode as Difficulty] || props.recipe.difficultyCode
)
const costLabel = computed(
  () => CostLabels[props.recipe.costCode as Cost] || props.recipe.costCode
)

const difficultySeverity = computed(() => {
  switch (props.recipe.difficultyCode) {
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
</script>
