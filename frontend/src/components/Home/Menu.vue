<template>
  <!-- 固定導覽列 -->
  <div class="fixed top-0 left-0 w-full z-[9999] bg-wordcolor bg-opacity-80 backdrop-blur-md flex justify-between items-center px-10 py-4">

    <!-- 左側 logo + 選單 -->
    <div class="flex items-center space-x-9">
      <!-- menu.gif / menu2.gif  -->
      <img
        :src="isScrolling ? '/src/assets/image/Menu/menu2.gif' : '/src/assets/image/Menu/menu.gif'"
        class="w-14 h-14 cursor-pointer transition-transform "
        alt="回到首頁"
        title="回到首頁"
        @click="goHome"
      />


      <!-- 動態選單按鈕 -->
      <div class="flex space-x-7">
        <button
          v-for="(item, index) in menuItems"
          :key="index"
          @click="handleClick(item)"
          :class="[
            'px-6 py-2 font-semibold rounded-xl shadow-md transition',
            activeSection === item.ref
              ? 'bg-wordcolor text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 右側功能按鈕 -->
    <div class="flex space-x-7">
      <button
        class="px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="goCyberTown"
      >
        資安小鎮
      </button>
      <button
        class="px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="goTrainingRoom"
      >
        練功房
      </button>
      <button
          class="px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
          @click="handleAuthAction"
        >
          {{ isLoggedIn ? '登出' : '登入 / 註冊' }}
        </button>
    </div>
  </div>

  <!-- 右下角 RSA/AES Hash 解說彈窗 -->
  <transition name="fade-left">
    <div
      v-if="showRightDialog"
      class="fixed bottom-6 right-6 bg-white shadow-lg rounded-xl p-4 w-[320px] min-h-[40vh] overflow-auto z-50 flex flex-col"
    >
      <h3 class="font-bold text-black text-[17px] mb-2">{{ activeDialog.title }}</h3>
      <div class="border rounded text-black bg-gray-100 p-3 flex-1 whitespace-pre-wrap" v-html="activeDialog.displayContent"></div>

      <!-- 功能按鈕 -->
      <div class="flex justify-end items-center mt-3 space-x-2">
        <!-- 加密 -->
        <button
          v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
          class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
          @click="showEncryptFull"
        >
          加密
        </button>
        <!-- 解密 -->
        <button
          v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
          class="px-4 py-2 bg-pinkGray text-white rounded hover:bg-pinkGrayPressed font-semibold"
          @click="showDecryptFull"
        >
          解密
        </button>
        <!-- 關閉 -->
        <button @click="toggleRightDialog" class="absolute top-1 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl bg-white p-2">
          ✕
        </button>
      </div>
    </div>
  </transition>

  <!-- 簡易通知 Toast（取代 alert） -->
  <transition name="fade">
    <div
      v-if="notifyVisible"
      class="fixed top-24 right-6 z-[10000] bg-gray-900 text-white px-5 py-4 rounded-xl shadow-lg flex items-start space-x-3 max-w-[360px]"
      role="status"
      aria-live="polite"
    >
      <span class="material-symbols-outlined text-2xl md:text-3xl">notifications_active</span>
      <div class="flex-1 text-base md:text-lg leading-7 mt-1">{{ notifyMessage }}</div>
    </div>
  </transition>
</template>
<script>
import { getAuth, signOut } from "firebase/auth";

export default {
  data() {
    return {
      isLoggedIn: false,
      isScrolled: false,
      isScrolling: false,
      scrollTimeout: null,
      activeSection: null,
      activeDialog: null,
      showRightDialog: false,

      /* 通知 UI 狀態 */
      notifyVisible: false,
      notifyMessage: "",
      notifyTimeout: null,

      /* 導覽列選項，ref 必須與父層 section 對應 */
      menuItems: [
        { label: "OSI7", ref: "ss" },
        { label: "密碼學", ref: "crypto" },
        { label: "OWASP", ref: "top10Section" },
      ],

      /* 原本你寫的內容流程 */
      dialogBlocks: [
        {
          selector: ".rsa-section",
          title: "RSA\n加密解密過程",
          encryptSteps: ["1. 準備明文 M", "2. 使用接收方公鑰 (e, n)", "3. C = M^e mod n → 得到密文"],
          decryptSteps: ["1. 準備密文 C", "2. 使用私鑰 (d, n)", "3. M = C^d mod n → 得到明文"],
          displayContent: "",
        },
        {
          selector: ".aes-section",
          title: "AES\n加密解密過程",
          encryptSteps: ["1. 準備明文", "2. 使用對稱金鑰", "3. 產出密文"],
          decryptSteps: ["1. 準備密文", "2. 使用相同金鑰", "3. 還原明文"],
          displayContent: "",
        },
        {
          selector: ".hash-section",
          title: "Hash\n雜湊過程",
          encryptSteps: ["1. 輸入明文", "2. 使用 SHA-256 等演算法", "3. 產生固定長度雜湊值"],
          displayContent: "",
        },
        {
          selector: ".dh-section",
          title: "DH 金鑰交換",
          encryptSteps: ["1. 公開質數 p 和基底 g", "2. A = g^a mod p", "3. B = g^b mod p", "4. 雙方算 K = g^(ab) mod p"],
          displayContent: "",
        },
      ],
      showEventLogDialog: false,
    }
  },

  mounted() {
      window.addEventListener("scroll", this.handleScroll)

      const auth = getAuth()
      this.isLoggedIn = !!auth.currentUser

      auth.onAuthStateChanged((user) => {
        this.isLoggedIn = !!user
      })
    },

    // 根據登入狀態導向練功房
    async goTrainingRoom() {
      try {
        const auth = getAuth()

        // 改成直接使用 auth.currentUser，若無則再檢查
        let user = auth.currentUser
        if (!user) {
          // 等 Firebase 回報狀態，最多等待 1 秒
          user = await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (u) => {
              unsubscribe()
              resolve(u)
            })
            // 若 1 秒內沒回覆，就直接判定為未登入，避免卡住
            setTimeout(() => resolve(null), 1000)
          })
        }
        if (user) {
          console.log("✅ 已登入，前往 /questions")
          this.$router.push("/questions")
        } else {
          console.log("🚫 未登入，導向登入頁")
          this.$router.push({ path: "/login", query: { redirect: "/questions" } })
        }
      } catch (err) {
        console.error("❌ goTrainingRoom 發生錯誤：", err)
      }
    },

   methods: {
       /* 登入 / 登出 */
       async handleAuthAction() {
         const auth = getAuth()

         if (this.isLoggedIn) {
           // 登出並清除 Firebase 的 Token / Session
           await signOut(auth)

           // 如果你還有額外存 localStorage 或 sessionStorage，也一起清除
           // localStorage.clear()
           // sessionStorage.clear()

           this.isLoggedIn = false

           // 導回首頁或登入頁
           this.$router.push("/home")
         } else {
           // 尚未登入 → 跳到登入頁
           this.$router.push("/Login")
         }
       },
      goHome() {
        if (this.$route && this.$route.path === '/home') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          this.$router.push('/home')
        }
      },

      /* 顯示通知（取代 alert） */
      showNotify(message) {
        this.notifyMessage = message
        this.notifyVisible = true
        clearTimeout(this.notifyTimeout)
        this.notifyTimeout = setTimeout(() => {
          this.notifyVisible = false
        }, 5000)
      },
    /* 滾動時：換 gif + 檢查目前區域 */
    handleScroll() {
        // 偵測是否滾到一定距離（控制導覽列黑底 ＆ 第一次變 GIF）
        this.isScrolled = window.scrollY > 10

        // 一滾動就換成 menu2.gif
        this.isScrolling = true

        // 如果之前有計時器 → 清掉
        clearTimeout(this.scrollTimeout)

        // 停止 500ms 後 → 換回 menu.gif
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false
        }, 500)

        // 檢查目前在哪個區塊 → 導覽列對應按鈕變紅
        for (const item of this.menuItems) {
          const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref]
          if (!target) continue
          const rect = target.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
            this.activeSection = item.ref
          }
        }

        // 原本 RSA / AES 顯示功能保持不變…
        this.activeDialog = null
        this.dialogBlocks.forEach((block) => {
          const el = document.querySelector(block.selector)
          if (!el) return
          const rect = el.getBoundingClientRect()
          const visibleRatio =
            (Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)) / rect.height

          if (visibleRatio >= 0.5) {
            this.activeDialog = block
            this.showRightDialog = true
            this.showFullContent(block)
          }
        })

        if (!this.activeDialog) {
          this.showRightDialog = false
        }
      },


    /* 點選導覽列 → 滾至對應區塊 */
    handleClick(item) {
      const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref];
      if (target) target.scrollIntoView({ behavior: "smooth" });
    },

    /* 顯示 AES/RSA 內容 */
    showFullContent(block) {
      block.displayContent = block.encryptSteps.join("<br/>");
    },
    showEncryptFull() {
      this.activeDialog.displayContent = this.activeDialog.encryptSteps.join("<br/>");
    },
    showDecryptFull() {
      if (this.activeDialog.decryptSteps) {
        this.activeDialog.displayContent = this.activeDialog.decryptSteps.join("<br/>");
      }
    },
    toggleRightDialog() {
      this.showRightDialog = !this.showRightDialog;
    },

    /* 去小鎮、練功房 */
    goCyberTown() {
      const user = getAuth().currentUser
      if (!user) {
        this.showNotify('請先登入，才能進入資安小鎮！')
        return
      }
      this.$router.push('/game')
    },

    goTrainingRoom() {
      const user = getAuth().currentUser
      if (!user) {
        this.showNotify('請先登入，才能進入練功房！')
        return
      }
      this.$router.push('/questions')
    },

  }
}
</script>
<style scoped>
.fade-left-enter-active,
.fade-left-leave-active {
  transition: all 0.4s ease;
}
.fade-left-enter-from,
.fade-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
