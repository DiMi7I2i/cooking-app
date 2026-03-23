import { ref } from 'vue'

const showFilters = ref(true)
const filtersActive = ref(false)

export function useFilters() {
  function toggleFilters() {
    showFilters.value = !showFilters.value
  }

  return {
    showFilters,
    filtersActive,
    toggleFilters,
  }
}
