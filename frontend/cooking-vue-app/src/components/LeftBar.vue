<script setup lang="ts">
import { ref } from 'vue'
import { TagLabels } from '@/enums/tag'

const visible = ref(false)
const gererOpen = ref(true)
const categoriesOpen = ref(true)
const difficultyOpen = ref(true)
const costOpen = ref(true)
const tagsOpen = ref(false)

const tagEntries = Object.entries(TagLabels)
</script>

<template>
  <Drawer v-model:visible="visible">
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full">
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
        <div class="overflow-y-auto mt-4">
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
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
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
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
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
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
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
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
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
        <div class="mt-auto">
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
    </template>
  </Drawer>
  <Button @click="visible = true" class="burger-button" text>
    <i class="pi pi-bars burger-icon"></i>
  </Button>
</template>

<style lang="scss">
.burger-button {
  background: transparent !important;
  border: none !important;
  padding: 8px !important;
  box-shadow: none !important;
}

.burger-icon {
  color: white !important;
  font-size: 2.2rem !important;
}
</style>
