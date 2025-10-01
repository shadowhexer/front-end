<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, capitalize, watch } from 'vue'
import { usePageStore } from '@/stores/page'
import { useFetchStore } from "@/stores/fetch";
import { ImgComparisonSlider } from '@img-comparison-slider/vue';
import router from '@/router';
import { Palette, Sliders, Sparkles, ChevronDown } from 'lucide-vue-next'

const currentPage = usePageStore()
const fetchStore = useFetchStore()
const previewImages = fetchStore.previewImages
const uploadedImages = fetchStore.uploadedImages
const isProcessing = ref(false)
const selectedPreviewIndex = ref(0)
const isDragging = ref(false)
const sliderPosition = ref(50)
let cleanup: (() => void) | undefined

// Imported consts
const activePanel: any = ref(null)
const currentFilters: any = ref({})
const currentEffects: any = ref({})
const showComparison = ref(false)
// Editing options
const filters = ['None', 'Grayscale', 'Sepia', 'Vintage', 'Cool', 'Warm', 'High Contrast']
const effects = ['Blur', 'Sharpen', 'Vignette', 'Grain', 'Glow']

const adjustments = reactive([
    { name: 'Brightness', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'Contrast', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'Saturation', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'Hue', value: 0, min: -180, max: 180, step: 1, unit: '°' },
])

const applyFilter = (filter: any) => {
    currentFilters.value[selectedPreviewIndex.value] = filter
}

const toggleEffect = (effect: any) => {
    if (!currentEffects.value[selectedPreviewIndex.value]) {
        currentEffects.value[selectedPreviewIndex.value] = []
    }
    const effects = currentEffects.value[selectedPreviewIndex.value]
    const index = effects.indexOf(effect)
    if (index > -1) {
        effects.splice(index, 1)
    } else {
        effects.push(effect)
    }
}

const resetEdits = () => {
    adjustments.forEach(adj => {
        if (adj.name === 'Hue') adj.value = 0
        else adj.value = 100
    })
    currentFilters.value[selectedPreviewIndex.value] = 'None'
    currentEffects.value[selectedPreviewIndex.value] = []
}

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
    <div v-if="currentPage.page === 1" class="flex flex-row justify-evenly px-[15rem]">
        <!-- Sidebar Controls -->
        <aside
            class="col-span-3 rounded-lg bg-white border border-solid shadow-md shadow-green-100 basis-xs px-6 py-5 h-fit">
            <h3 class="text-lg font-bold text-gray-900 py-2 ">Editing Tools</h3>

            <!-- Image Selector for Batch -->
            <div class="mb-6">
                <label class="text-sm font-medium mb-2 text-gray-600">Current Image</label>
                <select v-model="selectedPreviewIndex"
                    class="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg text-gray-900">
                    <option v-for="(img, index) in uploadedImages" :key="index" :value="index" class="cursor-pointer">
                        Image {{ index + 1 }}
                    </option>
                </select>
            </div>

            <!-- Filters -->
            <div class="py-6">
                <button @click="activePanel = activePanel === 'filters' ? null : 'filters'"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer">
                    <div class="flex items-center gap-2">
                        <Palette class="w-5 h-5" />
                        <span class="font-medium">Filters</span>
                    </div>
                    <ChevronDown :class="['w-4 h-4 transition-transform', activePanel === 'filters' && 'rotate-180']" />
                </button>

                <div v-if="activePanel === 'filters'" class="mt-2 space-y-2">
                    <button v-for="filter in filters" :key="filter" @click="applyFilter(filter)" :class="[
                        'w-full px-4 py-2 text-left rounded-lg transition-colors text-sm text-gray-900 hover:bg-gray-200 cursor-pointer',
                        currentFilters[selectedPreviewIndex] === filter
                            ? 'bg-gray-200 text-primary-foreground'
                            : 'bg-background'
                    ]">
                        {{ filter }}
                    </button>
                </div>
            </div>

            <!-- Adjustments -->
            <div>
                <button @click="activePanel = activePanel === 'adjustments' ? null : 'adjustments'"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-gray-900 hover:bg-gray-200 cursor-pointer transition-colors">
                    <div class="flex items-center gap-2">
                        <Sliders class="w-5 h-5" />
                        <span class="font-medium">Adjustments</span>
                    </div>
                    <ChevronDown
                        :class="['w-4 h-4 transition-transform', activePanel === 'adjustments' && 'rotate-180']" />
                </button>

                <div v-if="activePanel === 'adjustments'" class="pt-3 space-y-4">
                    <div v-for="adjustment in adjustments" :key="adjustment.name">
                        <label class="text-sm font-medium mb-1 block text-gray-900">
                            {{ adjustment.name }}
                        </label>
                        <input type="range" :min="adjustment.min" :max="adjustment.max" :step="adjustment.step"
                            v-model="adjustment.value" class="w-full accent-primary" color="green" />
                        <div class="text-xs text-gray-600 text-right mt-1">
                            {{ adjustment.value }}{{ adjustment.unit }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Effects -->
            <div class="py-6">
                <button @click="activePanel = activePanel === 'effects' ? null : 'effects'"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-gray-900 hover:bg-gray-200 cursor-pointer transition-colors">
                    <div class="flex items-center gap-2">
                        <Sparkles class="w-5 h-5" />
                        <span class="font-medium">Effects</span>
                    </div>
                    <ChevronDown :class="['w-4 h-4 transition-transform', activePanel === 'effects' && 'rotate-180']" />
                </button>

                <div v-if="activePanel === 'effects'" class="mt-2 space-y-2">
                    <button v-for="effect in effects" :key="effect" @click="toggleEffect(effect)" :class="[
                        'w-full px-4 py-2 text-left rounded-lg transition-colors text-sm text-gray-900 hover:bg-gray-200 cursor-pointer',
                        currentEffects[selectedPreviewIndex]?.includes(effect)
                            ? 'bg-gray-200 text-accent-foreground'
                            : 'bg-background'
                    ]">
                        {{ effect }}
                    </button>
                </div>
            </div>

            <button @click="resetEdits"
                class="w-full px-4 py-2 bg-destructive/10 text-destructive bg-red-50 rounded-lg text-red-900 hover:bg-red-100 cursor-pointer transition-colors font-medium">
                Reset All
            </button>
        </aside>

        <!-- Main Editing Area -->
        <div class="col-span-9 max-w-9/10 max-h-3/4 basis-250">
            <div class="bg-white rounded-lg border border-solid shadow-md shadow-green-100 p-6">

                <div class="flex items-center justify-between pb-4">
                    <h3 class="font-bold text-gray-900">Preview</h3>
                    <div class="flex items-center gap-2">
                        <button @click="showComparison = !showComparison" :class="[
                            'px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer',
                            showComparison
                                ? 'bg-green-700 text-green-50 hover:bg-green-800'
                                : 'bg-green-50 text-green-700 hover:bg-green-200'
                        ]">
                            {{ showComparison ? 'Hide' : 'Show' }} Comparison
                        </button>
                    </div>
                </div>

                <!-- Image Comparison Slider -->
                <div class="container relative rounded-lg bg-gray-100 overflow-hidden">
                    <div v-if="!showComparison" class="w-full h-full flex items-center justify-center">
                        <img :src="(selectedPreviewImage && typeof selectedPreviewImage?.url === 'string') ? selectedPreviewImage.url : undefined"
                            alt="Edited image" class="max-w-full max-h-full object-contain " style="height: 500px;" />
                    </div>

                    <!-- Before/After Comparison -->
                    <div v-else class="relative w-full h-full flex items-center justify-center" style="height: 500px;">
                        <!-- After Image (Full) -->
                        <ImgComparisonSlider class="max-w-full max-h-full" style="--default-handle-width: 100px;">
                            <img slot="first"
                                :src="(selectedOriginalImage && typeof selectedOriginalImage?.url === 'string') ? selectedOriginalImage.url : undefined"
                                alt="Original" class="object-contain m-auto" style="height: 500px;" />

                            <img slot="second"
                                :src="(selectedPreviewImage && typeof selectedPreviewImage?.url === 'string') ? selectedPreviewImage.url : undefined"
                                :alt="(selectedPreviewImage && selectedPreviewImage.name) ? selectedPreviewImage.name : 'Preview'"
                                class=" object-contain mx-auto" style="height: 500px;" />
                        </ImgComparisonSlider>
                    </div>
                </div>
                <div class="flex justify-between pt-6">
                    <button @click="() => { currentPage.prevPage; router.push('/upload') }"
                        class="px-6 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-200 cursor-pointer transition-colors">
                        Back to Upload
                    </button>
                    <button @click="() => { currentPage.nextPage; router.push('/result') }"
                        class="px-6 py-2 bg-green-700 text-green-50 rounded-lg font-medium hover:opacity-90 cursor-pointer transition-opacity">
                        Continue to Export
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
input[type="range"] {
    height: 6px;
    border-radius: 3px;
    background: oklch(0.922 0 0);
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: oklch(0.646 0.222 41.116);
    cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: oklch(0.646 0.222 41.116);
    cursor: pointer;
    border: none;
}
</style>