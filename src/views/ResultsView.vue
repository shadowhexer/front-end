<script setup lang="ts">
import { onMounted, reactive, computed, ref, onUnmounted } from 'vue';
import { usePageStore } from '@/stores/page';
import PreviewImage from './PreviewImage.vue';

interface PreviewImage {
  name: string
  url: string | ArrayBuffer | null;
}

const pageStore = usePageStore()
const previewImages = reactive<PreviewImage[]>([]);
const selectedPreviewIndex: any = ref(null)

const selectImage = (index: any) => {
  selectedPreviewIndex.value = selectedPreviewIndex.value === index ? null : index
}


const handler = async (e: any) => {
  try {
    // Neutralino may deliver the broadcast in e.detail, or sometimes directly as e.
    const payload = (e && e.detail) ? e.detail : e;
    let items = payload;

    if (payload && payload.data) {
      // If Neutralino wrapped payload into { data: { ... } }
      items = payload.data;
    }

    const array = Array.isArray(items) ? items : [items];

    array.forEach((file: any) => {
      if (!file) return;
      else if (file.status === false) {
        console.log("Received error status from imageImported event:", items.message);
        return
      }
      console.log("Incoming fIle: ", file)
      previewImages.push({
        name: file.filename,
        url: file.url
      });
    });

    console.log("Stored file: ", previewImages)

  } catch (error) {
    console.error("Error handling imageExported event:", error);
  }
}

onMounted(() => {
  Neutralino.events.on('imageExport', handler);
})
onUnmounted(() => {
  Neutralino.events.off('imageExport', handler);
})

const selectedPreviewImage = computed(() => {
  return previewImages[selectedPreviewIndex.value] ?? null
})

</script>

<template>
  <div v-if="pageStore.page === 2" class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Processing Results</h2>
        <p class="text-gray-600">{{ previewImages.length }} images processed</p>
      </div>

    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="(image, index) in previewImages" :key="index" @click="selectImage(index)"
        :class="['relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
          selectedPreviewIndex === index ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300']">
        <img :src="(image && (typeof image?.url === 'string')) ? image.url : undefined" :alt="image.name"
          class="w-full h-32 object-cover">
        <div class="absolute top-2 left-2">
          <div :class="[
            'w-5 h-5 rounded border-2 flex items-center justify-center',
            selectedPreviewIndex === index ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
          ]">
            <svg v-if="selectedPreviewIndex === index" class="w-3 h-3 text-white" fill="currentColor"
              viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
          <p class="text-xs truncate">{{ image.name }}</p>
        </div>
      </div>
    </div>

    <PreviewImage :image="selectedPreviewImage" />
  </div>
</template>