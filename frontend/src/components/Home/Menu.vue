<template>
  <!-- ✅ 固定導覽列 -->
  <div
    class="fixed top-0 left-0 w-full z-[99999] bg-wordcolor bg-opacity-80 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-10 py-4 h-auto md:h-20"
  >

    <!-- 🔹 左側選單 -->
    <div class="order-2 md:order-1 flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 md:flex-none">
      <div class="flex flex-wrap justify-center md:justify-start gap-3 md:gap-5">
        <button
          v-for="(item, index) in menuItems"
          :key="index"
          @click="handleClick(item)"
          :class="[
            'px-4 md:px-5 py-2 text-sm md:text-base font-semibold rounded-xl shadow-md transition',
            activeSection === item.ref
              ? 'bg-wordcolor text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- ✅ 中間網站標題 + 貓 GIF -->
    <div class="order-1 md:order-2 flex flex-col items-center text-center text-white md:flex-1 md:flex-row md:justify-center md:space-x-3">
      <div class="flex flex-col items-center text-center">
        <div class="text-sm font-medium">資安教育網站</div>
        <div class="text-base font-bold">Code Fortress：資安築城記</div>
      </div>
      <!-- ✅ 貓緊貼標題右側 -->
      <img
        :src="isScrolling ? '/src/assets/image/Menu/menu2.gif' : '/src/assets/image/Menu/menu.gif'"
        class="w-14 h-14 md:w-16 md:h-16 mt-2 md:mt-0 cursor-pointer transition-transform hover:scale-110"
        @click="scrollToTop"
      />
    </div>


    <!-- 🔹 右側功能按鈕 -->
    <div class="order-3 flex flex-wrap justify-center md:justify-end gap-3 md:gap-7 md:flex-none">
      <button
        class="px-5 md:px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="goCyberTown"
      >
        資安小鎮
      </button>
      <button
        class="px-5 md:px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="goTrainingRoom"
      >
        練功房
      </button>
      <button
        class="px-5 md:px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-200 transition"
        @click="handleAuthAction"
      >
        {{ isLoggedIn ? '登出' : '登入 / 註冊' }}
      </button>
    </div>
  </div>

  <!-- ✅ 右下角 RSA/AES Hash 解說彈窗 -->
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

      /* ✅ 導覽列選項，ref 必須與父層 section 對應 */
      menuItems: [
        { label: "第一章", ref: "ss" },
        { label: "第二章", ref: "ciaSection" },
        { label: "第三章", ref: "aaaSection" },
        { label: "第四章", ref: "top10Section" },
        { label: "第五章", ref: "crypto" },
      ],

      /* ✅ 原本你寫的內容流程 */
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

    beforeUnmount() {
      window.removeEventListener("scroll", this.handleScroll)
    },

   methods: {
       /* ✅ 登入 / 登出 */
       async handleAuthAction() {
         const auth = getAuth()

         if (this.isLoggedIn) {
           // ✅ 登出並清除 Firebase 的 Token / Session
           await signOut(auth)

           // ✅ 如果你還有額外存 localStorage 或 sessionStorage，也一起清除
           // localStorage.clear()
           // sessionStorage.clear()

           this.isLoggedIn = false

           // ✅ 導回首頁或登入頁
           this.$router.push("/home")
         } else {
           // ✅ 尚未登入 → 跳到登入頁
           this.$router.push("/Login")
         }
       },
    /* ✅ 滾動時：換 gif + 檢查目前區域 */
    handleScroll() {
        // ✅ 偵測是否滾到一定距離（控制導覽列黑底 ＆ 第一次變 GIF）
        this.isScrolled = window.scrollY > 10

        // ✅ 一滾動就換成 menu2.gif
        this.isScrolling = true

        // ✅ 如果之前有計時器 → 清掉
        clearTimeout(this.scrollTimeout)

        // ✅ 停止 500ms 後 → 換回 menu.gif
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false
        }, 500)

        // ✅ 檢查目前在哪個區塊 → 導覽列對應按鈕變紅
        for (const item of this.menuItems) {
          const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref]
          if (!target) continue
          const rect = target.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
            this.activeSection = item.ref
          }
        }

        // ✅ 原本 RSA / AES 顯示功能保持不變…
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


    /* ✅ 點選導覽列 → 滾至對應區塊 */
    handleClick(item) {
      const target = this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref];
      if (target) {
        const offset = 80; // 向上偏移 80px（導覽列高度）
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    },

    /* ✅ 顯示 AES/RSA 內容 */
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

    /* ✅ 去小鎮、練功房 */
    goCyberTown() {
      const user = getAuth().currentUser
      if (!user) {
        alert('請先登入，才能進入資安小鎮！')
        return
      }
      this.$router.push('/game')
    },

    goTrainingRoom() {
      const user = getAuth().currentUser
      if (!user) {
        alert('請先登入，才能進入練功房！')
        return
      }
      this.$router.push('/questions')
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" })
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
</style>
