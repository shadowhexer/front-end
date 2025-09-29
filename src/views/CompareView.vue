<script setup lang="ts">
// @ts-nocheck
</script>

<template>
    <div v-if="currentStep === 3 && selectedImage" class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ selectedImage.name }}</h2>
                <p class="text-gray-600">Compare original vs processed</p>
            </div>
            <div class="flex space-x-2">
                <button @click="currentStep = 2"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                    ← Back to Grid
                </button>
                <button @click="downloadImage(selectedImage)"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    Download
                </button>
            </div>
        </div>

        <!-- Comparison Slider -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="relative overflow-hidden rounded-lg" style="height: 500px;">
                <img :src="selectedImage.originalUrl" alt="Original"
                    class="absolute inset-0 w-full h-full object-contain">
                <div class="absolute inset-0 overflow-hidden"
                    :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
                    <img :src="selectedImage.processedUrl" alt="Processed" class="w-full h-full object-contain">
                </div>

                <!-- Slider -->
                <div class="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    :style="{ left: `${sliderPosition}%` }" @mousedown="startDragging">
                    <div
                        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Labels -->
            <div class="flex justify-between mt-4 text-sm text-gray-600">
                <span>Original</span>
                <span>Processed</span>
            </div>
        </div>
    </div>
</template>