<script setup lang="ts">
import { useFetchStore } from '@/stores/fetch';
import { computed, ref } from 'vue'
import { ImgComparisonSlider } from '@img-comparison-slider/vue';
import IconRedo from './icons/IconRedo.vue';
import IconUndo from './icons/IconUndo.vue';

const showComparison = ref(false)
const fetchStore = useFetchStore()
const uploadedImages = fetchStore.uploadedImages

const props = defineProps<{
    selectedPreviewImage: any,
    selectedPreviewIndex: number
}>()

defineEmits<{
    (e: 'undo'): void,
    (e: 'redo'): void
}>()
const selectedOriginalImage = computed(() => {
    return uploadedImages[props.selectedPreviewIndex] ?? null
})
</script>
<template>
    <div class="flex items-center justify-between pb-4">
        <h3 class="font-bold text-gray-900">Preview</h3>

        <div class="flex flex-column items-center gap-5">
            <button @click="$emit('undo')" class="hover:opacity-50 cursor-pointer">
                <IconUndo />
            </button>
            <button @click="$emit('redo')" class="hover:opacity-50 cursor-pointer">
                <IconRedo />
            </button>
        </div>

        <slot name="compare">
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
        </slot>
    </div>

    <!-- Image Comparison Slider -->
    <div class="container relative rounded-lg bg-gray-100 overflow-hidden">
        <slot name="preview">
            <div v-if="!showComparison" class="w-full h-full flex items-center justify-center">
                <img :src="(selectedPreviewImage && typeof selectedPreviewImage?.url === 'string') ? selectedPreviewImage.url : undefined"
                    alt="Edited image" class="max-w-full max-h-full object-contain h-[500px]" />
            </div>

            <!-- Before/After Comparison -->
            <div v-else class="relative w-full h-full flex items-center justify-center h-[500px]">
                <!-- After Image (Full) -->
                <ImgComparisonSlider class="max-w-full max-h-full" style="--default-handle-width: 100px;">
                    <img slot="first"
                        :src="(selectedOriginalImage && typeof selectedOriginalImage?.url === 'string') ? selectedOriginalImage.url : undefined"
                        alt="Original" class="object-contain m-auto h-[500px]" />

                    <img slot="second"
                        :src="(selectedPreviewImage && typeof selectedPreviewImage?.url === 'string') ? selectedPreviewImage.url : undefined"
                        :alt="(selectedPreviewImage && selectedPreviewImage.name) ? selectedPreviewImage.name : 'Preview'"
                        class=" object-contain mx-auto h-[500px]" />
                </ImgComparisonSlider>
            </div>
        </slot>
    </div>
</template>