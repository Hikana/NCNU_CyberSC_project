<template>
  <div class="login-page">
    <div class="login-form">
      <h2>歡迎來到 Code Fortress</h2>
      <p class="subtitle">請登入以繼續</p>
      <input type="email" v-model="email" placeholder="電子郵件" @keyup.enter="handleLogin" />
      <input type="password" v-model="password" placeholder="密碼" @keyup.enter="handleLogin" />
      <div class="buttons">
        <button @click="handleLogin">登入</button>
      </div>
      
      <!-- 新增一個註冊連結，點擊後會跳轉到 /register 頁面 -->
      <p class="register-link">
        還沒有帳號？ <router-link to="/register">點此註冊</router-link>
      </p>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');

async function handleLogin() {
  // 基本的前端驗證
  if (!email.value || !password.value) {
    errorMsg.value = '請輸入電子郵件和密碼。';
    return;
  }
  try {
    // 呼叫 authStore 中的 login 動作
    await authStore.login(email.value, password.value);
    // 登入成功後，使用 router 跳轉到主頁面
    router.push('/home');
  } catch (error) {
    console.error("登入失敗:", error);
    // 根據 Firebase 回傳的錯誤碼，顯示更友善的訊息
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            errorMsg.value = '電子郵件或密碼錯誤。';
            break;
        default:
            errorMsg.value = '登入時發生未預期的錯誤。';
            break;
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  background-color: #2c3e50;
  font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}
.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  width: 320px;
}
h2 {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #2c3e50;
}
.subtitle {
  color: #7f8c8d;
  margin-bottom: 25px;
  font-size: 14px;
}
input {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}
input:focus {
  outline: none;
  border-color: #3498db;
}
.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #2980b9;
}
.register-link {
    margin-top: 20px;
    font-size: 14px;
}
.register-link a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
}
.register-link a:hover {
    text-decoration: underline;
}
.error {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 14px;
}
</style>

