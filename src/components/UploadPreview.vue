<script setup lang="ts">
import router from '@/router';
import { usePageStore } from '@/stores/page';
import { useFetchStore } from "@/stores/fetch";

const currentPage = usePageStore()
const fetchStore = useFetchStore()
const uploadedImages = fetchStore.uploadedImages

defineProps<{
    removeImage: (index: number) => void
}>();

const next = ()=>{
    fetchStore.fileUpload()
    currentPage.nextPage()
    router.push('/process')
}

</script>

<template>
    <div v-if="uploadedImages && uploadedImages.length > 0" class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Uploaded Images ({{uploadedImages ? uploadedImages.length : 0 }})</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <div v-for="(image, index) in uploadedImages" :key="index" class="relative group">
                <img :src="typeof image.url === 'string' ? image.url : undefined" :alt="image.name" class="w-full h-24 object-cover rounded-lg">
                <button @click="removeImage(index)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                </button>
            </div>
        </div>
        <button @click="next"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer">
            Proceed to Processing →
        </button>
    </div>
</template>