<template>
  <div class="font-sans">
    <!-- title -->
    <TitleBar />
    <header class="w-screen bg-bggray py-64"></header>
    <header class="w-screen bg-bggray py-16"></header>

    <!-- CIA -->
    <CIABar :ciaElements="ciaElements" />
    <header class="w-screen bg-wordcolor py-64"></header>

    <!-- Hash -->
    <HashBar />
    <header class="w-screen bg-wordcolor py-64"></header>

    <!-- Top10 -->
     <TOP10 />
  </div>
</template>

<script>
import TitleBar from "./components/TitleBar.vue"
import CIABar from "./components/CIABar.vue"
import HashBar from "./components/HashBar.vue"
import TOP10 from "./components/TOP10.vue"

export default {
  name: "SecurityEducationPage",
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
}
</script>
