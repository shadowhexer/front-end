<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import type { Selection } from '@cropper/element-selection';
import CropperImageElement from '@cropper/element-image';

const cropperCanvas = ref<HTMLCanvasElement | null>(null);
const cropperImage = ref<HTMLImageElement | null>(null);
const cropperSelection = ref<HTMLSelectElement | null>(null);

defineProps<{
    selectedPreviewImage: string | ArrayBuffer | null,
    crop: {
        x: number,
        y: number,
        width: number,
        height: number
    }
}>()

const emit = defineEmits<{
    (e: 'update:crop', value: { x: number, y: number, width: number, height: number }): void
}>()

// The three functions below are taken from CropperJS
// https://fengyuanchen.github.io/cropperjs/api/cropper-canvas.html 
function inSelection(selection: Selection, maxSelection: Selection) {
    return (
        selection.x >= maxSelection.x
        && selection.y >= maxSelection.y
        && (selection.x + selection.width) <= (maxSelection.x + maxSelection.width)
        && (selection.y + selection.height) <= (maxSelection.y + maxSelection.height)
    );
}
function onCropperImageTransform(event: CustomEvent) {
    const cropperCanvasEl = cropperCanvas.value;
    const cropperImageEl = cropperImage.value;
    const cropperSelectionEl = cropperSelection.value;

    if (!cropperCanvasEl || !cropperSelectionEl) return;

    const cropperCanvasRect = cropperCanvasEl.getBoundingClientRect();

    // 1. Clone the cropper image.
    const cropperImageClone = cropperImageEl?.cloneNode() as unknown as CropperImageElement;

    // 2. Apply the new matrix to the cropper image clone.
    cropperImageClone.style.transform = `matrix(${event.detail.matrix.join(', ')})`;

    // 3. Make the cropper image clone invisible.
    cropperImageClone.style.opacity = '0';

    // 4. Append the cropper image clone to the cropper canvas.
    cropperCanvasEl?.appendChild(cropperImageClone);

    // 5. Compute the boundaries of the cropper image clone.
    const cropperImageRect = cropperImageClone.getBoundingClientRect();

    // 6. Remove the cropper image clone.
    cropperCanvasEl?.removeChild(cropperImageClone);

    const selection = cropperSelectionEl as unknown as Selection;
    const maxSelection: Selection = {
        x: cropperImageRect.left - cropperCanvasRect.left,
        y: cropperImageRect.top - cropperCanvasRect.top,
        width: cropperImageRect.width,
        height: cropperImageRect.height,
    };

    if (!inSelection(selection, maxSelection)) {
        event.preventDefault();
    }
}
function onCropperSelectionChange(event: CustomEvent) {
    const cropperCanvasEl = cropperCanvas.value;
    const cropperImageEl = cropperImage.value;
    if (!cropperCanvasEl || !cropperImageEl) return;

    const selection = event.detail as Selection;

    const cropperCanvasRect = cropperCanvasEl.getBoundingClientRect()
    const cropperImageRect = cropperImageEl.getBoundingClientRect();
    const maxSelection: Selection = {
        x: cropperImageRect.left - cropperCanvasRect.left,
        y: cropperImageRect.top - cropperCanvasRect.top,
        width: cropperImageRect.width,
        height: cropperImageRect.height,
    };

    if (!inSelection(selection, maxSelection)) {
        event.preventDefault();
    }

    // Fetch actual dimension of the image, ignoring CSS modifications, and emit.
    const image = cropperImageEl.shadowRoot?.querySelector('img') as HTMLImageElement;
    if (!image) {
        console.warn('No internal <img> found inside cropper-image');
        return;
    }
    const imageRect = image.getBoundingClientRect();

    const relativeX = selection.x - maxSelection.x;
    const relativeY = selection.y - maxSelection.y;

    const scaleX = image.naturalWidth / imageRect.width;
    const scaleY = image.naturalHeight / imageRect.height;
    const realCrop = {
        x: Math.max(0, relativeX * scaleX),
        y: Math.max(0, relativeY * scaleY),
        width: Math.max(0, selection.width * scaleX),
        height: Math.max(0, selection.height * scaleY),
    };

    emit('update:crop', realCrop);
    console.log('Crop area:', realCrop)
}

</script>

<template>
    <div class="w-full h-full flex items-center justify-center">
        <cropper-canvas ref="cropperCanvas" background class="w-10/10 h-[500px]">
            <cropper-image ref="cropperImage" :src="selectedPreviewImage" alt="Cropped image"
                class="justify-self-center !object-contain" rotatable scalable skewable translatable
                @transform="onCropperImageTransform" />
            <cropper-shade hidden />
            <cropper-handle action="move" plain />
            <cropper-selection ref="cropperSelection" initial-coverage="0.5" movable resizable
                @change="onCropperSelectionChange">
                <cropper-crosshair centered />
                <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
                <cropper-handle action="n-resize" />
                <cropper-handle action="e-resize" />
                <cropper-handle action="s-resize" />
                <cropper-handle action="w-resize" />
                <cropper-handle action="ne-resize" />
                <cropper-handle action="nw-resize" />
                <cropper-handle action="se-resize" />
                <cropper-handle action="sw-resize" />
            </cropper-selection>
        </cropper-canvas>
    </div>
</template>
