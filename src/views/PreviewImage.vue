<script setup lang="ts">
import { ref } from "vue";
import { jsPDF } from "jspdf"

const props = defineProps<{
    image: {
        name: string,
        url: string | ArrayBuffer | null
    } | null
}>()
const emit = defineEmits(['return'])
const show = ref(false)

function downloadImage() {
    if (!props.image || typeof props.image.url !== 'string') return

    const link = document.createElement('a')
    link.href = props.image.url

    const baseName = props.image.name.split('.')[0]
    link.download = `${baseName}.png`
    link.click() // Will write to downloads folder
}

function downloadPDF() {
    if (!props.image || typeof props.image.url !== 'string') return

    const pdf = new jsPDF()
    const image = props.image.url

    pdf.addImage(image, 'PNG', 10, 10, 180, 160)
    const baseName = props.image.name.split('.')[0]
    pdf.save(`${baseName}.pdf`) // Will write to downloads folder
}
</script>

<template>
    <div v-if="image" class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ image.name }}</h2>
                <p class="text-gray-600">Compare original vs processed</p>
            </div>
            <div class="flex space-x-2">
                <button @click="emit('return')"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                    ← Back to Grid
                </button>
                <button @click="show = true" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    Download
                </button>
                <Teleport to="body">
                    <div v-if="show" class="modal">
                        <button @click="downloadImage()"
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Download as Image
                        </button>
                        <button @click="downloadPDF()"
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Download as PDF
                        </button>
                        <button @click="show = false"
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Close
                        </button>
                    </div>
                </Teleport>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="relative overflow-hidden rounded-lg" style="height: 500px;">
                <img :src="(image && (typeof image?.url === 'string')) ? image.url : undefined" alt="Original"
                    class="absolute inset-0 w-full h-full object-contain">
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal {
    position: fixed;
    z-index: 999;
    top: 20%;
    left: 50%;
    width: 300px;
    margin-left: -150px;
}
</style>