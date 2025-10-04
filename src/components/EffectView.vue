<script setup lang="ts">
defineProps<{
    effects: any,
    processingSettings: any,
    applyProcessing: void
}>()
</script>
<template>
    <!-- Image Selector for Batch -->
    <div class="pt-3 space-y-4">
        <div v-for="effect in effects" :key="effect.name">
            <label class="text-sm font-medium mb-1 block text-gray-900">
                {{ effect.name }}
            </label>
            <input type="range" min="0" max="100" step="1"
                v-model.number="processingSettings.effects[effect.name.toLowerCase()]"
                @input="() => applyProcessing" class="w-full accent-primary" color="green" />
            <div class="text-xs text-gray-600 text-right mt-1">
                {{ processingSettings.effects[effect.name.toLowerCase()] }}%
            </div>
        </div>
    </div>
</template>