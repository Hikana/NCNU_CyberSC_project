<template>
  <div class="register-page">
    <div class="register-form">
      <h2>建立新帳號</h2>
      <p class="subtitle">加入 Code Fortress 的行列！</p>
      <input type="email" v-model="email" placeholder="電子郵件" @keyup.enter="handleRegister" />
      <input type="password" v-model="password" placeholder="密碼 (至少6位數)" @keyup.enter="handleRegister" />
      <input type="password" v-model="confirmPassword" placeholder="確認密碼" @keyup.enter="handleRegister" />
      <div class="buttons">
        <button @click="handleRegister">註冊</button>
      </div>
      <p class="login-link">
        已經有帳號了？ <router-link to="/login">點此登入</router-link>
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
const confirmPassword = ref('');
const errorMsg = ref('');

async function handleRegister() {
  // 基本的前端驗證
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = '請填寫所有欄位。';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '兩次輸入的密碼不一致。';
    return;
  }
  if (password.value.length < 6) {
    errorMsg.value = '密碼長度至少需要6位數。';
    return;
  }

  try {
    await authStore.signup(email.value, password.value);
    router.push('/Login'); // 註冊成功後直接跳轉到遊戲頁面
  } catch (error) {
    console.error("註冊失敗:", error);
    switch (error.code) {
        case 'auth/invalid-email':
            errorMsg.value = '電子郵件格式不正確。';
            break;
        case 'auth/missing-email':
            errorMsg.value = '請輸入電子郵件。';
            break;
        case 'auth/email-already-in-use':
            errorMsg.value = '這個電子郵件已經被註冊了。';
            break;
        case 'auth/weak-password':
            errorMsg.value = '密碼強度不足，請設定至少6位數的密碼。';
            break;
        default:
            errorMsg.value = '註冊時發生未預期的錯誤。';
            break;
    }
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2c3e50;
  font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
}
.register-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  width: 320px;
}
.subtitle {
  color: #7f8c8d;
  margin-bottom: 25px;
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
.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #2ecc71; /* 綠色，與登入按鈕區分 */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #27ae60;
}
.login-link {
    margin-top: 20px;
    font-size: 14px;
}
.login-link a {
    color: #3498db;
    text-decoration: none;
}
.login-link a:hover {
    text-decoration: underline;
}
.error {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 14px;
}
</style>
