<template>
  <!-- 外層：整頁背景 -->
  <div class="min-h-screen w-full flex items-center justify-center">
    <!-- 中間容器：寬度固定，去掉背景色，跟外層一樣 -->
    <div class="w-80">
      <h2 class="text-2xl font-bold mb-4 text-white text-center">
        刷題區 - OWASP Top 10
      </h2>
      <ul class="space-y-2">
        <li v-for="category in categories" :key="category.id">
          <router-link
            :to="category.path"
            class="block w-full text-left font-semibold px-3 py-2 rounded transition
                   text-gray-200
                   hover:bg-gray-700 hover:text-white
                   focus:bg-gray-600 focus:text-white
                   active:bg-gray-500 active:text-white"
            :class="{ 'bg-blue-600 text-white': $route.path === category.path }"
          >
            {{ category.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const categories = [
  { id: "A01", title: "A01 - Broken Access Control", path: "/questions/A01" },
  { id: "A02", title: "A02 - Cryptographic Failures", path: "/questions/A02" },
  { id: "A03", title: "A03 - Injection", path: "/questions/A03" },
  { id: "A04", title: "A04 - Insecure Design", path: "/questions/A04" },
  { id: "A05", title: "A05 - Security Misconfiguration", path: "/questions/A05" },
  { id: "A06", title: "A06 - Vulnerable and Outdated Components", path: "/questions/A06" },
  { id: "A07", title: "A07 - Identification and Authentication Failures", path: "/questions/A07" },
  { id: "A08", title: "A08 - Software and Data Integrity Failures", path: "/questions/A08" },
  { id: "A09", title: "A09 - Security Logging and Monitoring Failures", path: "/questions/A09" },
  { id: "A10", title: "A10 - Server-Side Request Forgery (SSRF)", path: "/questions/A10" },
]
</script>
