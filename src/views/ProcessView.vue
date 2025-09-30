<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, capitalize, watch } from 'vue'
import { usePageStore } from '@/stores/page'
import { useFetchStore } from "@/stores/fetch";
import router from '@/router';

const currentPage = usePageStore()
const fetchStore = useFetchStore()
const previewImages = fetchStore.previewImages
const uploadedImages = fetchStore.uploadedImages
const isProcessing = ref(false)
const selectedPreviewIndex = ref(0)
const isDragging = ref(false)
const sliderPosition = ref(50)
let cleanup: (() => void) | undefined
// Processing settings
const processingSettings = reactive({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    sharpen: {
        amount: 0,
        threshold: 0
    },
});
// Infer the keys from the processingSettings object
type ProcessName = keyof typeof processingSettings;
const processNames = reactive<ProcessName[]>(
    [
        'brightness',
        'contrast',
        'saturation',
        'hue',
        'blur',
        'sepia',
        'grayscale',
        'sharpen',
    ]
)

const applyProcessing = (() => {
    let timer: number | undefined;
    let listener = false;

    function cached() {
        isProcessing.value = true;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'cached', {
                filename: selectedPreviewImage.value?.name,
                filters: processingSettings,
            });
        }, 50);
    }

    function preview() {
        isProcessing.value = true;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'preview', {
                filename: selectedPreviewImage.value?.name,
                filters: processingSettings,
            });
        }, 50);
    }

    async function final() {
        try {
            const result: any = await PYTHON.run('adjustImage', 'final', {});
            return result; // some Neutralino versions give back a promise
        } catch (err) {
            console.error("Python call failed:", err);
            return null; // or throw if you want to handle upstream
        }
    }

    function forward() {
        if (listener) return;
        listener = true;

        const handler = (e: any) => {
            try {
                const payload = (e && e.detail) ? e.detail : e;
                const items = payload?.data ?? payload;

                if (!items) return;
                if (items.status === false) {
                    console.warn("Received an error from imageAdjusted event:", items.message);
                    return;
                }

                // Update only if this is the currently selected image
                const current = previewImages[selectedPreviewIndex.value];
                if (current?.name === items.filename) {
                    current.url = items.dataUrl;
                    if (current.filters) {
                        Object.assign(processingSettings, current.filters);
                        console.log("Updated filters:", current.filters);
                    }
                    isProcessing.value = false;
                }
            } catch (error) {
                console.error("Error handling imageAdjusted event:", error);
            }
        };

        Neutralino.events.on('imageAdjusted', handler);

        return () => {
            Neutralino.events.off('imageAdjusted', handler);
            listener = false;
        };
    }

    // Attach listener once
    forward();

    return { cached, preview, final };
})();


onMounted(() => { cleanup = fetchStore.retrieveImages() })
onUnmounted(() => { fetchStore.retrieveImages() })

const selectedPreviewImage = computed(() => {
    return previewImages[selectedPreviewIndex.value] ?? null
})
const selectedOriginalImage = computed(() => {
    return uploadedImages[selectedPreviewIndex.value] ?? null
})

const startDragging = (e: any) => {
    isDragging.value = true
    updateSliderPosition(e)
}

const updateSliderPosition = (e: any) => {
    if (!isDragging.value) return
    const rect = e.currentTarget.closest('.relative').getBoundingClientRect()
    const x = e.clientX - rect.left
    sliderPosition.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

const stopDragging = () => {
    isDragging.value = false
}

const next = () => {
    applyProcessing.final()
    currentPage.nextPage()
    router.push('/results')
}
</script>

<template>
    <div v-if="currentPage.page === 1" class="space-y-6">
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
                        <div v-for="(process, index) in processNames" :key="index">
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ capitalize(process)
                                }}</label>
                            <input v-if="process === 'sharpen'" v-model="processingSettings.sharpen.amount"
                                @input="applyProcessing.cached" @change="applyProcessing.preview" type="range" min="0"
                                max="255" class="w-full">
                            <input v-else v-model="processingSettings[process]" @input="applyProcessing.cached"
                                @change="applyProcessing.preview" type="range" min="0" max="255" class="w-full">
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Effects</h3>
                    <div class="space-y-3">
                        <!-- <label class="flex items-center">
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
                        </label> -->
                    </div>
                </div>

                <button @click="currentPage.nextPage" :disabled="isProcessing"
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
                                <option v-for="(image, index) in previewImages" :key="index" :value="index">
                                    {{ image.name }}
                                </option>
                            </select>
                            <button @click="next()" class="text-green-600 hover:text-green-700 font-medium">
                                View All Results →
                            </button>
                        </div>
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden" style="height: 500px;">
                            <img :src="(selectedOriginalImage && (typeof selectedOriginalImage?.url === 'string')) ? selectedOriginalImage.url : undefined"
                                alt="Original" class="absolute inset-0 w-full h-full object-contain">

                            <div class="absolute inset-0 overflow-hidden"
                                :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
                                <img :src="(selectedPreviewImage && (typeof selectedPreviewImage?.url === 'string')) ? selectedPreviewImage.url : undefined"
                                    :alt="(selectedPreviewImage && selectedPreviewImage.name) ? selectedPreviewImage.name : 'Preview'"
                                    class="w-full h-full object-contain">
                            </div>

                            <!-- Slider -->
                            <div class="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                                :style="{ left: `${sliderPosition}%` }" @mousedown="startDragging">
                                <div
                                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                    </svg>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>