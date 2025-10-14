<template>
  <div class="min-h-screen text-white p-8">
    <!-- 標題 -->
    <h1 class="text-3xl font-bold mb-4">
      {{ question.id }}: {{ question.title }} - 挑戰一
    </h1>
    <p class="text-gray-400 mb-6">難易度: {{ question.level }}</p>

    <!-- 題目描述 -->
    <div class="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 class="text-lg font-semibold mb-2">題目描述</h2>
      <p class="text-gray-300">
        {{ question.description }}
      </p>
    </div>

    <!-- 程式碼 -->
    <div v-if="question.code" class="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 class="text-lg font-semibold mb-2">程式碼</h2>
      <pre class="bg-gray-900 p-4 rounded text-green-400 overflow-x-auto">
<code>{{ question.code }}</code>
      </pre>
    </div>

    <!-- 解答 -->
    <div class="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 class="text-lg font-semibold mb-2">解答</h2>
      <textarea
        class="w-full p-3 bg-gray-900 rounded text-white"
        rows="3"
        placeholder="請在此輸入你的 Flag 或答案..."
      ></textarea>
    </div>

    <!-- 按鈕 -->
    <div class="flex space-x-4">
      <button class="px-4 py-2 bg-green-600 rounded hover:bg-green-700">提交答案</button>

      <!-- 改成 router-link，回到 QuestionTree -->
      <router-link
        to="/questions"
        class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        回到首頁
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

// 模擬題目資料
const questions = {
  A01: {
    id: "A01",
    title: "Broken Access Control",
    level: "中等",
    description: "在這個挑戰中，你需要利用一個常見的存取控制漏洞，檢測系統的權限驗證，取得管理員的權限。",
    code: `// vulnerable code snippet
function checkAccess(user) {
  if (user.role === 'admin') {
    return true;
  }
  return false;
}`,
  },
  A02: {
    id: "A02",
    title: "Cryptographic Failures",
    level: "簡單",
    description: "本題測試你是否能識別加密不當的使用，找到弱點並破解資料。",
    code: `// insecure MD5 example
const crypto = require('crypto');
function hashPassword(pwd) {
  return crypto.createHash('md5').update(pwd).digest('hex');
}`,
  },
  // 其他 A03 ~ A10 你可以依需求補上
};

// 根據路由 id 載入題目
const questionId = route.params.id;
const question = questions[questionId] || {
  id: questionId,
  title: "未知題目",
  level: "N/A",
  description: "沒有找到對應的題目資料。",
  code: "",
};
</script>
