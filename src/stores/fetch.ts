import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

interface Sharpen {
    amount: number;
    threshold: number;
}

interface PreviewFilters {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    sepia: number;
    grayscale: number;
    sharpen?: Sharpen;
}

interface PreviewItem {
    name: string;
    url: string | ArrayBuffer | null;
    filters?: PreviewFilters;
}

export const useFetchStore = defineStore('fetch', () => {
    const isLoading = ref(false)


    const uploadedImages = reactive<Array<{ 
        name: string; 
        url: string | ArrayBuffer | null 
    }>>([]);

    const previewImages = reactive<PreviewItem[]>([]);

    let listener = false

    function fileUpload() {
        // dispatch to Python one image at a time
        uploadedImages.forEach(async file => {
            try {
                PYTHON.run('importImage', '', {
                    filename: file.name,
                    dataUrl: file.url
                });

            } catch (error) {
                console.error("Error dispatching to Python:", error);
            }
        })
    }

    function retrieveImages() {
        if (listener) return () => { };
        listener = true;

        const handler = async (e: any) => {
            try {
                // Neutralino may deliver the broadcast in e.detail, or sometimes directly as e.
                const payload = (e && e.detail) ? e.detail : e;
                let items = payload;

                if (payload && payload.data) {
                    // If Neutralino wrapped payload into { data: { ... } }
                    items = payload.data;
                }

                const array = Array.isArray(items) ? items : [items];

                array.forEach((file: any) => {
                    if (!file) return;
                    else if(file.status === false){
                    console.log("Received error status from imageImported event:", items.message);
                    return
                }
                    previewImages.push({
                        name: file.filename,
                        url: file.dataUrl
                    });
                });

            } catch (error) {
                console.error("Error handling imageExported event:", error);
            }
        }
        Neutralino.events.on('imageImported', handler)

        return () => {
            try {
                Neutralino.events.off('imageImported', handler)
            } catch (e) {
                console.error("Error removing imageExported listener:", e);
            }
        }
    }

    // Public API
    return { isLoading, fileUpload, uploadedImages, previewImages, retrieveImages }
})