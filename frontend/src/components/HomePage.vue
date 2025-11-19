<template>
  <div class="font-sans w-full overflow-x-hidden">
    <TitleBar />
    <header class="w-screen bg-bgg py-12"></header>

    <!-- 開頭 -->
    <IntroductionSection />

    <!-- 網路七層 -->
    <div ref="ss">
      <header class="relative w-screen bg-bgg py-32">
        <div class="absolute top-14 left-8 text-wordcolor px-8">
          <h2 class="text-4xl md:text-5xl font-bold">第一章：信件為什麼會寄丟？</h2>
        </div>
      </header>
      <ChapterIntroduction1 />
      <header class="w-screen bg-bgg py-10"></header>
      <SevenStage />
    </div>
    <!-- 第二章：CIA 三元組 -->
    <div ref="ciaSection">
      <header class="relative w-screen bg-bgg py-32">
        <div class="absolute top-14 left-8 text-wordcolor px-8">
          <h2 class="text-4xl md:text-5xl font-bold">第二章：三封被偷看的信（CIA 三元組）</h2>
        </div>
      </header>
      <ChapterIntroduction2 />
      <header class="w-screen bg-bgg py-10"></header>
      <CIABar />
    </div>

    <!-- 第三章：AAA 模型 -->
    <div ref="aaaSection">
      <header class="relative w-screen bg-bgg py-32">
        <div class="absolute top-14 left-8 text-wordcolor px-8">
          <h2 class="text-4xl md:text-5xl font-bold">第三章：誰是假郵差？（AAA 模型）</h2>
        </div>
      </header>
      <ChapterIntroduction3 />
      <header class="w-screen bg-bgg py-10"></header>
      <AAA />
    </div>

    <!-- 第四章：OWASP -->
    <div ref="top10Section">
        <header class="w-screen bg-bgg py-10"></header>
        <header class="relative w-screen bg-bgg py-32">
          <div class="absolute top-14 left-8 text-wordcolor px-8">
            <h2 class="text-4xl md:text-5xl font-bold">第四章：BugBug 郵件風暴！（OWASP Top 10）</h2>
          </div>
        </header>
        <ChapterIntroduction4 />
        <div class="w-screen bg-bgg py-8">
          <p class="text-center text-2xl md:text-3xl font-semibold text-wordcolor tracking-wide">
            OWASP TOP 10 (2019) 內容
          </p>
        </div>
        <NewTOP10 />
    </div>

    <!-- 第五章：密碼學 -->
    <div ref="crypto">
        <header class="relative w-screen bg-bgg py-32">
          <div class="absolute top-14 left-8 text-wordcolor px-8 z-10">
            <h2 class="text-4xl md:text-5xl font-bold">第五章：祕密信封的魔法（密碼學）</h2>
          </div>
        </header>
        <header class="w-screen bg-bgg py-10"></header>

        <ChapterIntroduction5 />
        <WhyCrypto />
        <header class="w-screen bg-bgg py-32"></header>

        <Concept />
        <Key />

        <header class="w-screen bg-bgg py-16"></header>
        <SymmetricEncryptionAndAES />
        <header class="w-screen bg-bgg py-16"></header>

        <AsymmetricEncryptionAndRSA />
        <header class="w-screen bg-bgg py-16"></header>

        <WhyAsymmetric />
        <HashAll />

        <header class="w-screen bg-bgg py-16"></header>
        <DH />
        <header class="w-screen bg-bgg py-16"></header>
    </div>


    <!-- 結尾提示 -->

    <Menu />
  </div>
</template>

<script setup>
import TitleBar from "@/components/Home/TitleBar.vue"
import CIABar from "@/components/Home/CIABar.vue"
import HashAll from "@/components/Home/HashAll.vue"
import NewTOP10 from "@/components/Home/NewTOP10.vue"
import Menu from "@/components/Home/Menu.vue"
import SymmetricEncryptionAndAES from "@/components/Home/SymmetricEncryptionAndAES.vue"
import AsymmetricEncryptionAndRSA from "@/components/Home/AsymmetricEncryptionAndRSA.vue"
import DH from "@/components/Home/DH.vue"
import SevenStage from "@/components/Home/SevenStage.vue"
import IntroductionSection from "@/components/Home/IntroductionSection.vue"
import ChapterIntroduction1 from "@/components/Home/ChapterIntroduction1.vue"
import ChapterIntroduction2 from "@/components/Home/ChapterIntroduction2.vue"
import ChapterIntroduction3 from "@/components/Home/ChapterIntroduction3.vue"
import ChapterIntroduction4 from "@/components/Home/ChapterIntroduction4.vue"
import ChapterIntroduction5 from "@/components/Home/ChapterIntroduction5.vue"
import AAA from "@/components/Home/3A.vue"
import Concept from "@/components/Home/Concept.vue"
import WhyCrypto from "@/components/Home/WhyCrypto.vue"
import Key from "@/components/Home/Key.vue"
import WhyAsymmetric from "@/components/Home/WhyAsymmetric.vue"

defineOptions({ name: "SecurityEducationPage" })
</script>

<style>
body {
  background-image: url('/src/assets/image/AAA.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-attachment: fixed;
}
button:focus {
  outline: none;
}

button:hover {
  outline: none;
  border: none;
}

button {
  outline: none;
  border: none;
}
</style>

