<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LeftBar from './LeftBar.vue'

const router = useRouter()
const searchTitle = ref('')

function search() {
  const query: Record<string, string> = {}
  if (searchTitle.value.trim()) {
    query.title = searchTitle.value.trim()
  }
  router.push({ path: '/', query })
}
</script>

<template>
  <header>
    <div class="header-left">
      <LeftBar />
      <img class="application-logo" src="./icons/cooking-icon.png" width="60px" height="60px" />
      <span class="application-name">Cooking App</span>
    </div>
    <div class="header-search">
      <InputText
        v-model="searchTitle"
        placeholder="Rechercher une recette..."
        class="search-input"
        @keyup.enter="search"
      />
      <Button icon="pi pi-search" @click="search" class="search-button" />
    </div>
  </header>
</template>

<style lang="scss">
header {
  display: flex;
  background-color: #3eb9a1;
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
  color: #3eb9a1 !important;
  border: none !important;
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
</style>