import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '../views/UploadView.vue'
import ProcessView from '../views/ProcessView.vue'
import ResultsView from '../views/ResultsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/upload',
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
    },
    {
      path: '/process',
      name: 'process',
      component: ProcessView,
    },
    {
      path: '/results',
      name: 'results',
      component: ResultsView,
    }
  ],
})

export default router
