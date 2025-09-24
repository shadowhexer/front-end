<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import UploadView from './UploadView.vue'
import ProcessView from './ProcessView.vue'
import ResultsView from './ResultsView.vue'
import CompareView from './CompareView.vue'
import { usePageStore } from '@/stores/page'

const currentPage = usePageStore()
const processedImages = ref([])

const steps = ['Upload', 'Process', 'Results', 'Compare']

const exportImages = () => {
    // In real app, export all processed images
    console.log('Exporting all processed images')
}

</script>
<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <Header :processed-images="processedImages" :export="exportImages" />
        </header>

        <!-- Progress Steps -->
        <div class="bg-white border-b">
            <div class="w-full px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center space-x-4">
                    <div v-for="(step, index) in steps" :key="index" class="flex items-center">
                        <div class="flex items-center space-x-2">
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                                currentPage.page > index ? 'bg-green-600 text-white' :
                                    currentPage.page === index ? 'bg-green-100 text-green-600 border-2 border-green-600' :
                                        'bg-gray-200 text-gray-500'
                            ]">
                                {{ index + 1 }}
                            </div>
                            <span :class="[
                                'text-sm font-medium',
                                currentPage.page >= index ? 'text-gray-900' : 'text-gray-500'
                            ]">
                                {{ step }}
                            </span>
                        </div>
                        <svg v-if="index < steps.length - 1" class="w-5 h-5 text-gray-300 mx-4" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="w-full px-4 sm:px-6 lg:px-8 py-8">

            <RouterView />
        </main>
    </div>
    
</template>