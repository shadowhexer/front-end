import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UploadView from '../views/UploadView.vue'
import ProcessView from '../views/ProcessView.vue'
import ResultsView from '../views/ResultsView.vue'
import CompareView from '../views/CompareView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
    }
  ],
})

export default router
