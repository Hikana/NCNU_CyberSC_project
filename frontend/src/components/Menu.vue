<template>
  <div class="fixed bottom-6 left-6 z-50">
    <div class="relative w-40 h-40">
      <!-- GIF -->
      <img 
        src="/src/assets/image/Menu/menu.gif"
        class="w-40 h-40 cursor-pointer hover:scale-110 transition-transform"
        @click="toggleMenu"
      />

      <!-- 選單 -->
      <transition name="fade-up">
        <div
          v-if="isOpen"
          class="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col space-y-3"
        >
          <button
            class="bg-white text-wordcolor font-semibold shadow-lg rounded-lg px-6 py-3 hover:bg-gray-200 transition cursor-pointer"
            @click="goLogin"
          >
            登入
          </button>
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="bg-white text-wordcolor font-semibold shadow-lg rounded-lg px-6 py-3 hover:bg-gray-200 transition cursor-pointer"
            @click="handleClick(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </transition>

      <!-- 左側對話框 -->
      <transition name="fade-left">
        <div
          v-if="activeDialog"
          class="absolute bottom-0 left-full ml-4 bg-white shadow-lg rounded-xl p-4 max-w-xs w-auto min-w-[150px]"
        >
          <h3 class="font-bold text-lg mb-2 whitespace-pre-wrap">{{ activeDialog.title }}</h3>
          <!-- 想知道按鈕 -->
          <button
            class="bg-gray-300 text-black font-semibold shadow-lg rounded-lg px-6 py-2 hover:bg-gray-400 transition cursor-pointer"
            @click="openRightDialog"
          >
            想知道！
          </button>
        </div>
      </transition>
    </div>
  </div>

  <!-- 右下角對話框 -->
  <transition name="fade-left">
    <div
      v-if="showRightDialog"
      class="fixed bottom-6 right-6 bg-white shadow-lg rounded-xl p-4 w-[320px] min-h-[40vh] overflow-auto z-50 flex flex-col"
    >
      <h3 class="font-bold text-lg mb-2">加密 / 解密過程</h3>

      <!-- 內容區 (用 v-html 渲染 HTML 標籤) -->
      <div class="border rounded bg-gray-100 p-3 flex-1 whitespace-pre-wrap" v-html="activeDialog.displayContent">
      </div>

      <!-- 按鈕區塊 -->
      <div class="flex justify-between items-center mt-3">
        <!-- 左下角：下一步 -->
        <button
          v-if="activeDialog.steps.length && activeDialog.currentStep < activeDialog.steps.length"
          class="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-semibold"
          @click="nextStep"
        >
          下一步
        </button>

        <!-- 右下角：加密 / 解密 + 關閉 -->
        <div class="flex space-x-2 ml-auto">
          <button
            v-if="activeDialog.encryptSteps"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
            @click="startEncrypt"
          >
            加密
          </button>
          <button
            v-if="activeDialog.decryptSteps"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
            @click="startDecrypt"
          >
            解密
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
            @click="toggleRightDialog"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    showMenu: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: false,
      activeDialog: null, // 左邊的對話框
      showRightDialog: false, // 右下角對話框

      dialogBlocks: [
        { 
          selector: ".rsa-section", 
          title: "RSA\n加密解密過程", 
          encryptSteps: [
            "1. 準備明文 M (Plaintext)",
            "2. 使用接收方的公開金鑰 (e, n)",
            "3. 套用 RSA 加密：C = M<sup>e</sup> mod n",
            "4. 得到密文 C (Ciphertext)"
          ],
          decryptSteps: [
            "1. 準備密文 C (Ciphertext)",
            "2. 使用自己的私密金鑰 (d, n)",
            "3. 套用 RSA 解密：M = C<sup>d</sup> mod n",
            "4. 還原明文 M (Plaintext)"
          ],
          steps: [],
          currentStep: 0,
          displayContent: ""
        },
        { 
          selector: ".aes-section", 
          title: "AES\n加密解密過程", 
          encryptSteps: [
            "1. 準備明文 (Plaintext)",
            "2. 使用共享金鑰 (Key)",
            "3. 產生密文 (Ciphertext)"
          ],
          decryptSteps: [
            "1. 準備密文 (Ciphertext)",
            "2. 使用相同共享金鑰 (Key)",
            "3. 還原明文 (Plaintext)"
          ],
          steps: [],
          currentStep: 0,
          displayContent: ""
        },
        { 
          selector: ".hash-section", 
          title: "Hash過程", 
          encryptSteps: [
            "1. 輸入明文",
            "2. 套用 Hash 演算法 (如 SHA-256)",
            "3. 輸出固定長度的雜湊值 (Hash)"
          ],
          steps: [],
          currentStep: 0,
          displayContent: ""
        },
        { 
          selector: ".dh-section", 
          title: "DH Key Exchange\n金鑰交換過程", 
          encryptSteps: [
            "1. 公開質數 p 和基底 g",
            "2. Alice 選秘密數 a → A = g<sup>a</sup> mod p",
            "3. Bob 選秘密數 b → B = g<sup>b</sup> mod p",
            "4. Alice 傳 A 給 Bob，Bob 傳 B 給 Alice",
            "5. Alice 計算 K = B<sup>a</sup> mod p = g<sup>ab</sup> mod p",
            "6. Bob 計算 K = A<sup>b</sup> mod p = g<sup>ab</sup> mod p",
            "7. 雙方共享相同的金鑰 K",
          ],
          steps: [],
          currentStep: 0,
          displayContent: ""
        }
      ],

      menuItems: [
        { label: "CIA", type: "scroll", ref: "ciaSection" },
        { label: "密碼學", type: "scroll", ref: "hashSection" },
        { label: "OWASP", type: "scroll", ref: "top10Section" },
        { label: "遊戲", type: "scroll", ref: "gameSection" },
      ],
    }
  },
  mounted() {
    window.addEventListener("scroll", this.checkDialogs)
    this.checkDialogs()
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.checkDialogs)
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen
    },
    openRightDialog() {
      this.showRightDialog = true
    },
    toggleRightDialog() {
      this.showRightDialog = !this.showRightDialog
      // 關閉時 reset
      if (!this.showRightDialog && this.activeDialog) {
        this.resetSteps(this.activeDialog)
      }
    },
    handleClick(item) {
      if (item.type === "scroll") {
        const target =
          this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref]
        if (target) target.scrollIntoView({ behavior: "smooth" })
      }
    },
    goLogin() {
      alert("這裡跳轉到登入頁")
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
      // 左邊框不見時 → 右下角也關閉 + reset
      if (!this.activeDialog) {
        if (this.showRightDialog) {
          this.dialogBlocks.forEach((b) => this.resetSteps(b))
        }
        this.showRightDialog = false
      }
    },

    // 重置步驟
    resetSteps(block) {
      block.steps = []
      block.currentStep = 0
      block.displayContent = ""
    },

    // 開始加密
    startEncrypt() {
      this.resetSteps(this.activeDialog) // reset 重新開始
      this.activeDialog.steps = [...this.activeDialog.encryptSteps]
      this.nextStep()
    },
    // 開始解密
    startDecrypt() {
      this.resetSteps(this.activeDialog) // reset 重新開始
      this.activeDialog.steps = [...this.activeDialog.decryptSteps]
      this.nextStep()
    },
    // 下一步
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
