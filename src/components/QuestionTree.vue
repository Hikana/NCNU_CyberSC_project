<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-72 bg-[#111a22] p-4 flex flex-col justify-between shrink-0">
      <div>
        <!-- Sidebar Header -->
        <div class="flex items-center gap-3 mb-6">
          <div 
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBiocw9ONzKmk8EMpwp7Ibrd4vl3EB9gw_6fZYW1ZU5lLI_H-cDW9yoz4oT4eiqqyWCvzo-jA8tbxyNJoXH5bU-yIuTvnF7MLMPRQfmwxxK8t9Pwg6biFs4LlT-6mPvD_LjC9ZXrfTxuDks2wjfDmm4eRNJi9Ky9RCa-OmZGTumqpL7fKF3m7y5wLdHwGYB5ZUJIUrvYy_5iEOGMnwKTbBbq3xrcTSp5dfJqGEit-OS9mvJ1wZ8VdgbnWyudKIOKEnjMUiajVWo1Xs");'>
          </div>
          <div class="flex flex-col">
            <h1 class="text-white text-base font-medium">刷題平台</h1>
            <p class="text-[#92adc9] text-sm">{{ user.email }}</p>
          </div>
        </div>
        
        <!-- Sidebar Navigation -->
        <nav class="flex flex-col gap-1">
          <router-link
            to="/home"
            class="flex items-center gap-3 px-3 py-2 text-white hover:text-primary"
          >
            <span class="material-symbols-outlined">home</span>
            <span class="text-sm font-medium">首頁</span>
          </router-link>
          
          <!-- Category Items -->
          <router-link
            v-for="category in categories"
            :key="category.id"
            :to="`/questions/${category.id}`"
            class="flex flex-col gap-1 p-2 rounded-lg"
            :class="$route.params.id === category.id ? 'bg-primary/20' : ''"
          >
            <div
              class="flex items-center gap-3 px-3 py-2 rounded-lg"
              :class="$route.params.id === category.id ? 'text-primary' : 'text-white'"
            >
              <span class="material-symbols-outlined">{{ category.icon }}</span>
              <span class="text-sm font-medium">{{ category.name }}</span>
            </div>
            <div class="flex items-center gap-2 px-3">
              <div class="w-full bg-gray-600 rounded-full h-1.5">
                <div 
                  class="bg-primary h-1.5 rounded-full" 
                  :style="{ width: getProgressPercentage(category.completed, category.total) + '%' }"
                ></div>
              </div>
              <span 
                class="text-xs font-medium"
                :class="$route.params.id === category.id ? 'text-primary' : 'text-gray-400'"
              >
                {{ category.completed }}/{{ category.total }}
              </span>
            </div>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8">
      <!-- Breadcrumbs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <router-link to="/home" class="text-[#92adc9]">首頁</router-link>
        <span class="text-[#92adc9]">/</span>
        <router-link to="/questions" class="text-[#92adc9]">OWASP Top 10</router-link>
        <span class="text-[#92adc9]">/</span>
        <span class="text-white">A01: Broken Access Control</span>
      </div>

      <!-- Header -->
      <div class="flex flex-col gap-3 mb-8">
        <p class="text-white text-4xl font-black">A01: Broken Access Control</p>
        <p class="text-[#92adc9]">探索與存取控制漏洞相關的挑戰，測試您的技能。</p>
      </div>

      <!-- Challenges -->
      <div class="space-y-4">
        <div 
          v-for="challenge in challenges" 
          :key="challenge.id"
          class="group flex items-center gap-4 bg-[#111a22] hover:bg-primary/20 p-4 rounded-lg transition-all cursor-pointer"
        >
          <div class="flex items-center gap-4 flex-1">
            <div class="flex items-center justify-center rounded-lg bg-[#1f2937] size-12">
              <span 
                class="material-symbols-outlined"
                :class="challenge.iconClass"
              >
                {{ challenge.icon }}
              </span>
            </div>
            <div class="flex flex-col">
              <p class="text-white text-base font-medium">{{ challenge.title }}</p>
              <p class="text-[#92adc9] text-sm">{{ challenge.description }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span :class="challenge.difficultyClass">
              {{ challenge.difficulty }}
            </span>
            <div class="flex size-7 items-center justify-center">
              <div 
                class="size-3 rounded-full" 
                :class="challenge.completed ? 'bg-[#10B981]' : 'bg-[#6B7280]'"
              ></div>
            </div>
            <router-link
              :to="`/questions/${activeCategory}/challenge/${challenge.id}`"
              class="bg-primary opacity-0 group-hover:opacity-100 text-white text-sm font-medium px-4 py-2 rounded-lg transition-opacity"
            >
              {{ challenge.completed ? '查看詳情' : '開始挑戰' }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-16 text-center text-[#92adc9] text-sm">
        © 2024 刷題平台 | 
        <a class="hover:text-primary" href="#">聯繫我們</a> | 
        <a class="hover:text-primary" href="#">隱私政策</a>
      </footer>
    </main>
  </div>
</template>

<script>
import { useRoute } from "vue-router";

export default {
  name: 'QuestionTree',
  setup() {
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      user: { email: 'user@example.com' },
      categories: [
        { id: 'A01', icon: 'lock_open', name: 'A01: Broken Access Control', completed: 1, total: 3 },
        { id: 'A02', icon: 'key', name: 'A02: Cryptographic Failures', completed: 0, total: 5 },
        { id: 'A03', icon: 'syringe', name: 'A03: Injection', completed: 4, total: 5 },
        { id: 'A04', icon: 'design_services', name: 'A04: Insecure Design', completed: 1, total: 4 },
        { id: 'A05', icon: 'settings', name: 'A05: Security Misconfiguration', completed: 2, total: 4 },
        { id: 'A06', icon: 'build_circle', name: 'A06: Vulnerable Components', completed: 3, total: 3 },
        { id: 'A07', icon: 'person', name: 'A07: Identification Failures', completed: 0, total: 2 },
        { id: 'A08', icon: 'verified_user', name: 'A08: Integrity Failures', completed: 0, total: 3 },
        { id: 'A09', icon: 'monitoring', name: 'A09: Logging & Monitoring', completed: 2, total: 3 },
        { id: 'A10', icon: 'dns', name: 'A10: SSRF', completed: 0, total: 1 }
      ],
      challenges: [
        {
          id: 1,
          title: '管理員權限繞過',
          description: '嘗試繞過使用者權限檢查，以普通用戶身份存取管理員專屬的後台頁面。',
          difficulty: '困難',
          difficultyClass: 'bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full',
          icon: 'lock',
          iconClass: 'text-red-500',
          completed: false
        },
        {
          id: 2,
          title: '不安全的直接物件引用 (IDOR)',
          description: '通過修改 URL 中的參數，嘗試存取您無權查看的其他用戶的個人資料。',
          difficulty: '中等',
          difficultyClass: 'bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-0.5 rounded-full',
          icon: 'check_circle',
          iconClass: 'text-green-500',
          completed: true
        },
        {
          id: 3,
          title: '路徑遍歷',
          description: '利用輸入參數中的 ../ 序列來存取伺服器上的任意文件。',
          difficulty: '簡單',
          difficultyClass: 'bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full',
          icon: 'no_accounts',
          iconClass: 'text-gray-500',
          completed: false
        }
      ]
    };
  },
  computed: {
    activeCategory() {
      return this.$route.params.id || "A01";
    }
  },
  methods: {
    getProgressPercentage(completed, total) {
      return Math.round((completed / total) * 100);
    }
  }
};
</script>
