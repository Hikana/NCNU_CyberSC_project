<template>
  <div class="font-sans">
    <TitleBar />
    <header class="w-screen bg-bgg py-64"></header>
    <header class="w-screen bg-bgg py-12"></header>

    <SectionAnimation
      :lines="[
        '歡迎來到我們的資安教育網站，',
        '首先，讓我們一起認識駭客的種類吧！',
      ]"
    />
    <!-- 引言 -->
    <BlackOrWhite ref="BlackOrWhite" />
    <header class="relative w-screen bg-bgg py-32">
          <div class="absolute top-14 left-8 text-wordcolor px-8">
            <h2 class="text-4xl md:text-5xl font-bold">未來</h2>
          </div>
        </header>
    <Future />

    <!-- 7層 -->
    <SectionAnimation
      :lines="[
        '想守護資訊安全，',
        '得先了解網路的運作方式與保密的核心原則。',
      ]"
    />
    <header class="relative w-screen bg-bgg py-32"></header>
    <SevenStage ref="SevenStage" />

    <header class="w-screen bg-bgg py-16"></header>

    <!-- CIA -->
    <CIABar ref="ciaSection" />

    <!-- AAA -->
    <AAA />
    <!-- 密碼學 -->
    <header class="w-screen bg-bgg py-16"></header>
    <SymmetricEncryptionAndAES ref="hashSection" />
    <header class="w-screen bg-bgg py-16"></header>
    <AsymmetricEncryptionAndRSA ref="rsaSection" />
    <header class="w-screen bg-bgg py-16"></header>
    <!-- Hash -->
    <HashAll />
    <header class="w-screen bg-bgg py-16"></header>
    <DH />
    <header class="w-screen bg-bgg py-16"></header>

    <!-- Top10 -->
    <SectionAnimation
      :lines="[
        '當我們建立網站或應用程式時，',
        '了解常見漏洞就是防禦的第一步！',
      ]"
    />
    <header class="relative w-screen bg-bgg py-32">
      <div class="absolute top-14 left-8 text-wordcolor px-8">
        <h2 class="text-4xl md:text-5xl font-bold">OWASP TOP10</h2>
      </div>
    </header>
    <NewTOP10 ref="top10Section" />

    <!-- 遊戲 -->
    <SectionAnimation
      :lines="[
        '現在，讓我們進入資安小鎮，',
        '親身體驗一場充滿挑戰與學習的資安任務吧！',
        '倘若你想先了解自身能力，',
        '不仿先到「練功坊」試試喔！',
      ]"
    />
    <section
      ref="gameSection"
      class="h-screen bg-green-200 flex items-center justify-center"
    >
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
import NewTOP10 from "./components/NewTOP10.vue"
import Menu from "./components/Menu.vue"
import SymmetricEncryptionAndAES from "./components/SymmetricEncryptionAndAES.vue"
import AsymmetricEncryptionAndRSA from "./components/AsymmetricEncryptionAndRSA.vue"
import DH from "./components/DH.vue"
import BlackOrWhite from "./components/BlackOrWhite.vue"
import SevenStage from "./components/SevenStage.vue"
import SectionAnimation from "./components/SectionAnimation.vue"
import Future from "./components/Future.vue"
import AAA from "./components/3A.vue"

export default {
  name: "SecurityEducationPage",
  components: {
    Future,
    SectionAnimation,
    TitleBar,
    CIABar,
    HashAll,
    NewTOP10,
    Menu,
    SymmetricEncryptionAndAES,
    AsymmetricEncryptionAndRSA,
    DH,
    BlackOrWhite,
    SevenStage,
    AAA,
  },
  data() {
    return {
      showMenu: false,
    }
  },
}
</script>
