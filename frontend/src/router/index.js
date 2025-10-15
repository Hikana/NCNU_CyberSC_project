import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import GamePage from '../components/GamePage.vue'
import LoginPage from '@/components/LoginPage.vue';   // 我們的登入頁面
import RegisterPage from '@/components/RegisterPage.vue'; // ✅ 我們的新註冊頁面
import { useAuthStore } from '@/stores/authStore';
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
  { 
    path: '/', 
    redirect: '/home' // 根目錄自動跳轉到登入頁
  },
  { 
    path: '/home', 
    component: HomePage, 
    name:'home'
  },
  { 
    path: '/login', 
    component: LoginPage, 
    name: 'Login' 
  },
  { 
    path: '/register', // ✅ 新增註冊頁面的路徑
    component: RegisterPage, 
    name: 'Register' 
  },
  { 
    path: '/game', 
    component: GamePage, 
    name: 'Game', 
    meta: { requiresAuth: true } // ✅ 標記這個頁面需要登入
  },
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
  routes,
})


/**
 * 路由守衛 (Route Guard)
 * 在每次頁面跳轉前，都會執行這個檢查
 */

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.isLoading) {
    await authStore.init();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.user) {
    // 需要登入卻沒登入 → 回首頁
    next({ name: 'home' });
  } else {
    // 其他狀況一律放行
    next();
  }
});


export default router;