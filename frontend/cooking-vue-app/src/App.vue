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
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  padding: 0;
}
</style>
