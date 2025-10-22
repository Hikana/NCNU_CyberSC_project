<template>
  <div class="font-sans w-full overflow-x-hidden">
    <TitleBar />
    <header class="w-screen bg-bgg py-64"></header>
    <header class="w-screen bg-bgg py-12"></header>

    <SectionAnimation
      :lines="[
        '歡迎來到我們的資安教育網站，',
        '首先，讓我們一起認識駭客的種類吧！',
      ]"
    />
    <!-- 引言 -->
     <BlackOrWhite ref="blackOrWhite" />
    <header class="relative w-screen bg-bgg py-32">
          <div class="absolute top-14 left-8 text-wordcolor px-8">
            <h2 class="text-4xl md:text-5xl font-bold">未來</h2>
          </div>
        </header>
    <Future />

    <!-- 7層 -->
    <SectionAnimation
      :lines="[
        '想守護資訊安全，',
        '得先了解網路的運作方式與保密的核心原則。',
      ]"
    />
    <header class="relative w-screen bg-bgg py-32"></header>
     <SevenStage ref="sevenStage" />

    <header class="w-screen bg-bgg py-16"></header>

    <!-- CIA -->
    <CIABar ref="ciaSection" />

    <!-- AAA -->
    <AAA />
    <!-- 密碼學 -->
    <header class="w-screen bg-bgg py-16"></header>
    <SymmetricEncryptionAndAES ref="hashSection" />
    <header class="w-screen bg-bgg py-16"></header>
    <AsymmetricEncryptionAndRSA ref="rsaSection" />
    <header class="w-screen bg-bgg py-16"></header>
    <!-- Hash -->
    <HashAll />
    <header class="w-screen bg-bgg py-16"></header>
    <DH />
    <header class="w-screen bg-bgg py-16"></header>

    <!-- Top10 -->
    <SectionAnimation
      :lines="[
        '當我們建立網站或應用程式時，',
        '了解常見漏洞就是防禦的第一步！',
      ]"
    />
    <header class="relative w-screen bg-bgg py-32">
      <div class="absolute top-14 left-8 text-wordcolor px-8">
        <h2 class="text-4xl md:text-5xl font-bold">OWASP TOP10</h2>
      </div>
    </header>
    <NewTOP10 ref="top10Section" />

    <!-- 遊戲 -->
    <SectionAnimation
      :lines="[
        '現在，讓我們進入資安小鎮，',
        '親身體驗一場充滿挑戰與學習的資安任務吧！',
        '倘若你想先了解自身能力，',
        '不仿先到「練功坊」試試喔！',
      ]"
    />
    <section
      ref="gameSection"
      class="h-screen bg-bgg flex items-center justify-center"
    >
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
    </section>

    <!-- 右下角路標選單 -->
     <Menu />
  </div>
</template>

<script setup>
import TitleBar from "@/components/TitleBar.vue"
import CIABar from "@/components/CIABar.vue"
import HashAll from "@/components/HashAll.vue"
import NewTOP10 from "@/components/NewTOP10.vue"
import Menu from "@/components/Menu.vue"
import SymmetricEncryptionAndAES from "@/components/SymmetricEncryptionAndAES.vue"
import AsymmetricEncryptionAndRSA from "@/components/AsymmetricEncryptionAndRSA.vue"
import DH from "@/components/DH.vue"
import BlackOrWhite from "@/components/BlackOrWhite.vue"
import SevenStage from "@/components/SevenStage.vue"
import SectionAnimation from "@/components/SectionAnimation.vue"
import Future from "@/components/Future.vue"
import AAA from "@/components/3A.vue"

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

defineOptions({ name: 'SecurityEducationPage' })
// Props
defineProps({
  msg: String,
})

// 基本狀態
const router = useRouter()
const blackOrWhite = ref(null)
const sevenStage = ref(null)
const showMenu = ref(false)


// 認證相關狀態
const user = ref(null)
const isLoading = ref(true)
const error = ref(null)

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

// 組件載入時初始化
onMounted(() => {
  console.log('🏠 HelloWorld 組件已載入')
  
  // 初始化認證監聽
  const unsubscribe = initAuth()
  
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
  padding: 2rem 2.5rem; 
  border: 1px solid #e0e0e0;
  border-radius: 12px; 
  background-color: #f9f9f9;
  max-width: 960px; 
  width: 90%; 
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