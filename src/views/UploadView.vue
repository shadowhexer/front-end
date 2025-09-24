<script setup lang="ts">
import Preview from "../components/UploadPreview.vue"
import { ref, reactive } from 'vue'
import { usePageStore } from '@/stores/page';

const currentPage = usePageStore()

const uploadedImages = reactive<Array<{ name: string; url: string | ArrayBuffer | null; file: File }>>([]);
const isDragging = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)

const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : []
    processFiles.onFileSelected(files)
}


const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files ? Array.from(target.files) : []
    processFiles.onFileSelected(files)
}

const processFiles = reactive({
    triggerFileInput() {
        if (fileInput.value) {
            fileInput.value.click();
        }
    },

    onFileSelected(files: File[]) {

        files.forEach(file => {

            // Optional: handle file upload logic here, like sending it to a server
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                // When the file is loaded
                reader.onload = (e) => {
                    const base64Image = reader.result as string;

                    // Update the image URL to show it on the card
                    uploadedImages.push({
                        name: file.name,
                        url: e.target && (e.target as FileReader).result,
                        file: file
                    })

                };
                reader.readAsDataURL(file); // Convert to Base64 if needed
            }
        })
    }
});

const removeImage = (index: number) => {
    uploadedImages.splice(index, 1)
}
</script>

<template>
    <!-- Step 1: Upload -->
    <div v-if="currentPage.page === 0" class="max-w-2xl mx-auto md:mx-0">
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
            <button @click="fileInput && fileInput.click()"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                Choose Files
            </button>
        </div>
        <!-- Uploaded Images Preview -->
        <Preview :uploaded-images="uploadedImages" :remove-image="removeImage" />
    </div>
</template>