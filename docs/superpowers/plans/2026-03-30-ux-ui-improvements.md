# UX/UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve UX/UI across 4 axes: design system centralization, LeftBar scrollbar fix, breadcrumb navigation, and form improvements (upload, drag-and-drop, validation).

**Architecture:** Frontend-only changes in the Vue 3 SPA. Recalculate Tailwind theme palette around `#3eb9a1`, replace all hardcoded colors, fix LeftBar layout, add a `BreadcrumbNav` component, and enhance `RecipeForm` with styled upload, drag-and-drop (vue-draggable-plus), and blur validation.

**Tech Stack:** Vue 3.5, PrimeVue 4, Tailwind CSS 4, vue-draggable-plus, Cypress

**Spec:** `docs/superpowers/specs/2026-03-30-ux-ui-improvements-design.md`

---

## Chunk 1: Design System

### Task 1: Recalculate Tailwind theme palette and clean up style.css

**Files:**
- Modify: `frontend/cooking-vue-app/src/style.css`

- [ ] **Step 1: Replace the `@theme` block with the correct teal palette based on `#3eb9a1`**

Replace the `@theme` block (lines 5-29) in `src/style.css` with a palette generated around `#3eb9a1` as primary-500:

```css
@theme {
    --color-primary-50: rgb(240 253 250);
    --color-primary-100: rgb(204 245 235);
    --color-primary-200: rgb(153 235 215);
    --color-primary-300: rgb(94 218 191);
    --color-primary-400: rgb(62 199 172);
    --color-primary-500: rgb(62 185 161);
    --color-primary-600: rgb(45 152 133);
    --color-primary-700: rgb(36 121 107);
    --color-primary-800: rgb(30 96 86);
    --color-primary-900: rgb(25 78 70);
    --color-primary-950: rgb(12 44 40);
    --color-surface-0: rgb(255 255 255);
    --color-surface-50: rgb(249 250 251);
    --color-surface-100: rgb(243 244 246);
    --color-surface-200: rgb(229 231 235);
    --color-surface-300: rgb(209 213 219);
    --color-surface-400: rgb(156 163 175);
    --color-surface-500: rgb(107 114 128);
    --color-surface-600: rgb(75 85 99);
    --color-surface-700: rgb(55 65 81);
    --color-surface-800: rgb(31 41 55);
    --color-surface-900: rgb(17 24 39);
    --color-surface-950: rgb(8 8 8);
}
```

- [ ] **Step 2: Remove the duplicate `:root` RGB variables block**

Delete lines 31-61 (the `:root` block containing `--primary-50` through `--surface-950` in bare RGB format). These duplicate the `@theme` values and are not referenced anywhere.

The remaining `:root` blocks (lines 63-77 — semantic variables like `--body-bg`, `--card-bg`, dark mode) use `--surface-*` which are still provided by the `@theme` block via Tailwind, so they remain valid.

- [ ] **Step 3: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/cooking-vue-app/src/style.css
git commit -m "refactor(frontend): recalculate Tailwind theme palette around #3eb9a1"
```

---

### Task 2: Delete dead CSS files (base.css, main.css)

**Files:**
- Delete: `frontend/cooking-vue-app/src/assets/base.css`
- Delete: `frontend/cooking-vue-app/src/assets/main.css`

- [ ] **Step 1: Delete the unused CSS files**

Neither `base.css` nor `main.css` is imported in the app — they are leftover from the Vue scaffold. `main.ts` imports `./style.css` instead. Delete both files.

```bash
rm frontend/cooking-vue-app/src/assets/base.css frontend/cooking-vue-app/src/assets/main.css
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add -u frontend/cooking-vue-app/src/assets/
git commit -m "chore(frontend): remove unused base.css and main.css (Vue scaffold leftovers)"
```

---

### Task 3: Replace hardcoded #3eb9a1 in Header.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/Header.vue`

- [ ] **Step 1: Replace all hardcoded colors with Tailwind classes and CSS variables**

Replace the entire `<style lang="scss">` block in `Header.vue` with `<style lang="scss">` (keep the lang attribute):

```scss
header {
  display: flex;
  background-color: var(--color-primary-500);
  width: 100%;
  align-items: center;
  padding: 10px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-search {
  display: flex;
  flex: 1;
  max-width: 700px;
  margin-left: 40px;
  gap: 8px;
}

.search-input {
  flex: 1;
}

.search-button {
  background-color: white !important;
  color: var(--color-primary-500) !important;
  border: none !important;
}

.filter-toggle-button {
  background-color: white !important;
  color: var(--color-primary-500) !important;
  border: none !important;
}

.filter-toggle-button.active {
  background-color: var(--color-primary-500) !important;
  color: white !important;
  border: 2px solid white !important;
}

.application-logo {
  padding: 10px;
}

.application-name {
  text-align: left;
  color: white;
  font-size: 35px;
  padding-left: 10px;
}

@media (max-width: 640px) {
  .application-name {
    display: none;
  }

  .header-search {
    max-width: none;
  }
}
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/Header.vue
git commit -m "refactor(frontend): replace hardcoded #3eb9a1 with CSS variables in Header"
```

---

### Task 4: Replace hardcoded #3EB9A1 in Footer.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/Footer.vue`

- [ ] **Step 1: Replace the hardcoded color**

Replace the `<style>` block in `Footer.vue`:

```scss
footer {
    background-color: var(--color-primary-500);
    width: 100%;
    align-items: center;
    text-align: center;
    padding: 10px;
    color: white;
}
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/Footer.vue
git commit -m "refactor(frontend): replace hardcoded color with CSS variable in Footer"
```

---

### Task 5: Replace hardcoded #3eb9a1 in RecipeCard.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeCard.vue`

- [ ] **Step 1: Replace the `.tag-custom` style**

Replace the `<style scoped>` block:

```css
.tag-custom {
  background-color: var(--color-primary-500) !important;
  color: white !important;
}
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeCard.vue
git commit -m "refactor(frontend): replace hardcoded color with CSS variable in RecipeCard"
```

---

### Task 6: Replace hardcoded #3eb9a1 in RecipeDetail.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeDetail.vue`

- [ ] **Step 1: Replace the scoped styles**

Replace the `<style scoped>` block:

```css
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
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeDetail.vue
git commit -m "refactor(frontend): replace hardcoded color with CSS variable in RecipeDetail"
```

---

### Task 7: Replace hardcoded #3eb9a1 in SearchRecipes.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/SearchRecipes.vue`

- [ ] **Step 1: Replace the scoped styles**

In the `<style scoped>` block, replace only the color-related rules. The full updated block:

```css
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/cooking-vue-app/src/components/SearchRecipes.vue
git commit -m "refactor(frontend): replace hardcoded color with CSS variable in SearchRecipes"
```

---

### Task 8: Replace hardcoded #3eb9a1 in RecipeForm.vue

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Replace the accent color on tag checkboxes**

In `RecipeForm.vue` template (line 77), replace:
```html
class="accent-[#3eb9a1]"
```
with:
```html
class="accent-primary-500"
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "refactor(frontend): replace hardcoded color with Tailwind class in RecipeForm"
```

---

### Task 9: Verify no remaining hardcoded #3eb9a1

- [ ] **Step 1: Search for any remaining instances**

Run: `grep -r "#3eb9a1\|#3EB9A1" frontend/cooking-vue-app/src/`
Expected: No matches found.

- [ ] **Step 2: Run full build**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds with no errors.

---

## Chunk 2: LeftBar Fix & Navigation

### Task 10: Fix LeftBar multiple scrollbars

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/LeftBar.vue`

- [ ] **Step 1: Restructure the Drawer content layout**

The current LeftBar has 5 separate `<div class="overflow-y-auto mt-4">` wrappers (lines 35, 71, 147, 213, 259) — each creating its own scrollbar. Replace the entire `<template #container>` content with a single-scroll structure.

Replace the content inside `<template #container="{ closeCallback }">` (lines 18-308) with:

```html
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-4 shrink-0">
          <span class="inline-flex items-center gap-2">
            <img src="./icons/cooking-icon-sidebar.png" width="30px" height="30px" />
            <span class="font-semibold text-2xl text-primary">Cooking app</span>
          </span>
          <span>
            <Button
              type="button"
              @click="closeCallback"
              icon="pi pi-times"
              rounded
              outlined
              class="h-8 w-8"
            ></Button>
          </span>
        </div>

        <!-- Scrollable content — single scrollbar -->
        <div class="flex-1 overflow-y-auto mt-4">
          <!-- Gérer -->
          <ul class="list-none px-4 m-0">
            <li>
              <div
                v-ripple
                @click="gererOpen = !gererOpen"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Gérer</span>
                <i :class="gererOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              </div>
              <ul v-show="gererOpen" class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link
                    to="/"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-search mr-2"></i>
                    <span class="font-medium">Rechercher des recettes</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="/recipes/create"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-plus mr-2"></i>
                    <span class="font-medium">Créer une recette</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Catégories -->
          <ul class="list-none px-4 m-0 mt-4">
            <li>
              <div
                v-ripple
                @click="categoriesOpen = !categoriesOpen"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Catégories</span>
                <i :class="categoriesOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              </div>
              <ul v-show="categoriesOpen" class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'APERITIF' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Apéritifs</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'ENTREE' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Entrées</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'PLAT' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Plats</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'DESSERT' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Desserts</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'BOISSON' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Boissons</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { categoryCode: 'DEJ_BRUNCH' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Petit-déj / Brunch</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Difficulté -->
          <ul class="list-none px-4 m-0 mt-4">
            <li>
              <div
                v-ripple
                @click="difficultyOpen = !difficultyOpen"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Difficulté</span>
                <i :class="difficultyOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              </div>
              <ul v-show="difficultyOpen" class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link
                    :to="{ path: '/', query: { difficultyCode: 'EASY' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Facile</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { difficultyCode: 'MIDDLE' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Moyen</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { difficultyCode: 'HARD' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Difficile</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { difficultyCode: 'VERY_HARD' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Très difficile</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { difficultyCode: 'EXPERT' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Expert</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Coût -->
          <ul class="list-none px-4 m-0 mt-4">
            <li>
              <div
                v-ripple
                @click="costOpen = !costOpen"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Coût</span>
                <i :class="costOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              </div>
              <ul v-show="costOpen" class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link
                    :to="{ path: '/', query: { costCode: 'CHEAP' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Bon marché</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { costCode: 'MIDDLE' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Moyen</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ path: '/', query: { costCode: 'EXPENSIVE' } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Coûteux</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Tags -->
          <ul class="list-none px-4 m-0 mt-4">
            <li>
              <div
                v-ripple
                @click="tagsOpen = !tagsOpen"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Tags</span>
                <i :class="tagsOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              </div>
              <ul v-show="tagsOpen" class="list-none p-0 m-0 overflow-hidden">
                <li v-for="[code, label] in tagEntries" :key="code">
                  <router-link
                    :to="{ path: '/', query: { tags: code } }"
                    @click="visible = false"
                    class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline"
                  >
                    <i class="pi pi-tag mr-2"></i>
                    <span class="font-medium">{{ label }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- Footer — sticky bottom -->
        <div class="shrink-0">
          <hr
            class="mb-3 mx-3 border-t-1 border-none border-surface-200 dark:border-surface-700"
          />
          <ul class="list-none p-0 m-0 overflow-hidden">
            <li>
              <a
                v-ripple
                class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors"
              >
                <i class="pi pi-cog mr-2"></i>
                <span class="font-medium">Paramètres</span>
              </a>
            </li>
          </ul>
          <a
            v-ripple
            class="m-3 flex items-center cursor-pointer p-3 gap-2 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors"
          >
            <Avatar image="src/assets/profile-picture.png" shape="circle" />
            <span class="font-bold">Dimitri Fernandez</span>
          </a>
        </div>
      </div>
```

Key changes:
- Replaced 5 `<div class="overflow-y-auto mt-4">` wrappers with a single `<div class="flex-1 overflow-y-auto mt-4">` containing all sections
- Each section `<ul>` now uses `mt-4` for spacing instead of being wrapped in its own scrollable div
- Footer div changed from `mt-auto` to `shrink-0` — with the flex-1 scrollable area above it, the footer stays pinned at the bottom naturally

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/LeftBar.vue
git commit -m "fix(frontend): fix multiple scrollbars in LeftBar — single scroll with sticky footer"
```

---

### Task 11: Create BreadcrumbNav component

**Files:**
- Create: `frontend/cooking-vue-app/src/components/BreadcrumbNav.vue`

- [ ] **Step 1: Create the BreadcrumbNav component**

Create `frontend/cooking-vue-app/src/components/BreadcrumbNav.vue`:

```vue
<script setup lang="ts">
export interface BreadcrumbSegment {
  label: string
  to?: string
}

defineProps<{
  segments: BreadcrumbSegment[]
}>()
</script>

<template>
  <nav v-if="segments.length > 0" class="breadcrumb-nav">
    <template v-for="(segment, index) in segments" :key="index">
      <router-link
        v-if="index === 0 && segment.to"
        :to="segment.to"
        class="breadcrumb-link breadcrumb-back"
      >
        ← {{ segment.label }}
      </router-link>
      <router-link
        v-else-if="segment.to"
        :to="segment.to"
        class="breadcrumb-link"
      >
        {{ segment.label }}
      </router-link>
      <span v-else class="breadcrumb-current">{{ segment.label }}</span>
      <span v-if="index < segments.length - 1" class="breadcrumb-separator">›</span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}

.breadcrumb-link {
  color: var(--color-primary-500);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--color-surface-500);
}

.breadcrumb-separator {
  color: var(--color-surface-300);
}
</style>
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/BreadcrumbNav.vue
git commit -m "feat(frontend): add BreadcrumbNav component with back arrow navigation"
```

---

### Task 12: Integrate BreadcrumbNav in RecipeDetail

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeDetail.vue`

- [ ] **Step 1: Add the import and computed breadcrumb segments**

In the `<script setup>` section, add:

```typescript
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbSegment } from './BreadcrumbNav.vue'
```

Add after the `categoryLabel` computed (line 144):

```typescript
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
```

- [ ] **Step 2: Add the BreadcrumbNav to the template**

In the template, add the breadcrumb just inside the `<div v-else-if="recipe">` block, before the header div:

```html
    <div v-else-if="recipe">
      <BreadcrumbNav :segments="breadcrumbSegments" />

      <!-- Header -->
```

- [ ] **Step 3: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeDetail.vue
git commit -m "feat(frontend): add breadcrumb navigation to RecipeDetail"
```

---

### Task 13: Integrate BreadcrumbNav in RecipeForm

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Add the import and computed breadcrumb segments**

In the `<script setup>` section, add the imports:

```typescript
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbSegment } from './BreadcrumbNav.vue'
```

Add after the `imagePreview` ref (line 226):

```typescript
const recipeTitle = ref('')
const breadcrumbSegments = computed<BreadcrumbSegment[]>(() => {
  const segments: BreadcrumbSegment[] = [
    { label: 'Recettes', to: '/' },
  ]
  if (isEdit.value) {
    segments.push({ label: recipeTitle.value || '...' })
    segments.push({ label: 'Modifier' })
  } else {
    segments.push({ label: 'Nouvelle recette' })
  }
  return segments
})
```

- [ ] **Step 2: Set recipeTitle when loading an existing recipe**

In the `onMounted` callback, after `form.title = recipe.title` (line 387), add:

```typescript
      recipeTitle.value = recipe.title
```

- [ ] **Step 3: Add the BreadcrumbNav to the template**

Add the breadcrumb after the opening `<div class="p-4 max-w-3xl mx-auto">` and before the `<h1>`:

```html
  <div class="p-4 max-w-3xl mx-auto">
    <BreadcrumbNav :segments="breadcrumbSegments" />

    <h1 class="text-2xl font-bold mb-6">
```

- [ ] **Step 4: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add breadcrumb navigation to RecipeForm"
```

---

## Chunk 3: Form Improvements

### Task 14: Install vue-draggable-plus

**Files:**
- Modify: `frontend/cooking-vue-app/package.json`

- [ ] **Step 1: Install the dependency**

```bash
cd frontend/cooking-vue-app && npm install vue-draggable-plus
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

Note: `package-lock.json` is excluded from git (private registry), so only stage `package.json`.

```bash
git add frontend/cooking-vue-app/package.json
git commit -m "chore(frontend): add vue-draggable-plus dependency for drag-and-drop"
```

---

### Task 15: Add styled image upload to RecipeForm

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Replace the image upload section in the template**

Replace the `<!-- Image -->` section (lines 132-142) with:

```html
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
```

- [ ] **Step 2: Add the supporting refs and methods in the script**

Add the refs after `imagePreview` (line 226):

```typescript
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const removeThumbnail = ref(false)
```

Add the methods after `onFileChange` (line 286):

```typescript
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
```

In the `handleSubmit` function, add after the `if (thumbnailFile.value)` line:

```typescript
    if (removeThumbnail.value && !thumbnailFile.value) {
      formData.append('thumbnail', '')
    }
```

This signals the backend to clear the thumbnail field when the user removes an existing image in edit mode without uploading a new one.

- [ ] **Step 3: Add the styles**

Add a `<style scoped>` block (or append to existing if one was created):

```css
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

.image-dropzone:hover {
  border-color: var(--color-primary-500);
}

.image-dropzone.has-image {
  padding: 8px;
}

.image-preview {
  max-height: 200px;
  border-radius: 6px;
  object-fit: cover;
}

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

.image-remove:hover {
  background: rgba(0, 0, 0, 0.8);
}
```

- [ ] **Step 4: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add styled image upload with drag-and-drop and preview"
```

---

### Task 16: Add drag-and-drop reordering for ingredients

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Import VueDraggable**

Add the import in the `<script setup>`:

```typescript
import { VueDraggable } from 'vue-draggable-plus'
```

- [ ] **Step 2: Replace the ingredients list in the template**

Replace the ingredients `<div v-for>` loop (lines 148-168) with:

```html
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
```

- [ ] **Step 3: Add the drag-handle style**

Add to the `<style scoped>`:

```css
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-ghost {
  opacity: 0.4;
}

.drag-chosen {
  background-color: var(--color-surface-100);
  border-radius: 6px;
}
```

- [ ] **Step 4: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add drag-and-drop reordering for ingredients"
```

---

### Task 17: Add drag-and-drop reordering for steps

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Replace the steps list in the template**

Replace the steps `<div v-for>` loop (lines 181-185) with:

```html
        <VueDraggable v-model="form.steps" handle=".drag-handle" :animation="200" ghostClass="drag-ghost" chosenClass="drag-chosen" class="flex flex-col gap-2">
          <div v-for="(step, index) in form.steps" :key="index" class="flex gap-2 items-center">
            <i class="pi pi-bars drag-handle cursor-grab text-surface-400"></i>
            <span class="font-medium mt-2 text-surface-500">{{ index + 1 }}.</span>
            <InputText v-model="form.steps[index]" class="flex-1" />
            <Button icon="pi pi-trash" severity="danger" text @click="removeStep(index)" />
          </div>
        </VueDraggable>
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add drag-and-drop reordering for steps"
```

---

### Task 18: Add blur validation and disabled submit

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Add field-level validation functions**

Add after the `validate()` function:

```typescript
function validateField(field: keyof typeof errors) {
  switch (field) {
    case 'title':
      errors.title = form.title.trim() ? '' : 'Le titre est requis'
      break
    case 'categoryCode':
      errors.categoryCode = form.categoryCode ? '' : 'La catégorie est requise'
      break
    case 'difficultyCode':
      errors.difficultyCode = form.difficultyCode ? '' : 'La difficulté est requise'
      break
    case 'costCode':
      errors.costCode = form.costCode ? '' : 'Le coût est requis'
      break
    case 'servings':
      errors.servings = form.servings && form.servings >= 1 ? '' : 'Le nombre de personnes est requis'
      break
    case 'ingredients':
      errors.ingredients = form.ingredients.some((i) => i.name.trim())
        ? ''
        : 'Au moins un ingrédient est requis'
      break
  }
}

const isFormValid = computed(() => {
  return (
    form.title.trim() !== '' &&
    form.categoryCode !== '' &&
    form.difficultyCode !== '' &&
    form.costCode !== '' &&
    form.servings !== null &&
    form.servings >= 1 &&
    form.ingredients.some((i) => i.name.trim())
  )
})
```

- [ ] **Step 2: Add @blur and @change handlers to template fields**

Add `@blur="validateField('title')"` attribute to the title `InputText` (the one with `id="title"`).

Add `@change="validateField('categoryCode')"` attribute to the category `Select` (the one with `id="categoryCode"`).

Add `@change="validateField('difficultyCode')"` attribute to the difficulty `Select` (the one with `id="difficultyCode"`).

Add `@change="validateField('costCode')"` attribute to the cost `Select` (the one with `id="costCode"`).

Add `@blur="validateField('servings')"` attribute to the servings `input` (the one with `id="servings"`).

Add `@blur="validateField('ingredients')"` attribute to the ingredient name `InputText` inside the `VueDraggable` (the one with `placeholder="Nom *"`).

- [ ] **Step 3: Disable the submit button when form is invalid**

Replace the submit button:
```html
        <Button
          type="submit"
          :label="isEdit ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          :loading="submitting"
          :disabled="!isFormValid"
        />
```

- [ ] **Step 4: Verify the app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add blur validation and disabled submit button"
```

---

### Task 19: Final verification

- [ ] **Step 1: Run full build**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run existing tests**

Run: `cd frontend/cooking-vue-app && npm run test:unit`
Expected: All existing tests pass.

- [ ] **Step 3: Run linter**

Run: `cd frontend/cooking-vue-app && npm run lint`
Expected: No errors.
