<script setup lang="ts">
import { ref } from "vue";
import { jsPDF } from "jspdf"

const props = defineProps<{
    image: {
        name: string,
        url: string | ArrayBuffer | null
    } | null
}>()
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
    <div v-if="image">
        <div class="flex flex-col align-center bg-white rounded-lg">
            <div class="relative overflow-hidden rounded-lg" style="height: 500px;">
                <img :src="(image && (typeof image?.url === 'string')) ? image.url : undefined" alt="Original"
                    class="w-full h-full object-contain py-10">
            </div>
            <div class="flex flex-col items-center gap-4 px-5 py-3 ">
                <h2 class="align-self-center text-2xl font-bold text-gray-900">{{ image.name }}</h2>
                <button @click="downloadImage()"
                    class="align-self-center w-[10rem] py-2 bg-green-700 rounded-lg text-white hover:opacity-90 cursor-pointer transition-opacity font-medium">
                    Download as Image
                </button>
                <button @click="downloadPDF()"
                    class="align-self-center w-[10rem] py-2 bg-green-700 rounded-lg text-white hover:opacity-90 cursor-pointer transition-opacity font-medium">
                    Download as PDF
                </button>
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