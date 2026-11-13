<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Header />
  <Toast />
  <router-view></router-view>
  <Footer />
</template>

<style lang="scss">
#app {
  display: grid;
  width: 100%;
  min-height: 100vh;
  /* minmax(0, 1fr) : un contenu trop large ne doit pas élargir la colonne (et le header avec) */
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  padding: 0;
}
</style>
