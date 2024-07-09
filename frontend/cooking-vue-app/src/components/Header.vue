<script setup lang="ts">
import LeftBar from './LeftBar.vue';
</script>

<template>
    <header>
        <LeftBar />
        <img class="application-logo" src="./icons/cooking-icon.png" width="60px" height="60px">
        <span class="application-name">Cooking App</span>
    </header>
</template>


<style lang="scss">

header {
  display: flex;
  background-color: #3EB9A1;
  width: 100%;
  align-items: center;
  text-align: center;
  padding: 10px;
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

</style>