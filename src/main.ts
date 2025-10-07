import './assets/main.css'
import 'img-comparison-slider/dist/styles.css'

import CropperCanvas from '@cropper/element-canvas';
import CropperImage from '@cropper/element-image';
import CropperShade from '@cropper/element-shade';
import CropperSelection from '@cropper/element-selection';
import CropperHandle from '@cropper/element-handle';
import CropperCrosshair from '@cropper/element-crosshair';

CropperCanvas.$define()
CropperImage.$define();
CropperShade.$define();
CropperSelection.$define();
CropperHandle.$define();
CropperCrosshair.$define();

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia()).use(router).mount('#app')
