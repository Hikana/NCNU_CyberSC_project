<template>
  <h1>{{ msg }}</h1>

  <h1>HelloWorld</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>

  <!-- ✅ 新增：認證狀態調試資訊 -->
  <div v-if="showDebug" class="debug-panel">
    <h3>🔍 認證狀態調試</h3>
    <p><strong>載入狀態:</strong> {{ isLoading ? '載入中...' : '已載入' }}</p>
    <p><strong>認證狀態:</strong> {{ user ? '已登入' : '未登入' }}</p>
    <p><strong>用戶郵箱:</strong> {{ user?.email || '無' }}</p>
    <p><strong>用戶ID:</strong> {{ user?.uid || '無' }}</p>
    <button @click="refreshAuth" class="debug-btn">🔄 重新檢查</button>
  </div>

  <!-- ✅ 修復：根據認證狀態顯示不同按鈕 -->
  <div class="navigation-section">
    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>正在檢查登入狀態...</p>
    </div>
    
    <!-- 已登入狀態 -->
    <div v-else-if="user" class="authenticated-state">
      <div class="user-welcome">
        <h3>👋 歡迎回來!</h3>
        <p>{{ user.email }}</p>
      </div>
      
      <div class="button-group">
        <router-link to="/game" class="nav-link">
          <button class="primary-btn">🎮 前往 GamePage</button>
        </router-link>
        
        <button @click="handleLogout" class="secondary-btn">
          🚪 登出
        </button>
      </div>
    </div>
    
    <!-- 未登入狀態 -->
    <div v-else class="unauthenticated-state">
      <div class="welcome-message">
        <h3>🔐 請先登入</h3>
        <p>登入後即可開始遊戲</p>
      </div>
      
      <div class="button-group">
        <router-link to="/Login" class="nav-link">
          <button class="primary-btn">🔑 登入</button>
        </router-link>
        
        <router-link to="/register" class="nav-link">
          <button class="secondary-btn">📝 註冊</button>
        </router-link>
      </div>
    </div>
  </div>

  <!-- ✅ 開發模式下顯示調試按鈕 -->
  <button v-if="isDev" @click="toggleDebug" class="debug-toggle">
    {{ showDebug ? '隱藏' : '顯示' }} 調試資訊
  </button>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

// Props
defineProps({
  msg: String,
})

// 基本狀態
const count = ref(0)
const router = useRouter()

// 認證相關狀態
const user = ref(null)
const isLoading = ref(true)
const error = ref(null)

// 調試相關
const isDev = computed(() => import.meta.env.DEV)
const showDebug = ref(false)

// Firebase Auth 實例
const auth = getAuth()

// 初始化認證監聽
const initAuth = () => {
  console.log('🔧 初始化 Firebase Auth 監聽器')
  
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    console.log('🔄 認證狀態變化:', firebaseUser ? `已登入: ${firebaseUser.email}` : '未登入')
    
    if (firebaseUser) {
      // 用戶已登入
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified
      }
      console.log('✅ 用戶資料已更新:', user.value)
    } else {
      // 用戶未登入
      user.value = null
      console.log('👤 用戶已登出')
    }
    
    isLoading.value = false
    error.value = null
  }, (authError) => {
    // 認證錯誤處理
    console.error('❌ 認證監聽器錯誤:', authError)
    isLoading.value = false
    error.value = authError.message
  })
  
  return unsubscribe
}

// 登出處理
const handleLogout = async () => {
  try {
    console.log('🚪 開始登出...')
    await signOut(auth)
    console.log('✅ 登出成功')
  } catch (logoutError) {
    console.error('❌ 登出失敗:', logoutError)
    alert('登出失敗: ' + logoutError.message)
  }
}

// 重新檢查認證狀態
const refreshAuth = () => {
  console.log('🔄 手動刷新認證狀態')
  isLoading.value = true
  
  const currentUser = auth.currentUser
  if (currentUser) {
    user.value = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      emailVerified: currentUser.emailVerified
    }
    console.log('✅ 手動刷新成功:', user.value)
  } else {
    user.value = null
    console.log('ℹ️ 手動刷新：未發現登入用戶')
  }
  
  isLoading.value = false
}

// 切換調試面板
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// 組件載入時初始化
onMounted(() => {
  console.log('🏠 HelloWorld 組件已載入')
  
  // 初始化認證監聽
  const unsubscribe = initAuth()
  
  // 在開發模式下顯示調試資訊
  if (isDev.value) {
    showDebug.value = true
    console.log('🛠️ 開發模式：調試面板已啟用')
  }
  
  // 清理函數
  return () => {
    if (unsubscribe) {
      unsubscribe()
      console.log('🧹 認證監聽器已清理')
    }
  }
})
</script>

<style scoped>
.read-the-docs {
  color: #888;
}

/* ✅ 新增樣式 */
.navigation-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.authenticated-state, .unauthenticated-state {
  text-align: center;
}

.user-welcome {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.user-welcome h3 {
  margin: 0 0 0.5rem 0;
  color: #155724;
}

.user-welcome p {
  margin: 0;
  color: #155724;
  font-weight: 600;
}

.welcome-message {
  margin-bottom: 1.5rem;
}

.welcome-message h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.welcome-message p {
  margin: 0;
  color: #856404;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
}

.primary-btn, .secondary-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background-color: #545b62;
  transform: translateY(-2px);
}

/* 調試相關樣式 */
.debug-panel {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
}

.debug-panel h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.debug-panel p {
  margin: 0.25rem 0;
  color: #856404;
}

.debug-btn {
  background-color: #ffc107;
  border: 1px solid #ffc107;
  color: #212529;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.debug-btn:hover {
  background-color: #e0a800;
  border-color: #d39e00;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1000;
}

.debug-toggle:hover {
  background-color: #138496;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn, .secondary-btn {
    width: 200px;
  }
  
  .navigation-section {
    padding: 1rem;
  }
}
</style>