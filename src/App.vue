<template>
  <div class="font-sans">
    <TitleBar />
    <header class="w-screen bg-grass py-64"></header>
    <header class="w-screen bg-grass py-16"></header>

    <!-- CIA -->
    <CIABar ref="ciaSection" :ciaElements="ciaElements" @ciaFinished="showMenu = true" />
    <header class="w-screen bg-wordcolor py-64"></header>

    <!-- 密碼學 -->
     <header class="w-screen bg-grass py-16"></header>
    <SymmetricEncryptionAndAES ref="hashSection" />
    <header class="w-screen bg-grass py-16"></header>
    <AsymmetricEncryptionAndRSA />
    <header class="w-screen bg-grass py-16"></header>
    <!-- Hash -->
    <HashAll />
    <header class="w-screen bg-grass py-16"></header>
    <DH />
    <header class="w-screen bg-grass py-16"></header>
    <header class="w-screen bg-wordcolor py-64"></header>

    <!-- Top10 -->
    <TOP10 ref="top10Section" />

    
    <!-- 遊戲 (假設之後會加) -->
    <section ref="gameSection" class="h-screen bg-green-200 flex items-center justify-center">
      遊戲區塊
    </section>

    <!-- 右下角路標選單 -->
    <Menu :showMenu="showMenu" />
  </div>
</template>

<script>
import TitleBar from "./components/TitleBar.vue"
import CIABar from "./components/CIABar.vue"
import HashAll from "./components/HashAll.vue"
import TOP10 from "./components/TOP10.vue"
import Menu from "./components/Menu.vue"
import SymmetricEncryptionAndAES from "./components/SymmetricEncryptionAndAES.vue"
import AsymmetricEncryptionAndRSA from "./components/AsymmetricEncryptionAndRSA.vue"
import TitleReverse from "./components/TitleReverse.vue"
import DH from "./components/DH.vue"


export default {
  name: "SecurityEducationPage",
  components: { TitleBar, CIABar, HashAll, TOP10, Menu, SymmetricEncryptionAndAES, AsymmetricEncryptionAndRSA, TitleReverse, DH },
  data() {
    return {
      showMenu: false,
      ciaElements: [
        { title: "Confidentiality", subtitle: "機密性", description: "僅授權的使用者才能存取資料，保護資訊不被未經授權者揭露或取得。" },
        { title: "Integrity", subtitle: "完整性", description: "確保資料未經授權不得修改，且修改必須透過授權機制進行。" },
        { title: "Availability", subtitle: "可用性", description: "確保合法使用者在需要時能夠存取系統與資訊，防止資源被拒絕使用。" },
      ],
    }
  },
}
</script>
