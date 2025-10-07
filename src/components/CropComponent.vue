<script setup lang="ts">
defineEmits<{
    (e: 'apply'): void
}>()
</script>
<template>
    <!-- Image Selector for Batch -->
    <div class="py-5 space-y-4">
        <button @click="$emit('apply')"
            class="w-full px-4 py-2 bg-green-300 rounded-lg text-white hover:opacity-90 cursor-pointer transition-opacity font-medium">
            Cropped
        </button>
    </div>
</template>