import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

interface Filters {
    grayscale: boolean,
    sepia: boolean,
    cool: boolean,
    warm: boolean
}
interface Adjustments {
    brightness: number,
    contrast: number,
    saturation: number,
    hue: number,
}
interface Effects {
    blur: number,
    sharpen: number,
    grain: number,
    vignette: number,
    glow: number
}

interface PreviewFilters {
    filters?: Filters,
    adjustments?: Adjustments,
    effects?: Effects
}

interface PreviewItem {
    name: string;
    url: string | ArrayBuffer | null;
    filters?: PreviewFilters;
}

const defaultFilters: PreviewFilters = {
    filters: {
        grayscale: false,
        sepia: false,
        cool: false,
        warm: false
    },
    adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0
    },
    effects: {
        blur: 0,
        sharpen: 0,
        grain: 0,
        vignette: 0,
        glow: 0
    }
};


export const useFetchStore = defineStore('fetch', () => {
    let listener = false
    const uploadedImages = reactive<Array<{ 
        name: string; 
        url: string | ArrayBuffer | null 
    }>>([]);
    const previewImages = reactive<PreviewItem[]>([]);

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
                        url: file.dataUrl,
                        filters: JSON.parse(JSON.stringify(defaultFilters))
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

    function resetPreviewFilters(index: number) {
        if (previewImages[index]) {
            previewImages[index].filters = JSON.parse(JSON.stringify(defaultFilters));
        }
    }

    function updatePreviewFilters(index: number, newFilters: PreviewFilters) {
        if (previewImages[index]) {
            previewImages[index].filters = JSON.parse(JSON.stringify(newFilters));
        }
    }

    // Public API
    return { fileUpload, uploadedImages, previewImages, retrieveImages, resetPreviewFilters, updatePreviewFilters }
})