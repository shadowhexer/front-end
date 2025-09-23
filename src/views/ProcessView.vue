<template>
    <div v-if="currentStep === 1" class="space-y-6">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Choose Processing Methods</h2>
            <p class="text-gray-600">Select the transformations and filters to apply</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
            <!-- Processing Controls -->
            <div class="lg:col-span-1 space-y-4">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Blur</label>
                            <input v-model="processingSettings.blur" type="range" min="0" max="10" class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Brightness</label>
                            <input v-model="processingSettings.brightness" type="range" min="-100" max="100"
                                class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contrast</label>
                            <input v-model="processingSettings.contrast" type="range" min="-100" max="100"
                                class="w-full">
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Effects</h3>
                    <div class="space-y-3">
                        <label class="flex items-center">
                            <input v-model="processingSettings.grayscale" type="checkbox"
                                class="rounded border-gray-300">
                            <span class="ml-2 text-sm text-gray-700">Grayscale</span>
                        </label>
                        <label class="flex items-center">
                            <input v-model="processingSettings.sepia" type="checkbox" class="rounded border-gray-300">
                            <span class="ml-2 text-sm text-gray-700">Sepia</span>
                        </label>
                        <label class="flex items-center">
                            <input v-model="processingSettings.invert" type="checkbox" class="rounded border-gray-300">
                            <span class="ml-2 text-sm text-gray-700">Invert Colors</span>
                        </label>
                    </div>
                </div>

                <button @click="applyProcessing" :disabled="isProcessing"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors">
                    {{ isProcessing ? 'Processing...' : 'Apply to All Images' }}
                </button>
            </div>

            <!-- Preview Area -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                    <div v-if="selectedPreviewImage" class="space-y-4">
                        <div class="flex justify-between items-center">
                            <select v-model="selectedPreviewIndex" class="border border-gray-300 rounded-lg px-3 py-2">
                                <option v-for="(image, index) in uploadedImages" :key="index" :value="index">
                                    {{ image.name }}
                                </option>
                            </select>
                            <button @click="currentStep = 2" class="text-green-600 hover:text-green-700 font-medium">
                                View All Results →
                            </button>
                        </div>
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden" style="height: 400px;">
                            <img :src="selectedPreviewImage.url" alt="Preview" class="w-full h-full object-contain">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>