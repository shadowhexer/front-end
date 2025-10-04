<script setup lang="ts">
const props = defineProps<{
    filters: { name: string }[],
    activeFilter: string[]
}>()

const emit = defineEmits<{
    (e: 'update:active-filter', value: string[]): void
}>()

function toggleFilter(name: string) {
    const current = props.activeFilter || []
    const updated = current.includes(name)
        ? current.filter(f => f !== name)
        : [...current, name]
    emit('update:active-filter', updated)
}
</script>

<template>
    <div class="mt-2 space-y-4">
        <div v-for="filter in filters" :key="filter.name" class="grid grid-cols-2 py-2">
            <label class="justify-self-start text-lg mb-1 text-gray-900">
                {{ filter.name }}
            </label>
            <input type="checkbox" :checked="props.activeFilter.includes(filter.name)"
                @change="toggleFilter(filter.name)" class="justify-self-end w-full accent-primary" />
        </div>
    </div>
</template>
