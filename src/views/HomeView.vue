<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 class="text-xl font-semibold text-gray-900">ImageLab Pro</h1>
          </div>
          
          <!-- Export Button - shown when images are processed -->
          <button 
            v-if="currentStep > 1 && processedImages.length > 0"
            @click="exportImages"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Progress Steps -->
    <div class="bg-white border-b">
      <div class="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <div v-for="(step, index) in steps" :key="index" class="flex items-center">
            <div class="flex items-center space-x-2">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep > index ? 'bg-green-600 text-white' : 
                currentStep === index ? 'bg-green-100 text-green-600 border-2 border-green-600' :
                'bg-gray-200 text-gray-500'
              ]">
                {{ index + 1 }}
              </div>
              <span :class="[
                'text-sm font-medium',
                currentStep >= index ? 'text-gray-900' : 'text-gray-500'
              ]">
                {{ step }}
              </span>
            </div>
            <svg v-if="index < steps.length - 1" class="w-5 h-5 text-gray-300 mx-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="w-full px-4 sm:px-6 lg:px-8 py-8">
      
      <UploadView />

      <!-- Step 2: Processing Methods -->
      <ProcessView />

      <!-- Step 3: Results Grid -->
      <ResultsView />

      <!-- Step 4: Individual View/Compare -->
      <CompareView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UploadView from './UploadView.vue'
import ProcessView from './ProcessView.vue'
import ResultsView from './ResultsView.vue'
import CompareView from './CompareView.vue'

// State
const currentStep = ref(0)
const isDragging = ref(false)
const isProcessing = ref(false)
const uploadedImages = ref([])
const processedImages = ref([])
const selectedImageIndex = ref(null)
const selectedPreviewIndex = ref(0)
const sliderPosition = ref(50)

const steps = ['Upload', 'Process', 'Results', 'Compare']

// Processing settings
const processingSettings = ref({
  blur: 0,
  brightness: 0,
  contrast: 0,
  grayscale: false,
  sepia: false,
  invert: false
})

// Computed
const selectedImage = computed(() => {
  return selectedImageIndex.value !== null ? processedImages.value[selectedImageIndex.value] : null
})

const selectedPreviewImage = computed(() => {
  return uploadedImages.value[selectedPreviewIndex.value]
})

// Methods
const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
}

const processFiles = (files) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedImages.value.push({
          name: file.name,
          url: e.target.result,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const proceedToProcessing = () => {
  currentStep.value = 1
}

const applyProcessing = async () => {
  isProcessing.value = true
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // In real app, you'd send to your Python backend here
  processedImages.value = uploadedImages.value.map(image => ({
    ...image,
    originalUrl: image.url,
    processedUrl: image.url, // In real app, this would be the processed image URL from backend
    processed: true
  }))
  
  isProcessing.value = false
  currentStep.value = 2
}

const selectImage = (index) => {
  selectedImageIndex.value = selectedImageIndex.value === index ? null : index
}

const startDragging = (e) => {
  isDragging.value = true
  updateSliderPosition(e)
}

const updateSliderPosition = (e) => {
  if (!isDragging.value) return
  const rect = e.currentTarget.closest('.relative').getBoundingClientRect()
  const x = e.clientX - rect.left
  sliderPosition.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

const stopDragging = () => {
  isDragging.value = false
}

const downloadImage = (image) => {
  // In real app, download the processed image
  console.log('Downloading:', image.name)
}

const exportImages = () => {
  // In real app, export all processed images
  console.log('Exporting all processed images')
}

// Event listeners
onMounted(() => {
  document.addEventListener('mousemove', updateSliderPosition)
  document.addEventListener('mouseup', stopDragging)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', updateSliderPosition)
  document.removeEventListener('mouseup', stopDragging)
})
</script>