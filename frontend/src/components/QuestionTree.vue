<template>
  <div class="flex min-h-screen bg-gray-900 text-white">
    <!-- 左側 Sideblock -->
    <aside class="w-72 bg-gray-800 p-4 space-y-2 flex-shrink-0">
      <div class="text-lg font-bold mb-6">資安刷題平台</div>

      <!-- 首頁 -->
      <router-link
        to="/home"
        class="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
      >
        <span class="material-symbols-outlined">home</span>
        <span>首頁</span>
      </router-link>

      <!-- 返回遊戲 -->
      <router-link
        to="/game"
        class="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
      >
        <span class="material-symbols-outlined">sports_esports</span>
        <span>遊戲</span>
      </router-link>

      <!-- 分類 -->
      <ul class="space-y-3 mt-4">
        <li
          v-for="cat in categories"
          :key="cat.code"
          @click="setCategory(cat.code)"
          class="cursor-pointer p-2 rounded hover:bg-gray-700"
          :class="activeCategory === cat.code && !showWrongList ? 'bg-gray-700' : ''"
        >
          <div class="flex items-center gap-2 px-1 py-1">
            <span class="material-symbols-outlined">{{ cat.icon }}</span>
            <span class="text-sm font-medium whitespace-nowrap">
              {{ cat.code }}: {{ cat.name }}
            </span>
          </div>

          <div class="flex items-center gap-2 px-1 mt-1">
            <div class="w-full bg-gray-600 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-1.5 rounded-full transition-all duration-500 ease-out"
                :style="{
                  width: getProgressPercentage(cat.code) + '%',
                  backgroundColor: '#22c55e'
                }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-400">
              {{ progressMap[cat.code]?.completed || 0 }}/{{ progressMap[cat.code]?.total || 0 }}
            </span>
          </div>
        </li>
      </ul>

      <!-- 錯題複習 -->
      <div class="mt-6 border-t border-gray-700 pt-4">
        <button
          class="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-700"
          @click="toggleWrongList"
        >
          <span class="material-symbols-outlined">history_edu</span>
          <span>錯題複習</span>
        </button>
      </div>
    </aside>

    <!-- 右側內容 -->
    <main class="flex-1 min-h-screen px-8 py-6 bg-gray-900 overflow-y-auto">
      <!-- 錯題複習區 -->
      <div
        v-if="showWrongList"
        class="flex flex-col justify-start min-h-[calc(100vh-3rem)]"
      >
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold">錯題複習</h1>
          <button
            v-if="wrongQuestions.length && !wrongQuestions[0].isPlaceholder"
            class="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
            @click="clearAllWrong"
          >
            清空全部
          </button>
        </div>

        <div v-if="wrongQuestions.length" class="flex-1">
          <transition-group name="fade-slide" tag="ul" class="space-y-4">
            <li
              v-for="q in wrongQuestions"
              :key="q.id"
              class="p-4 rounded-lg transition-all duration-300"
              :class="q.isPlaceholder ? 'bg-gray-700 text-gray-400 text-center' : 'bg-gray-800'"
            >
              <!-- placeholder 顯示 -->
              <template v-if="q.isPlaceholder">
                <p>{{ q.question }}</p>
              </template>

              <!-- 錯題顯示 -->
              <template v-else>
                <p class="font-semibold">{{ q.question }}</p>
                <p class="text-sm text-gray-400 mb-2">
                  正確答案：{{ q.options[q.answer] }}
                </p>
                <button
                  class="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
                  @click="removeFromWrongList(q.id)"
                >
                  已複習完成
                </button>
              </template>
            </li>
          </transition-group>
        </div>
      </div>

      <!-- 題目列表區 -->
      <div v-else>
        <div class="flex flex-wrap gap-2 mb-6 items-center">
          <router-link to="/home" class="flex items-center gap-1 text-[#92adc9] hover:text-primary">
            <span class="material-symbols-outlined">home</span>
            <span>首頁</span>
          </router-link>
          <span v-if="activeCategory" class="text-[#92adc9]">/</span>
          <span v-if="activeCategory" class="text-[#92adc9]">OWASP Top 10</span>
          <span v-if="activeCategory" class="text-[#92adc9]">/</span>
          <span v-if="activeCategory" class="text-white">
            {{ activeCategory }}: {{ currentCategoryName }}
          </span>
        </div>

        <div v-if="paginatedQuestions.length">
          <h1 class="text-2xl font-bold mb-2">
            {{ activeCategory }}: {{ currentCategoryName }}
          </h1>
          <p class="text-gray-400 mb-6">
            探索與 {{ currentCategoryName }} 相關的挑戰，測試您的技能。
          </p>

          <ul class="space-y-4">
            <li
              v-for="q in paginatedQuestions"
              :key="q.id"
              class="p-4 bg-gray-800 rounded-lg"
            >
              <div class="flex items-start gap-3 cursor-pointer" @click="toggleExpand(q)">
                <span
                  class="material-symbols-outlined mt-1"
                  :class="{
                    'text-gray-500': q.status === 'unanswered',
                    'text-green-500': q.status === 'correct',
                    'text-red-500': q.status === 'wrong'
                  }"
                >
                  {{ q.status === 'unanswered'
                    ? 'radio_button_unchecked'
                    : q.status === 'correct'
                    ? 'check_circle'
                    : 'cancel'
                  }}
                </span>

                <div class="flex-1">
                  <p class="font-semibold">{{ q.question }}</p>
                  <p class="text-sm text-gray-400">{{ q.description }}</p>
                </div>
              </div>

              <div v-if="q.expanded" class="mt-3 pl-8 space-y-2">
                <button
                  v-for="(opt, idx) in q.options"
                  :key="idx"
                  class="w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
                  @click="answerQuestion(q, idx)"
                >
                  {{ idx + 1 }}. {{ opt }}
                </button>
              </div>

              <div v-if="q.status === 'wrong'" class="mt-3 pl-8">
                <button
                  class="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
                  @click="retryQuestion(q)"
                >
                  重新挑戰
                </button>
              </div>
            </li>
          </ul>

          <div class="flex justify-between items-center mt-6">
            <button
              class="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
              @click="prevPage"
              :disabled="currentPage === 1"
            >
              上一頁
            </button>
            <span class="text-gray-400">
              第 {{ currentPage }} / {{ totalPages }} 頁
            </span>
            <button
              class="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              下一頁
            </button>
          </div>
        </div>

        <div v-else class="text-gray-400">沒有找到題目。</div>
      </div>
    </main>
  </div>
</template>

<script>
import { db } from '@/firebase/firebase.js'
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: "QuestionTree",
  data() {
    return {
      questions: [],
      wrongQuestions: [],
      showWrongList: false,
      activeCategory: "base",
      currentPage: 1,
      perPage: 10,
      categories: [
        { code: "base", name: "基礎題庫", icon: "menu_book" },
        { code: "A01", name: "Broken Access Control", icon: "lock" },
        { code: "A02", name: "Cryptographic Failures", icon: "vpn_key" },
        { code: "A03", name: "Injection", icon: "bug_report" },
        { code: "A04", name: "Insecure Design", icon: "design_services" },
        { code: "A05", name: "Security Misconfiguration", icon: "settings" },
        { code: "A06", name: "Vulnerable Components", icon: "timer" },
        { code: "A07", name: "Identification Failures", icon: "person" },
        { code: "A08", name: "Integrity Failures", icon: "security" },
        { code: "A09", name: "Logging & Monitoring", icon: "analytics" },
        { code: "A10", name: "SSRF", icon: "dns" }
      ]
    }
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter(q => q.category === this.activeCategory)
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.perPage) || 1
    },
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredQuestions.slice(start, start + this.perPage)
    },
    currentCategoryName() {
      const cat = this.categories.find(c => c.code === this.activeCategory)
      return cat ? cat.name : ""
    },
    progressMap() {
      const map = {}
      this.categories.forEach(cat => {
        const qs = this.questions.filter(q => q.category === cat.code)
        const correctCount = qs.filter(q => q.status === "correct").length
        map[cat.code] = {
          completed: correctCount,
          total: qs.length
        }
      })
      return map
    }
  },
  methods: {
    setCategory(catCode) {
      this.activeCategory = catCode
      this.currentPage = 1
      this.showWrongList = false
    },
    toggleWrongList() {
      this.showWrongList = !this.showWrongList
      if (this.showWrongList) this.loadWrongQuestions()
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    getProgressPercentage(catCode) {
      const prog = this.progressMap[catCode]
      if (!prog || prog.total === 0) return 0
      return Math.round((prog.completed / prog.total) * 100)
    },
    loadProgressMap() {
      try {
        return JSON.parse(localStorage.getItem("questionProgress") || "{}")
      } catch (e) {
        return {}
      }
    },
    saveProgressMap(map) {
      localStorage.setItem("questionProgress", JSON.stringify(map))
    },
    updateProgressForQuestion(q) {
      const map = this.loadProgressMap()
      map[q.id] = q.status
      this.saveProgressMap(map)
    },
    applySavedProgress() {
      const map = this.loadProgressMap()
      this.questions = this.questions.map(q => ({
        ...q,
        status: map[q.id] || "unanswered",
        expanded: false
      }))
    },
    toggleExpand(q) {
      q.expanded = !q.expanded
    },
    answerQuestion(q, idx) {
      if (q.status !== "unanswered") return
      if (idx === q.answer) {
        q.status = "correct"
      } else {
        q.status = "wrong"
        this.saveWrongQuestion(q)
      }
      this.updateProgressForQuestion(q)
      q.expanded = false
    },
    retryQuestion(q) {
      q.status = "unanswered"
      this.updateProgressForQuestion(q)
      q.expanded = false
    },
    saveWrongQuestion(q) {
      let wrongList = JSON.parse(localStorage.getItem("wrongQuestions") || "[]")
      const exists = wrongList.some(item => item.id === q.id)
      if (!exists) {
        wrongList.push({
          id: q.id,
          question: q.question,
          options: q.options,
          answer: q.answer,
          category: q.category
        })
        localStorage.setItem("wrongQuestions", JSON.stringify(wrongList))
      }
    },
    loadWrongQuestions() {
      const list = JSON.parse(localStorage.getItem("wrongQuestions") || "[]")
      if (list.length === 0) {
        this.wrongQuestions = [
          {
            id: "placeholder",
            question: "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 目前沒有錯題 🎉 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
            options: [],
            answer: 0,
            category: "none",
            isPlaceholder: true
          }
        ]
      } else {
        this.wrongQuestions = list
      }
    },
    removeFromWrongList(id) {
      let wrongList = JSON.parse(localStorage.getItem("wrongQuestions") || "[]")
      wrongList = wrongList.filter(item => item.id !== id)
      localStorage.setItem("wrongQuestions", JSON.stringify(wrongList))
      this.loadWrongQuestions()
    },
    clearAllWrong() {
      localStorage.removeItem("wrongQuestions")
      this.loadWrongQuestions()
    }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "questions"))
    this.questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: "unanswered",
      expanded: false
    }))
    this.applySavedProgress()
    this.loadWrongQuestions()
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
