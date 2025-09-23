<template>
    <!-- Step 1: Upload -->
    <div v-if="currentStep === 0" class="max-w-2xl mx-auto md:mx-0">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Upload Your Images</h2>
            <p class="text-gray-600">Select one or multiple images to get started with processing</p>
        </div>

        <div @drop="handleDrop" @dragover.prevent @dragenter.prevent :class="[
            'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
            isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'
        ]">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-lg font-medium text-gray-900 mb-2">Drop images here or click to browse</p>
            <p class="text-gray-500 mb-4">Supports PNG, JPG, JPEG, WebP up to 10MB each</p>
            <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect" class="hidden">
            <button @click="$refs.fileInput.click()"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                Choose Files
            </button>
        </div>

        <!-- Uploaded Images Preview -->
        <div v-if="uploadedImages.length > 0" class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Uploaded Images ({{ uploadedImages.length }})</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                <div v-for="(image, index) in uploadedImages" :key="index" class="relative group">
                    <img :src="image.url" :alt="image.name" class="w-full h-24 object-cover rounded-lg">
                    <button @click="removeImage(index)"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                    </button>
                </div>
            </div>
            <button @click="proceedToProcessing"
                class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                Proceed to Processing →
            </button>
        </div>
    </div>
</template>