import { ref, reactive, computed } from 'vue'
import { useFetchStore } from "@/stores/fetch";
const fetchStore = useFetchStore()
const previewImages = fetchStore.previewImages
export const isProcessing = ref(false)
export const selectedPreviewIndex = ref(0)
// Processing settings
export const processingSettings = reactive({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    sharpen: {
        amount: 0,
        threshold: 0
    },
});
// Infer the keys from the processingSettings object
type ProcessName = keyof typeof processingSettings;
export const processNames = reactive<ProcessName[]>(
    [
        'brightness',
        'contrast',
        'saturation',
        'hue',
        'blur',
        'sepia',
        'grayscale',
        'sharpen',
    ]
)

export const applyProcessing = (() => {
    let timer: number | undefined;
    let listener = false;

    function preview(event: any) {
        isProcessing.value = true;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'preview', {
                filename: selectedPreviewImage.value?.name,
                filters: processingSettings,
            });
        }, 300);
    }

    function final(event: any) {
        isProcessing.value = true;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            PYTHON.run('adjustImage', 'final', {
                filename: selectedPreviewImage.value?.name,
                filters: processingSettings,
            });
        }, 300);
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

                // Update only if this is the currently selected image
                const current = previewImages[selectedPreviewIndex.value];
                if (current?.name === items.filename) {
                    current.url = items.dataUrl;
                    if (current.filters) {
                        Object.assign(processingSettings, current.filters);
                        console.log("Updated filters:", current.filters);
                    }
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

    return { preview, final };
})();

export const selectedPreviewImage = computed(() => {
    return previewImages[selectedPreviewIndex.value] ?? null
})