import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
// import GamePage from '../components/GamePage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/game', component: GamePage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router