import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import GamePage from '../components/GamePage.vue'
import QuestionTree from '@/components/QuestionTree.vue'
import A01 from '@/components/questions/A01.vue'
import A02 from '@/components/questions/A02.vue'
import A03 from '@/components/questions/A03.vue'
import A04 from '@/components/questions/A04.vue'
import A05 from '@/components/questions/A05.vue'
import A06 from '@/components/questions/A06.vue'
import A07 from '@/components/questions/A07.vue'
import A08 from '@/components/questions/A08.vue'
import A09 from '@/components/questions/A09.vue'
import A10 from '@/components/questions/A10.vue'


const routes = [
  { path: '/', component: HomePage },
  { path: '/home', component: HomePage },
  { path: '/game', component: GamePage },
  { path: '/questions', component: QuestionTree },
  { path: '/questions/A01', component: A01 },
  { path: '/questions/A02', component: A02 },
  { path: '/questions/A03', component: A03 },
  { path: '/questions/A04', component: A04 },
  { path: '/questions/A05', component: A05 },
  { path: '/questions/A06', component: A06 },
  { path: '/questions/A07', component: A07 },
  { path: '/questions/A08', component: A08 },
  { path: '/questions/A09', component: A09 },
  { path: '/questions/A10', component: A10 },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router