<template>
  <div class="p-4 max-w-3xl mx-auto">
    <BreadcrumbNav :segments="breadcrumbSegments" />
    <h1 class="text-2xl font-bold mb-6">
      {{ isEdit ? 'Modifier la recette' : 'Créer une recette' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <!-- Title -->
      <div class="flex flex-col gap-1">
        <label for="title" class="font-medium">Titre *</label>
        <InputText id="title" v-model="form.title" :class="{ 'p-invalid': errors.title }" />
        <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label for="description" class="font-medium">Description</label>
        <Textarea id="description" v-model="form.description" rows="3" />
      </div>

      <!-- Category, Difficulty, Cost -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label for="categoryCode" class="font-medium">Catégorie *</label>
          <Select
            id="categoryCode"
            v-model="form.categoryCode"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.categoryCode }"
          />
          <small v-if="errors.categoryCode" class="text-red-500">{{
            errors.categoryCode
          }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label for="difficultyCode" class="font-medium">Difficulté *</label>
          <Select
            id="difficultyCode"
            v-model="form.difficultyCode"
            :options="difficultyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.difficultyCode }"
          />
          <small v-if="errors.difficultyCode" class="text-red-500">{{
            errors.difficultyCode
          }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label for="costCode" class="font-medium">Coût *</label>
          <Select
            id="costCode"
            v-model="form.costCode"
            :options="costOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.costCode }"
          />
          <small v-if="errors.costCode" class="text-red-500">{{ errors.costCode }}</small>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-col gap-1">
        <label class="font-medium">Tags</label>
        <div class="flex flex-wrap gap-3">
          <label v-for="option in tagOptions" :key="option.value" class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :value="option.value"
              v-model="form.tags"
              class="accent-primary-500"
            />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </div>

      <!-- Servings -->
      <div class="flex flex-col gap-1">
        <label for="servings" class="font-medium">Nombre de personnes *</label>
        <input
          id="servings"
          v-model.number="form.servings"
          type="number"
          min="1"
          class="p-inputtext"
          :class="{ 'p-invalid': errors.servings }"
        />
        <small v-if="errors.servings" class="text-red-500">{{ errors.servings }}</small>
      </div>

      <!-- Durations -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label for="preparationDuration" class="font-medium">Préparation (min)</label>
          <input
            id="preparationDuration"
            v-model.number="form.preparationDuration"
            type="number"
            min="1"
            class="p-inputtext"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="cookDuration" class="font-medium">Cuisson (min)</label>
          <input
            id="cookDuration"
            v-model.number="form.cookDuration"
            type="number"
            min="1"
            class="p-inputtext"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="breakDuration" class="font-medium">Repos (min)</label>
          <input
            id="breakDuration"
            v-model.number="form.breakDuration"
            type="number"
            min="1"
            class="p-inputtext"
          />
        </div>
      </div>

      <!-- Image -->
      <div class="flex flex-col gap-1">
        <label class="font-medium">Image</label>
        <div
          class="image-dropzone"
          :class="{ 'has-image': imagePreview }"
          @click="triggerFileInput"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
          :style="{ borderColor: dragOver ? 'var(--color-primary-500)' : undefined }"
        >
          <template v-if="imagePreview">
            <img :src="imagePreview" alt="Aperçu" class="image-preview" />
            <button type="button" class="image-remove" @click.stop="removeImage">×</button>
          </template>
          <template v-else>
            <i class="pi pi-image text-4xl text-surface-400"></i>
            <span class="text-surface-500 mt-2">Glissez une image ou cliquez pour sélectionner</span>
          </template>
        </div>
        <small class="text-surface-400">JPEG, PNG ou WebP — 5 Mo max</small>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="onFileChange"
        />
      </div>

      <!-- Ingredients -->
      <div class="flex flex-col gap-2">
        <label class="font-medium">Ingrédients *</label>
        <small v-if="errors.ingredients" class="text-red-500">{{ errors.ingredients }}</small>
        <VueDraggable v-model="form.ingredients" handle=".drag-handle" :animation="200" ghostClass="drag-ghost" chosenClass="drag-chosen" class="flex flex-col gap-2">
          <div
            v-for="(ingredient, index) in form.ingredients"
            :key="index"
            class="flex gap-2 items-center"
          >
            <i class="pi pi-bars drag-handle cursor-grab text-surface-400"></i>
            <InputText
              v-model="form.ingredients[index].name"
              placeholder="Nom *"
              class="flex-1"
            />
            <input
              v-model.number="form.ingredients[index].quantity"
              type="number"
              min="0.01"
              step="any"
              placeholder="Qté"
              class="p-inputtext w-24"
            />
            <InputText v-model="form.ingredients[index].unit" placeholder="Unité" class="w-24" />
            <Button icon="pi pi-trash" severity="danger" text @click="removeIngredient(index)" />
          </div>
        </VueDraggable>
        <Button
          label="Ajouter un ingrédient"
          icon="pi pi-plus"
          severity="secondary"
          text
          @click="addIngredient"
        />
      </div>

      <!-- Steps -->
      <div class="flex flex-col gap-2">
        <label class="font-medium">Étapes</label>
        <VueDraggable v-model="form.steps" handle=".drag-handle" :animation="200" ghostClass="drag-ghost" chosenClass="drag-chosen" class="flex flex-col gap-2">
          <div v-for="(step, index) in form.steps" :key="index" class="flex gap-2">
            <i class="pi pi-bars drag-handle cursor-grab text-surface-400 mt-2"></i>
            <span class="font-medium mt-2 text-surface-500">{{ index + 1 }}.</span>
            <InputText v-model="form.steps[index]" class="flex-1" />
            <Button icon="pi pi-trash" severity="danger" text @click="removeStep(index)" />
          </div>
        </VueDraggable>
        <Button
          label="Ajouter une étape"
          icon="pi pi-plus"
          severity="secondary"
          text
          @click="addStep"
        />
      </div>

      <!-- Submit -->
      <div class="flex gap-2 mt-4">
        <Button
          type="submit"
          :label="isEdit ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          :loading="submitting"
        />
        <Button label="Annuler" severity="secondary" outlined @click="$router.back()" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels } from '@/enums/category'
import { DifficultyLabels } from '@/enums/difficulty'
import { CostLabels } from '@/enums/cost'
import { TagLabels } from '@/enums/tag'
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbSegment } from './BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const thumbnailFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const removeThumbnail = ref(false)

const recipeTitle = ref('')
const breadcrumbSegments = computed<BreadcrumbSegment[]>(() => {
  const segments: BreadcrumbSegment[] = [
    { label: 'Recettes', to: '/' },
  ]
  if (isEdit.value) {
    segments.push({ label: recipeTitle.value || '...', to: `/recipes/${route.params.id}` })
    segments.push({ label: 'Modifier' })
  } else {
    segments.push({ label: 'Nouvelle recette' })
  }
  return segments
})

const form = reactive({
  title: '',
  description: '',
  categoryCode: '',
  difficultyCode: '',
  costCode: '',
  tags: [] as string[],
  servings: null as number | null,
  preparationDuration: null as number | null,
  cookDuration: null as number | null,
  breakDuration: null as number | null,
  steps: [] as string[],
  ingredients: [] as { name: string; quantity: number | null; unit: string }[],
})

const errors = reactive({
  title: '',
  categoryCode: '',
  difficultyCode: '',
  costCode: '',
  servings: '',
  ingredients: '',
})

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({
  value,
  label,
}))
const difficultyOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({
  value,
  label,
}))
const costOptions = Object.entries(CostLabels).map(([value, label]) => ({ value, label }))
const tagOptions = Object.entries(TagLabels).map(([value, label]) => ({ value, label }))

function addIngredient() {
  form.ingredients.push({ name: '', quantity: null, unit: '' })
}

function removeIngredient(index: number) {
  form.ingredients.splice(index, 1)
}

function addStep() {
  form.steps.push('')
}

function removeStep(index: number) {
  form.steps.splice(index, 1)
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    thumbnailFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    removeThumbnail.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type.match(/^image\/(jpeg|png|webp)$/)) {
    thumbnailFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    removeThumbnail.value = false
  }
}

function removeImage() {
  thumbnailFile.value = null
  imagePreview.value = null
  removeThumbnail.value = true
  if (fileInput.value) fileInput.value.value = ''
}

function validate(): boolean {
  let valid = true
  errors.title = ''
  errors.categoryCode = ''
  errors.difficultyCode = ''
  errors.costCode = ''
  errors.servings = ''
  errors.ingredients = ''

  if (!form.title.trim()) {
    errors.title = 'Le titre est requis'
    valid = false
  }
  if (!form.categoryCode) {
    errors.categoryCode = 'La catégorie est requise'
    valid = false
  }
  if (!form.difficultyCode) {
    errors.difficultyCode = 'La difficulté est requise'
    valid = false
  }
  if (!form.costCode) {
    errors.costCode = 'Le coût est requis'
    valid = false
  }
  if (!form.servings || form.servings < 1) {
    errors.servings = 'Le nombre de personnes est requis'
    valid = false
  }
  const validIngredients = form.ingredients.filter((i) => i.name.trim())
  if (validIngredients.length === 0) {
    errors.ingredients = 'Au moins un ingrédient est requis'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('title', form.title)
    if (form.description) formData.append('description', form.description)
    formData.append('categoryCode', form.categoryCode)
    formData.append('difficultyCode', form.difficultyCode)
    formData.append('costCode', form.costCode)
    form.tags.forEach((tag) => formData.append('tags', tag))
    if (form.servings) formData.append('servings', String(form.servings))
    if (form.preparationDuration)
      formData.append('preparationDuration', String(form.preparationDuration))
    if (form.cookDuration) formData.append('cookDuration', String(form.cookDuration))
    if (form.breakDuration) formData.append('breakDuration', String(form.breakDuration))
    const validIngredients = form.ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name.trim(),
        ...(i.quantity ? { quantity: i.quantity } : {}),
        ...(i.unit?.trim() ? { unit: i.unit.trim() } : {}),
      }))
    formData.append('ingredients', JSON.stringify(validIngredients))
    form.steps.filter((s) => s.trim()).forEach((step) => formData.append('steps', step))
    if (thumbnailFile.value) formData.append('thumbnail', thumbnailFile.value)
    if (removeThumbnail.value && !thumbnailFile.value) {
      formData.append('thumbnail', '')
    }

    if (isEdit.value) {
      await RecipeService.updateRecipe(route.params.id as string, formData)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Recette modifiée',
        life: 3000,
      })
    } else {
      await RecipeService.createRecipe(formData)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Recette créée',
        life: 3000,
      })
    }
    router.push('/')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder la recette',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const recipe = await RecipeService.getRecipe(route.params.id as string)
      form.title = recipe.title
      recipeTitle.value = recipe.title
      form.description = recipe.description || ''
      form.categoryCode = recipe.categoryCode
      form.difficultyCode = recipe.difficultyCode
      form.costCode = recipe.costCode
      form.tags = recipe.tags || []
      form.servings = recipe.servings || null
      form.preparationDuration = recipe.preparationDuration || null
      form.cookDuration = recipe.cookDuration || null
      form.breakDuration = recipe.breakDuration || null
      form.steps = recipe.steps || []
      form.ingredients = (recipe.ingredients || [])
        .filter((i) => i != null)
        .map((i) => ({
          name: i.name,
          quantity: i.quantity || null,
          unit: i.unit || '',
        }))
      if (recipe.thumbnail) {
        imagePreview.value = `http://localhost:3000${recipe.thumbnail}`
      }
    } catch (e) {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Recette non trouvée',
        life: 3000,
      })
      router.push('/')
    }
  }
})
</script>

<style scoped>
.image-dropzone {
  border: 2px dashed var(--color-surface-300);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
  min-height: 150px;
}
.image-dropzone:hover { border-color: var(--color-primary-500); }
.image-dropzone.has-image { padding: 8px; }
.image-preview { max-height: 200px; border-radius: 6px; object-fit: cover; }
.image-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-remove:hover { background: rgba(0, 0, 0, 0.8); }
.drag-handle { cursor: grab; }
.drag-handle:active { cursor: grabbing; }
.drag-ghost { opacity: 0.4; }
.drag-chosen { background-color: var(--color-surface-100); border-radius: 6px; }
</style>
