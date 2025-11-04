<template>
  <!-- 固定在左下角的選單 -->
  <div class="fixed bottom-6 left-6 z-[9999] flex flex-col items-center space-y-1">
    <!-- GIF 圖示 -->
    <div class="relative w-40 h-40">
      <img
        src="/src/assets/image/Menu/menu.gif"
        class="w-40 h-40 cursor-pointer hover:scale-110 transition-transform"
        @click="toggleMenu"
      />

      <!-- 駭客提示框 -->
      <transition name="fade-left">
        <div
          v-if="showHackerDialog"
          class="absolute bottom-full left-full ml-6 bg-white shadow-2xl rounded-2xl p-4 w-[240px] text-gray-800 relative"
        >
          <button
            @click="showHackerDialog = false"
            class="absolute top-1 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl bg-white p-2"
          >
            ✕
          </button>
          <h3 class="font-bold mb-2 text-base">探索更多！</h3>
          <p class="text-sm leading-relaxed">
            想了解更多資安知識？<br />
            點擊我，帶你快速瀏覽主題！
          </p>
        </div>
      </transition>

      <!-- 展開主選單 -->
      <transition name="fade-up">
        <div
          v-if="isOpen"
          class="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col space-y-3"
        >
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="bg-white text-wordcolor font-semibold shadow-lg rounded-lg px-7 py-3 hover:bg-gray-200 transition cursor-pointer whitespace-nowrap w-auto inline-flex justify-center"
            @click="handleClick(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </transition>

      <!-- 左側說明對話框 -->
      <transition name="fade-left">
        <div
          v-if="activeDialog"
          class="absolute bottom-0 left-full ml-4 bg-white shadow-lg rounded-xl p-4 max-w-xs w-auto min-w-[150px]"
        >
          <h3 class="font-bold text-black text-lg mb-2 whitespace-pre-wrap">
            {{ activeDialog.title }}
          </h3>
          <button
            class="bg-gray-300 text-black font-semibold shadow-lg rounded-lg px-6 py-2 hover:bg-gray-400 transition cursor-pointer"
            @click="openRightDialog"
          >
            想知道！
          </button>
        </div>
      </transition>
    </div>

    <!-- 橘色按鈕區 -->
    <div class="flex space-x-3 mt-1">
      <!-- ✅ 改：資安小鎮按鈕會根據登入狀態自動導向 -->
      <button
        class="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-5 py-2 shadow-md transition"
        @click="goCyberTown"
      >
        資安小鎮
      </button>

      <!-- ✅ 改：練功房按鈕一樣檢查登入狀態 -->
      <button
        class="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-5 py-2 shadow-md transition"
        @click="goTrainingRoom"
      >
        練功房
      </button>
    </div>
  </div>

  <!-- 右下角對話框 -->
  <transition name="fade-left">
    <div
      v-if="showRightDialog"
      class="fixed bottom-6 right-6 bg-white shadow-lg rounded-xl p-4 w-[320px] min-h-[40vh] overflow-auto z-50 flex flex-col"
    >
      <h3 class="font-bold text-black text-[17px] mb-2">{{ activeDialog.title }}</h3>
      <div
        class="border rounded text-black bg-gray-100 p-3 flex-1 whitespace-pre-wrap"
        v-html="activeDialog.displayContent"
      ></div>

      <div class="flex justify-between items-center mt-3">
        <button
          v-if="activeDialog.steps.length && activeDialog.currentStep < activeDialog.steps.length"
          class="px-3 py-2 bg-gray-400 text-white rounded hover:border-gray-500 font-semibold"
          @click="nextStep"
        >
          下一步
        </button>

        <div class="flex space-x-2 ml-auto">
          <button
            v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
            class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
            @click="startEncrypt"
          >
            加密
          </button>
          <button
            v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
            class="px-4 py-2 bg-pinkGray text-white rounded hover:bg-pinkGrayPressed font-semibold"
            @click="startDecrypt"
          >
            解密
          </button>
          <button
            v-if="activeDialog.title.includes('Hash')"
            class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
            @click="startEncrypt"
          >
            雜湊
          </button>
          <button
            v-if="activeDialog.title.includes('DH')"
            class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
            @click="startEncrypt"
          >
            取得金鑰
          </button>
          <button
            @click="toggleRightDialog"
            class="absolute top-1 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl bg-white p-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </transition>
  
  <!-- 資安事件紀錄對話框 -->
  <transition name="fade">
    <div v-if="showEventLogDialog" class="event-log-modal-overlay" @click.self="showEventLogDialog = false">
      <div class="event-log-modal">
        <button class="modal-close-btn" @click="showEventLogDialog = false">×</button>
        <SecurityEventLog />
      </div>
    </div>
  </transition>
</template>

<script>
import { getAuth } from "firebase/auth"
import SecurityEventLog from '@/components/game/SecurityEventLog.vue'

export default {
  components: {
    SecurityEventLog
  },
  data() {
    return {
      isOpen: false,
      activeDialog: null,
      showRightDialog: false,
      showHackerDialog: false,
      hackerDialogShown: false,
      dialogBlocks: [
              {
                selector: ".rsa-section",
                title: "RSA\n加密解密過程",
                encryptSteps: [
                  "1. 準備明文 M (Plaintext)",
                  "2. 使用接收方的公開金鑰 (e, n)",
                  "3. 套用 RSA 加密:C = M<sup>e</sup> mod n",
                  "4. 得到密文 C (Ciphertext)",
                ],
                decryptSteps: [
                  "1. 準備密文 C (Ciphertext)",
                  "2. 使用自己的私密金鑰 (d, n)",
                  "3. 套用 RSA 解密:M = C<sup>d</sup> mod n",
                  "4. 還原明文 M (Plaintext)",
                ],
                steps: [],
                currentStep: 0,
                displayContent: "",
              },
              {
                selector: ".aes-section",
                title: "AES\n加密解密過程",
                encryptSteps: [
                  "1. 準備明文 (Plaintext)",
                  "2. 使用共享金鑰 (Key)",
                  "3. 產生密文 (Ciphertext)",
                ],
                decryptSteps: [
                  "1. 準備密文 (Ciphertext)",
                  "2. 使用相同共享金鑰 (Key)",
                  "3. 還原明文 (Plaintext)",
                ],
                steps: [],
                currentStep: 0,
                displayContent: "",
              },
              {
                selector: ".hash-section",
                title: "Hash\n雜湊過程",
                encryptSteps: [
                  "1. 輸入明文",
                  "2. 套用 Hash 演算法 (如 SHA-256)",
                  "3. 輸出固定長度的雜湊值 (Hash)",
                ],
                steps: [],
                currentStep: 0,
                displayContent: "",
              },
              {
                selector: ".dh-section",
                title: "DH Key Exchange\n金鑰交換過程",
                encryptSteps: [
                  "1. 公開質數 p 和基底 g",
                  "2. Alice 選秘密數 a → A = g<sup>a</sup> mod p",
                  "3. Bob 選秘密數 b → B = g<sup>b</sup> mod p",
                  "4. 交換 A 與 B",
                  "5. 雙方計算出相同金鑰 K = g<sup>ab</sup> mod p",
                ],
                steps: [],
                currentStep: 0,
                displayContent: "",
              },
            ],
      menuItems: [
        { label: "關於駭客", type: "scroll", ref: "blackOrWhite" },
        { label: "OSI7", type: "scroll", ref: "ss" },
        { label: "密碼學", type: "scroll", ref: "crypto" },
        { label: "OWASP", type: "scroll", ref: "top10Section" },
        { label: "資安事件紀錄", type: "dialog", component: "SecurityEventLog" },
      ],
      showEventLogDialog: false,
    }
  },
  mounted() {
    window.addEventListener("scroll", this.checkVisibility)
    this.checkVisibility()
    setTimeout(() => {
      if (!this.hackerDialogShown) {
        this.showHackerDialog = true
        this.hackerDialogShown = true
      }
    }, 1000)
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.checkVisibility)
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen
    },
    goLogin() {
      this.$router.push("/Login")
    },

    // ✅ 根據登入狀態導向資安小鎮
    goCyberTown() {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        this.$router.push("/game") // 已登入
      } else {
        this.$router.push("/Login") // 未登入
      }
    },

    // ✅ 根據登入狀態導向練功房
    goTrainingRoom() {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        this.$router.push("/questions")
      } else {
        this.$router.push("/Login")
      }
    },

    openRightDialog() {
      this.showRightDialog = true
    },
    toggleRightDialog() {
      this.showRightDialog = !this.showRightDialog
      if (!this.showRightDialog && this.activeDialog) {
        this.resetSteps(this.activeDialog)
      }
    },
    handleClick(item) {
      if (item.type === "scroll") {
        const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref]
        if (target) target.scrollIntoView({ behavior: "smooth" })
      } else if (item.type === "dialog") {
        if (item.component === "SecurityEventLog") {
          // 檢查登入狀態
          const auth = getAuth()
          const user = auth.currentUser
          if (user) {
            this.showEventLogDialog = true
            this.isOpen = false // 關閉選單
          } else {
            this.$router.push("/Login")
          }
        }
      }
    },
    checkVisibility() {
      this.checkDialogs()
    },
    checkDialogs() {
      this.activeDialog = null
      this.dialogBlocks.forEach((block) => {
        const el = document.querySelector(block.selector)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const visibleHeight =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
        const visibleRatio = visibleHeight / rect.height
        if (visibleRatio >= 0.8) {
          this.activeDialog = block
        }
      })
      if (!this.activeDialog) {
        if (this.showRightDialog) {
          this.dialogBlocks.forEach((b) => this.resetSteps(b))
        }
        this.showRightDialog = false
      }
    },
    resetSteps(block) {
      block.steps = []
      block.currentStep = 0
      block.displayContent = ""
    },
    startEncrypt() {
      this.resetSteps(this.activeDialog)
      this.activeDialog.steps = [...this.activeDialog.encryptSteps]
      this.nextStep()
    },
    startDecrypt() {
      this.resetSteps(this.activeDialog)
      this.activeDialog.steps = [...this.activeDialog.decryptSteps]
      this.nextStep()
    },
    nextStep() {
      if (this.activeDialog.currentStep < this.activeDialog.steps.length) {
        this.activeDialog.displayContent +=
          this.activeDialog.steps[this.activeDialog.currentStep] + "<br/>"
        this.activeDialog.currentStep++
      }
    },
  },
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

/* 資安事件紀錄對話框樣式 */
.event-log-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.event-log-modal {
  position: relative;
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 700px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  background: rgba(231, 76, 60, 0.9);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(231, 76, 60, 1);
  transform: scale(1.1);
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
