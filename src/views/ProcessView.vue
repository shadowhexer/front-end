<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, capitalize, watch, onWatcherCleanup } from 'vue'
import { usePageStore } from '@/stores/page'
import { useFetchStore } from "@/stores/fetch";
import router from '@/router';
import { Palette, ChevronRight } from 'lucide-vue-next'
import FilterView from '@/components/FilterView.vue';
import AdjustmentView from '@/components/AdjustmentView.vue';
import EffectView from '@/components/EffectView.vue';
import TabButtons from '@/components/TabButtons.vue';
import ImageComparison from '@/components/ImageComparison.vue';
import ImageCropping from '@/components/ImageCropping.vue';
import CropComponent from '@/components/CropComponent.vue';

const currentPage = usePageStore()
const fetchStore = useFetchStore()
const previewImages = fetchStore.previewImages
const uploadedImages = fetchStore.uploadedImages
const isProcessing = ref(false)
const selectedPreviewIndex = ref(0)
let cleanup: (() => void) | undefined
const currentTab: any = ref<'menu' | 'filters' | 'adjustments' | 'effects' | 'crop'>('menu')
const menu = [
    { key: 'filters', label: 'Filters', icon: Palette },
    { key: 'adjustments', label: 'Adjustments', icon: Palette },
    { key: 'effects', label: 'Effects', icon: Palette },
    { key: 'crop', label: 'Crop', icon: Palette },
];
const activeFilter = ref(['']);

const selectedPreviewImage = computed(() => {
    return previewImages[selectedPreviewIndex.value] ?? null
})

// Editing options
const filters = reactive([
    { name: 'Grayscale' },
    { name: 'Sepia' },
    { name: 'Cool' },
    { name: 'Warm' },
])
const adjustments = reactive([
    { name: 'Brightness', min: -100, max: 100, step: 1, unit: '%' },
    { name: 'Contrast', min: -100, max: 100, step: 1, unit: '%' },
    { name: 'Saturation', min: -100, max: 100, step: 1, unit: '%' },
    { name: 'Hue', min: -180, max: 180, step: 1, unit: '°' },
])
const effects = reactive([
    { name: 'Blur' },
    { name: 'Sharpen' },
    { name: 'Grain' },
    { name: 'Vignette' },
    { name: 'Glow' }
])

const defaultFilters = {
    filters: {
        grayscale: false,
        sepia: false,
        cool: false,
        warm: false
    },
    adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0
    },
    effects: {
        blur: 0,
        sharpen: 0,
        grain: 0,
        vignette: 0,
        glow: 0
    },
    crop: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }
};


// Processing settings
const processingSettings = reactive(JSON.parse(JSON.stringify(selectedPreviewImage.value?.filters || defaultFilters)));

const applyProcessing = (() => {
    let timer: number | undefined;
    let listener = false;

    function cached() {
        isProcessing.value = true;
        clearTimeout(timer);
        console.log("applyProcessing.cached() called — scheduling send of:", JSON.parse(JSON.stringify(processingSettings)));
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'cached', {
                filename: selectedPreviewImage.value?.name,
                filters: processingSettings
            });
        }, 50);
    }

    function preview() {
        isProcessing.value = true;
        clearTimeout(timer);
        console.log("applyProcessing.cached() called — scheduling send of:", JSON.parse(JSON.stringify(processingSettings)));
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'preview', {
                filename: selectedPreviewImage.value?.name
            });
        }, 50);
    }

    function undo() {
        try {
            const result: any = PYTHON.run('adjustImage', 'undo', {});
            return result; // some Neutralino versions give back a promise
        } catch (err) {
            console.error("Python call failed:", err);
            return null; // or throw if you want to handle upstream
        }
    }

    function redo() {
        try {
            const result: any = PYTHON.run('adjustImage', 'redo', {});
            return result; // some Neutralino versions give back a promise
        } catch (err) {
            console.error("Python call failed:", err);
            return null; // or throw if you want to handle upstream
        }
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

    function reset() {
        try {
            const result: any = PYTHON.run('adjustImage', 'reset', {});
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

                const index = selectedPreviewIndex.value;
                const current = previewImages[index];
                if (!current) return;

                if (current.name === items.filename) {
                    current.url = items.dataUrl;

                    // Initialize if missing
                    if (!current.filters) current.filters = {};

                    fetchStore.updatePreviewFilters(index, items.filters);
                    console.log("Filters:", current.name, items.filters);
                    Object.assign(processingSettings.filters, items.filters?.filters || {});
                    Object.assign(processingSettings.adjustments, items.filters?.adjustments || {});
                    Object.assign(processingSettings.effects, items.filters?.effects || {});


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

    return { cached, preview, undo, redo, final, reset };
})();


onMounted(() => { cleanup = fetchStore.retrieveImages(); })
onUnmounted(() => { if (typeof cleanup === 'function') cleanup(); })

let isSwitching = false;

// Watching checkbox change
watch(activeFilter, (newFilters) => {
    if (isSwitching) return;

    if (newFilters.length > 1) {
        activeFilter.value = [newFilters[newFilters.length - 1]];
    }

    // Reset all bools first
    Object.assign(processingSettings.filters, JSON.parse(JSON.stringify(defaultFilters.filters)));

    for (const filter of newFilters) {
        const key = filter.toLowerCase();
        if (key in processingSettings.filters) {
            processingSettings.filters[key] = true;
        }
    }
    console.log("Active Filters: ", activeFilter.value)
    applyProcessing.cached();
}, { immediate: true });

// Watching image change
watch(selectedPreviewIndex, (newIndex) => {
    isSwitching = true

    const img = previewImages[newIndex];
    if (!img) return;

    // Reset or load existing filters
    if (!img.filters) {
        fetchStore.resetPreviewFilters(newIndex);
    }
    // Sync local processing settings with this image’s filters
    Object.assign(processingSettings, JSON.parse(JSON.stringify(defaultFilters)));
    Object.assign(processingSettings, JSON.parse(JSON.stringify(img.filters)));

    // 🧹 Reset activeFilter based on the new image
    const active = Object.entries(processingSettings.filters)
        .find(([_, value]) => value === true);

    // Set the one that’s true, or none if all false
    activeFilter.value = active ? [active[0].charAt(0).toUpperCase() + active[0].slice(1)] : [];

    applyProcessing.preview();

    isSwitching = false
});

// Watching filter change
watch(processingSettings, (newFilters) => {
    const index = selectedPreviewIndex.value;
    fetchStore.updatePreviewFilters(index, newFilters);
}, { deep: true });

const next = () => {
    applyProcessing.final()
    currentPage.nextPage()
    router.push('/results')
};
</script>

<template>
    <div v-if="currentPage.page === 1" class="flex flex-row justify-evenly px-[15rem]">
        <!-- Sidebar Controls -->
        <aside
            class="col-span-3 rounded-lg bg-white border border-solid shadow-md shadow-green-100 basis-xs px-6 py-5 max-h-3/4 overflow-y-auto">

            <h3 class="text-lg font-bold text-gray-900 py-2 text-center">{{ capitalize(currentTab) }}</h3>
            <hr class="pb-2">

            <transition :name="`slide-fade`" mode="out-in">
                <div :key="currentTab">
                    <div v-if="currentTab == 'menu'">

                        <!-- Image Selector for Batch -->
                        <div class="mb-6">
                            <label class="text-sm font-medium mb-2 text-gray-600">Current Image</label>
                            <select v-model="selectedPreviewIndex"
                                class="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg text-gray-900">
                                <option v-for="(img, index) in uploadedImages" :key="index" :value="index"
                                    class="cursor-pointer">
                                    {{ img.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Filters -->
                        <div v-for="tab in menu" :key="tab.key" class="py-6">
                            <button @click="currentTab = tab.key"
                                class="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer">
                                <div class="flex items-center gap-2">
                                    <component :is="tab.icon" class="w-5 h-5" />
                                    <span class="font-medium">{{ tab.label }}</span>
                                </div>
                                <ChevronRight class="w-4 h-4" />
                            </button>
                        </div>

                        <button @click="() => applyProcessing.reset()"
                            class="w-full px-4 py-2 bg-red-50 rounded-lg text-red-900 hover:bg-red-100 cursor-pointer transition-colors font-medium">
                            Reset All
                        </button>

                    </div>

                    <!-- Filters Tab -->
                    <div v-else-if="currentTab === 'filters'">
                        <FilterView :filters="filters" v-model:active-filter="activeFilter" />
                        <TabButtons @apply="currentTab = 'menu'; applyProcessing.preview();"
                            @cancel="currentTab = 'menu'" />

                    </div>

                    <!-- Adjustments Tab -->
                    <div v-else-if="currentTab === 'adjustments'">
                        <AdjustmentView :adjustments="adjustments" :processing-settings="processingSettings"
                            @update="applyProcessing.cached()" />
                        <TabButtons @apply="currentTab = 'menu'; applyProcessing.preview();"
                            @cancel="currentTab = 'menu'" />
                    </div>

                    <!--Effects-->
                    <div v-else-if="currentTab === 'effects'">
                        <EffectView :effects="effects" :processing-settings="processingSettings"
                            @update="applyProcessing.cached()" />
                        <TabButtons @apply="currentTab = 'menu'; applyProcessing.preview();"
                            @cancel="currentTab = 'menu'" />
                    </div>

                    <!--Crop-->
                    <div v-else-if="currentTab === 'crop'">
                        <CropComponent @apply="applyProcessing.cached()" />
                        <TabButtons @apply="currentTab = 'menu'; applyProcessing.preview();"
                            @cancel="currentTab = 'menu'" />
                    </div>

                </div>
            </transition>
        </aside>

        <!-- Main Editing Area -->
        <div class="col-span-9 max-w-9/10 max-h-3/4 basis-250">
            <div class="bg-white rounded-lg border border-solid shadow-md shadow-green-100 p-6">

                <ImageComparison :selected-preview-image="selectedPreviewImage"
                    :selected-preview-index="selectedPreviewIndex"
                    @undo="applyProcessing.undo()"
                    @redo="applyProcessing.redo()"
                    >
                    <template #compare>
                        <div v-if="currentTab === 'crop'" />
                    </template>
                    <template #preview>
                        <ImageCropping v-if="currentTab === 'crop'" :selected-preview-image="selectedPreviewImage.url"
                            v-model:crop="processingSettings.crop" />
                    </template>
                </ImageComparison>
                <div v-if="currentTab === 'menu'" class="flex justify-end pt-6">
                    <!-- <button @click="() => { currentPage.prevPage; router.push('/') }"
                        class="px-6 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-200 cursor-pointer transition-colors">
                        Back to Upload
                    </button> -->
                    <button @click="next()"
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

/* Shared transition */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>