<script setup lang="ts">
import Preview from "../components/UploadPreview.vue"
import { ref, reactive } from 'vue'
import { usePageStore } from '@/stores/page';
import { useFetchStore } from "@/stores/fetch";

const currentPage = usePageStore()
const fetchStore = useFetchStore()

const isDragging = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)

const handleDragOver = (event: DragEvent) => {
    isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
    isDragging.value = false;
};

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
                    const dataUrl = e.target && (e.target as FileReader).result;

                    // Update the image URL to show it on the card
                    fetchStore.uploadedImages.push({
                        name: file.name,
                        url: dataUrl
                    })

                };
                reader.readAsDataURL(file); // Convert to Base64 if needed
            }
        })
    }
});

const removeImage = (index: number) => {
    fetchStore.uploadedImages.splice(index, 1)
}
</script>

<template>
    <!-- Step 1: Upload -->
    <div v-if="currentPage.page === 0" class="flex flex-col xl:px-[25rem] md:mx-0">
        <div class="text-center py-10">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Upload Your Images</h2>
            <p class="text-gray-600">Select one or multiple images to get started with processing</p>
        </div>

        <div @drop="handleDrop" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @dragenter.prevent
            :class="[
                'border-2 border-dashed rounded-lg p-20 m-20 text-center transition-colors',
                isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'
            ]">

            <div v-if="isDragging == false">
                <p class="text-lg font-medium text-gray-900 mb-2">Drag image here or click to browse</p>
                <p class="text-gray-500 pb-5">Supports PNG, JPG, JPEG, WebP up to 10MB each
                </p>

                <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect" class="hidden">
                <button v-if="!isDragging" @click="fileInput && fileInput.click()"
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                    Choose Files
                </button>
            </div>

            <div v-else class="py-[2.7rem]">
                <p class="text-lg font-medium text-gray-500 mb-2">Drop image here</p>
            </div>



        </div>
        <!-- Uploaded Images Preview -->
        <Preview :remove-image="removeImage" />
    </div>
</template>