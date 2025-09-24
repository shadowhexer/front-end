import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePageStore = defineStore('page', () => {
  const page = ref(0)
  
  function setPage(pageNumber: number) {
    page.value = pageNumber
  }

  function nextPage() {
    page.value++
  }

  function prevPage() {
    if (page.value > 1) page.value--
  }

  return { page, setPage, nextPage, prevPage }
})
