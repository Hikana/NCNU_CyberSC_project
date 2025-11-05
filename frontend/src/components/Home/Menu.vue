<template>
  <!-- ✅ 固定在畫面頂部的導覽列 -->
  <div class="fixed top-0 left-0 w-full z-[9999] bg-black bg-opacity-80 backdrop-blur-md flex justify-between items-center px-10 py-4">

    <!-- 左側功能按鈕（關於駭客、OSI7...） -->
    <div class="flex space-x-4">
      <button
        v-for="(item, index) in menuItems"
        :key="index"
        class="px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="handleClick(item)"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 右側按鈕（資安小鎮 / 練功房） -->
    <div class="flex space-x-4">
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
    </div>
  </div>

  <!-- ✅ 右下角彈窗：顯示 RSA / AES / Hash / DH 流程 -->
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

      <div class="flex justify-end items-center mt-3 space-x-2">
        <!-- 加密按鈕 -->
        <button
          v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
          class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
          @click="showEncryptFull"
        >
          加密
        </button>
        <!-- 解密按鈕 -->
        <button
          v-if="activeDialog.title.includes('RSA') || activeDialog.title.includes('AES')"
          class="px-4 py-2 bg-pinkGray text-white rounded hover:bg-pinkGrayPressed font-semibold"
          @click="showDecryptFull"
        >
          解密
        </button>
        <!-- 關閉按鈕 -->
        <button @click="toggleRightDialog" class="absolute top-1 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl bg-white p-2" > ✕ </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { getAuth } from "firebase/auth"

export default {
  data() {
    return {
      activeDialog: null,
      showRightDialog: false,
      showTop10Dialog: false,
      top10DialogShown: false,

      dialogBlocks: [
        {
          selector: ".rsa-section",
          title: "RSA\n加密解密過程",
          encryptSteps: [
            "1. 準備明文 M",
            "2. 使用接收方公鑰 (e, n)",
            "3. C = M^e mod n → 得到密文"
          ],
          decryptSteps: [
            "1. 準備密文 C",
            "2. 使用私鑰 (d, n)",
            "3. M = C^d mod n → 得到明文"
          ],
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
          encryptSteps: [
            "1. 公開質數 p 和基底 g",
            "2. Alice 算 A = g^a mod p",
            "3. Bob 算 B = g^b mod p",
            "4. 交換 A / B",
            "5. 雙方算出 K = g^(ab) mod p"
          ],
          displayContent: "",
        },
      ],

      /* ✅ 選單按鈕列表 */
      menuItems: [
        { label: "關於駭客", type: "scroll", ref: "blackOrWhite" },
        { label: "OSI7", type: "scroll", ref: "ss" },
        { label: "密碼學", type: "scroll", ref: "crypto" },
        { label: "OWASP", type: "scroll", ref: "top10Section" },
      ],
    }
  },

  mounted() {
    window.addEventListener("scroll", this.checkVisibility)
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.checkVisibility)
  },

  methods: {
    /* ✅ 導頁至資安小鎮 / 練功房 */
    goCyberTown() {
      const user = getAuth().currentUser
      this.$router.push(user ? "/game" : "/Login")
    },
    goTrainingRoom() {
      const user = getAuth().currentUser
      this.$router.push(user ? "/questions" : "/Login")
    },

    /* ✅ 點按鈕 → 滾動到指定區塊 */
    handleClick(item) {
      if (item.type === "scroll") {
        const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref]
        if (target) target.scrollIntoView({ behavior: "smooth" })
      }
    },

    /* ✅ 滾動後檢查 RSA / AES 是否進入畫面 → 顯示右下角視窗 */
    checkVisibility() {
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

    /* ✅ 預設只顯示加密，不顯示解密 */
    showFullContent(block) {
      block.displayContent = block.encryptSteps.join("<br/>")
    },
    showEncryptFull() {
      if (this.activeDialog) {
        this.activeDialog.displayContent = this.activeDialog.encryptSteps.join("<br/>")
      }
    },
    showDecryptFull() {
      if (this.activeDialog && this.activeDialog.decryptSteps) {
        this.activeDialog.displayContent = this.activeDialog.decryptSteps.join("<br/>")
      }
    },
    toggleRightDialog() {
      this.showRightDialog = !this.showRightDialog
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
</style>
