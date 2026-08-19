import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import QuizView from '@/views/QuizView.vue'
import ResultView from '@/views/ResultView.vue'
import WrongBookView from '@/views/WrongBookView.vue'
import HistoryView from '@/views/HistoryView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/quiz', name: 'quiz', component: QuizView },
    { path: '/result', name: 'result', component: ResultView },
    { path: '/wrong-book', name: 'wrong-book', component: WrongBookView },
    { path: '/history', name: 'history', component: HistoryView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
