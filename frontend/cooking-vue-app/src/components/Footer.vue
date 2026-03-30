<template>
    <footer>
        <p>{{ footerText }}</p>
    </footer>
</template>

<script setup lang="ts">
const footerText = `© ${new Date().getFullYear()} Cooking App — Tous droits réservés`
</script>

<style lang="scss">
footer {
    background-color: var(--color-primary-500);
    width: 100%;
    align-items: center;
    text-align: center;
    padding: 10px;
    color: white;
}
</style>
