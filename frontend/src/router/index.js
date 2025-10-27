import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '@/components/LoginPage.vue';   // 我們的登入頁面
import RegisterPage from '@/components/RegisterPage.vue'; // ✅ 我們的新註冊頁面
import { useAuthStore } from '@/stores/authStore';
import QuestionTree from '@/components/QuestionTree.vue'
import QuestionMore from '@/components/QuestionMore.vue'
import GamePage from '@/components/game/GamePage.vue'
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
  { path: '/questions/:id', component: QuestionMore, props: true }
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
