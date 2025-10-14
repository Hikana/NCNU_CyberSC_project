import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import GamePage from '../components/GamePage.vue'
import QuestionTree from '@/components/QuestionTree.vue'
import QuestionMore from '@/components/QuestionMore.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/home', component: HomePage },
  { path: '/game', component: GamePage },
  { path: '/questions', component: QuestionTree },
  { path: '/questions/:id', component: QuestionMore, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
