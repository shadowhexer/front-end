import { ref } from 'vue'
import { defineStore } from 'pinia'

// Not final

export const useFetchStore = defineStore('fetch', () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const data = ref<any>(null)
    
    async function fetchData(url: string) {
        isLoading.value = true
        error.value = null
        data.value = null
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            data.value = await response.json()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'An unknown error occurred'
        } finally {
            isLoading.value = false
        }
    }

    return { isLoading, error, data, fetchData }
})