<template>
  <!-- 選單一開始就顯示，不需要等待駭客頁面 -->
  <div class="fixed bottom-6 left-6 z-[9999]">
    <div class="relative w-40 h-40">
      <!-- GIF -->
      <img
          src="/src/assets/image/Menu/menu.gif"
          class="w-40 h-40 cursor-pointer hover:scale-110 transition-transform"
          @click="toggleMenu"
      />

      <!-- 駭客專用小對話框 -->
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

      <!-- 主選單 -->
      <transition name="fade-up">
        <div
    v-if="isOpen"
    class="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col space-y-3"
>

          <button
  class="bg-white text-wordcolor font-semibold shadow-lg rounded-lg px-7 py-3 hover:bg-gray-200 transition cursor-pointer whitespace-nowrap w-auto inline-flex justify-center"
  @click="goLogin"
>
  登入
</button>

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

      <!-- 左側對話框（AES、RSA、Hash、DH） -->
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
            v-if="
            activeDialog.steps.length &&
            activeDialog.currentStep < activeDialog.steps.length
          "
            class="px-3 py-2 bg-gray-400 text-white rounded hover:border-gray-500 font-semibold"
            @click="nextStep"
        >
          下一步
        </button>

        <div class="flex space-x-2 ml-auto">
          <button
              v-if="
              activeDialog.title.includes('RSA') ||
              activeDialog.title.includes('AES')
            "
              class="px-4 py-2 bg-blueGray text-white rounded hover:bg-blueGrayPressed font-semibold"
              @click="startEncrypt"
          >
            加密
          </button>
          <button
              v-if="
              activeDialog.title.includes('RSA') ||
              activeDialog.title.includes('AES')
            "
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
</template>

<script>
export default {
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
        { label: "OSI7", type: "scroll", ref: "sevenStage" },
        { label: "密碼學", type: "scroll", ref: "ciaBar" },
        { label: "OWASP", type: "scroll", ref: "top10Section" },
        { label: "資安小鎮", type: "scroll", ref: "gameSection" },
      ],
    };
  },
  mounted() {
    window.addEventListener("scroll", this.checkVisibility);
    this.checkVisibility();
    // 首次進入頁面時顯示提示對話框
    setTimeout(() => {
      if (!this.hackerDialogShown) {
        this.showHackerDialog = true;
        this.hackerDialogShown = true;
      }
    }, 1000); // 延遲 1 秒後顯示提示
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.checkVisibility);
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    goLogin() {
      alert("這裡跳轉到登入頁");
    },
    openRightDialog() {
      this.showRightDialog = true;
    },
    toggleRightDialog() {
      this.showRightDialog = !this.showRightDialog;
      if (!this.showRightDialog && this.activeDialog) {
        this.resetSteps(this.activeDialog);
      }
    },
    handleClick(item) {
      if (item.type === "scroll") {
        const target =
            this.$parent.$refs[item.ref]?.$el || this.$parent.$refs[item.ref];
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    },
    checkVisibility() {
      this.checkDialogs();
    },
    checkDialogs() {
      this.activeDialog = null;
      this.dialogBlocks.forEach((block) => {
        const el = document.querySelector(block.selector);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const visibleHeight =
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibleRatio = visibleHeight / rect.height;
        if (visibleRatio >= 0.8) {
          this.activeDialog = block;
        }
      });
      if (!this.activeDialog) {
        if (this.showRightDialog) {
          this.dialogBlocks.forEach((b) => this.resetSteps(b));
        }
        this.showRightDialog = false;
      }
    },
    resetSteps(block) {
      block.steps = [];
      block.currentStep = 0;
      block.displayContent = "";
    },
    startEncrypt() {
      this.resetSteps(this.activeDialog);
      this.activeDialog.steps = [...this.activeDialog.encryptSteps];
      this.nextStep();
    },
    startDecrypt() {
      this.resetSteps(this.activeDialog);
      this.activeDialog.steps = [...this.activeDialog.decryptSteps];
      this.nextStep();
    },
    nextStep() {
      if (this.activeDialog.currentStep < this.activeDialog.steps.length) {
        this.activeDialog.displayContent +=
            this.activeDialog.steps[this.activeDialog.currentStep] + "<br/>";
        this.activeDialog.currentStep++;
      }
    },
  },
};
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