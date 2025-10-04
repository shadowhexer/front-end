<script setup lang="ts">
defineEmits<{
    (e: 'apply'): void
    (e: 'cancel'): void
}>()
</script>
<template>
    <div class="py-4">
        <button @click="$emit('apply')"
            class="w-full px-4 py-2 bg-green-700 rounded-lg text-white hover:opacity-90 cursor-pointer transition-opacity font-medium">
            Apply
        </button>
    </div>
    <button @click="$emit('cancel')"
        class="w-full px-4 py-2 bg-green-50 bg-red-50 rounded-lg text-green-700 hover:bg-green-200 cursor-pointer transition-colors font-medium">
        Cancel
    </button>
</template>