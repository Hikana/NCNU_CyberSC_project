<template>
  <div class="font-sans">
    <!-- Title -->
    <TitleBar />

    <!-- CIA Section -->
    <CIABar :ciaElements="ciaElements" />

    <!-- Hash Section -->
    <HashBar />

    <!-- Top10 Section -->
    <TOP10 />

    <!-- 連線按鈕 -->
    <!-- 給按鈕外層加 relative z-10，確保它在最上層 -->
    <div class="relative z-10 flex items-center justify-center min-h-screen w-screen bg-gray-100">
      <button
        @click="goToGame"
        class="rounded-xl px-12 py-4 bg-indigo-600 text-white font-medium
               shadow-sm hover:shadow-md hover:-translate-y-0.5 transition
               focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
               focus-visible:ring-indigo-500">
        進入資安小鎮
      </button>
    </div>
  </div>
</template>

<script>
import TitleBar from "./TitleBar.vue"
import CIABar from "./CIABar.vue"
import HashBar from "./HashBar.vue"
import TOP10 from "./TOP10.vue"

export default {
  name: "HomePage",
  components: { TitleBar, CIABar, HashBar, TOP10 },
  data() {
    return {
      ciaElements: [
        {
          title: "Confidentiality",
          subtitle: "機密性",
          description:
            "僅授權的使用者才能存取資料，保護資訊不被未經授權者揭露或取得。",
        },
        {
          title: "Integrity",
          subtitle: "完整性",
          description:
            "確保資料未經授權不得修改，且修改必須透過授權機制進行。",
        },
        {
          title: "Availability",
          subtitle: "可用性",
          description:
            "確保合法使用者在需要時能夠存取系統與資訊，防止資源被拒絕使用。",
        },
      ],
    }
  },
  methods: {
    goToGame() {
      this.$router.push('/game');
    }
  }
}
</script>

<style scoped>
/* 可以放必要的 HomePage style */
</style>
