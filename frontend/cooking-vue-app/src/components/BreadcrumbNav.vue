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
