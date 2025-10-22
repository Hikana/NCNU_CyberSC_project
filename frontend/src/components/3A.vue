<template>
  <section class="w-screen min-h-screen bg-bgg relative text-wordcolor flex items-center justify-center">
    <!-- 背景大型文字 AAA -->
    <div class="absolute inset-0 flex justify-center items-center pointer-events-none">
      <span class="text-[20rem] md:text-[35rem] font-extrabold text-wordcolor opacity-5 select-none">A A A</span>
    </div>

    <!-- 內容區 -->
    <div class="relative z-10 flex flex-col md:flex-row gap-10 w-full p-8 md:p-16">
      <!-- 左側說明 -->
      <div class="md:w-1/2 flex flex-col justify-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-wordcolor">
          身份與授權三要素 <span class="italic">AAA</span>
        </h2>
        <div class="text-lg md:text-xl leading-relaxed space-y-6">
          <p class="text-xl md:text-2xl font-semibold mb-4">
            AAA 是身份驗證與授權的核心框架。
          </p>
          <p class="text-xl md:text-2xl font-semibold mb-4">
            它們確保系統能夠辨識使用者身份、限制可執行的操作，
          </p>
          <p class="text-xl md:text-2xl font-semibold mb-4">
            並記錄每一項行為， 讓系統在安全性與可追蹤性之間取得平衡。
          </p>
        </div>
      </div>

      <!-- 右側項目列表 -->
      <div class="md:w-1/2 flex flex-col justify-center gap-6">
        <div
          v-for="(item, index) in aaaElements"
          :key="index"
          :class="{ 'border-b border-wordcolor pb-6': index !== aaaElements.length - 1 }"
        >
          <h3 class="font-semibold text-xl mb-2 text-wordcolor">
            {{ item.title }} {{ item.subtitle }}
          </h3>
          <h3 class="text-wordcolor text-xl ">
            {{ item.description }}
          </h3>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue"

export default {
  name: "AAABar",
  setup() {
    // ✅ AAA 資料內建，不用外部 props
    const aaaElements = ref([
      {
        title: "Authentication",
        subtitle: "身份驗證",
        description:
          "確認使用者是否為本人。常見方式包括帳號密碼、多因素驗證、生物辨識等。",
      },
      {
        title: "Authorization",
        subtitle: "授權",
        description:
          "授予經驗證的使用者特定的資源存取權限，確保權限控制正確執行。",
      },
      {
        title: "Accounting",
        subtitle: "審計",
        description:
          "記錄使用者行為與操作日誌，方便後續的稽核、安全分析與追蹤。",
      },
    ])

    return { aaaElements }
  },
}
</script>
