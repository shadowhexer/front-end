<script setup lang="ts">
// @ts-nocheck
</script>

<template>
    <div v-if="currentStep === 2" class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Processing Results</h2>
            <p class="text-gray-600">{{ processedImages.length }} images processed</p>
          </div>
          <button 
            @click="currentStep = 3"
            v-if="selectedImage"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            View Selected Image
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="(image, index) in processedImages" 
            :key="index"
            @click="selectImage(index)"
            :class="[
              'relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
              selectedImageIndex === index ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <img :src="image.processedUrl" :alt="image.name" class="w-full h-32 object-cover">
            <div class="absolute top-2 left-2">
              <div :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center',
                selectedImageIndex === index ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
              ]">
                <svg v-if="selectedImageIndex === index" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
              <p class="text-xs truncate">{{ image.name }}</p>
            </div>
          </div>
        </div>
      </div>
</template>