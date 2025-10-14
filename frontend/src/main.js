import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // ✅ 引入我們設定好的 router
import { useAuthStore } from './stores/authStore'; // 引入 authStore

const app = createApp(App)

app.use(createPinia())
app.use(router) // ✅ 告訴 Vue 我們要使用 router

// ✅ 在掛載應用前，先初始化 authStore，確保路由守衛能正確運作
const authStore = useAuthStore();
authStore.init().then(() => {
    app.mount('#app');
});

