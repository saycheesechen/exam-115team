import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/quiz', name: 'quiz', component: () => import('@/views/QuizView.vue') },
    { path: '/result', name: 'result', component: () => import('@/views/ResultView.vue') },
    { path: '/wrong-book', name: 'wrong-book', component: () => import('@/views/WrongBookView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
