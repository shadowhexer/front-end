<script setup lang="ts">
defineProps<{
    adjustments: any,
    processingSettings: any,
}>()
defineEmits<{
    (e: 'update'): void
}>()
</script>
<template>
    <!-- Image Selector for Batch -->
    <div class="pt-3 space-y-4">
        <div v-for="adjustment in adjustments" :key="adjustment.name">
            <label class="text-sm font-medium mb-1 block text-gray-900">
                {{ adjustment.name }}
            </label>
            <input type="range" :min="adjustment.min" :max="adjustment.max" :step="adjustment.step"
                v-model.number="(processingSettings.adjustments[adjustment.name.toLowerCase()])"
                @input="$emit('update')" class="w-full accent-primary" color="green" />
            <div class="text-xs text-gray-600 text-right mt-1">
                {{ processingSettings.adjustments[adjustment.name.toLowerCase()] }}{{
                    adjustment.unit }}
            </div>
        </div>
    </div>
</template>