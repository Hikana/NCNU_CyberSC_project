<template>
  <section class="w-full min-h-screen bg-bgg relative text-wordcolor overflow-hidden">

    <!-- CIA 說明內容 -->
    <div
        ref="ciaSection"
        class="absolute inset-0 opacity-0 pointer-events-none flex flex-col md:flex-row gap-10 p-8 md:p-16 transition-opacity duration-1000 z-10"
    >
      <!-- 背景大型文字 CIA -->
      <div class="absolute inset-0 flex justify-center items-center pointer-events-none">
        <span class="text-[20rem] md:text-[35rem] font-extrabold text-wordcolor opacity-5 select-none">C I A</span>
      </div>

      <!-- 前景：左側文字 + 右側三要素 -->
      <div class="relative z-10 flex flex-col md:flex-row gap-10 w-full">
        <!-- 左側說明 -->
        <div class="md:w-1/2 flex flex-col justify-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-wordcolor">
            安全三要素 <span class="italic">CIA</span>
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">CIA資訊安全三要素是常見的模型，</h4>
            <h4 class="text-2xl font-semibold mb-2">構成安全系統開發的基礎。</h4>
            <h4 class="text-2xl font-semibold mb-2">它們是用來尋找弱點和找出建立解決方案的方法。</h4>
          </div>
        </div>

        <!-- 右側項目列表 -->
        <div class="md:w-1/2 flex flex-col justify-center gap-6">
          <div
              v-for="(item, index) in ciaElements"
              :key="index"
              :class="{ 'border-b border-wordcolor pb-6': index !== ciaElements.length - 1 }"
          >
            <h3 class="font-semibold text-2xl md:text-xl mb-2 text-wordcolor">
              {{ item.title }} {{ item.subtitle }}
            </h3>
            <h3 class="text-wordcolor text-2xl md:text-base">{{ item.description }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>

</script>
