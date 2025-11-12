<template>
  <section
    class="w-screen min-h-screen bg-bgg text-wordcolor flex flex-col justify-center items-center px-8 py-20 relative overflow-hidden"
  >
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 opacity-5 pointer-events-none">
      <div class="absolute top-20 left-10 w-32 h-32 border-4 border-wordcolor rounded-full"></div>
      <div class="absolute bottom-32 right-20 w-24 h-24 border-4 border-wordcolor rounded-full"></div>
      <div class="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-wordcolor rounded-full"></div>
    </div>

    <div id="titleContainer" class="max-w-5xl text-center space-y-8 relative z-10">
      <!-- 故事內容 - 單一矩形框 -->
      <div class="story-content space-y-6 bg-lightGray rounded-2xl p-8 md:p-12">
        <!-- 第一段 -->
        <div class="story-paragraph fade-in">
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">在一個遙遠又安靜的小鎮裡，</p>
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">貓咪們過著和平又忙碌的生活。</p>
        </div>

        <!-- 第二段 -->
        <div class="story-paragraph fade-in-delay-1">
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">有一天，牠們決定要建立一個<span class="font-bold text-wordcolor text-2xl md:text-3xl">「郵件網路系統」</span>，</p>
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">讓信件能快速、安全地送到每一位貓朋友手中。</p>
        </div>

        <!-- 轉折段 -->
        <div class="story-paragraph fade-in-delay-2 mt-8">
          <p class="text-xl md:text-2xl leading-relaxed text-gray-700 italic">可是，信件經常寄丟、寄錯、甚至被偷看……</p>
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800 mt-4">白貓<span class="font-bold text-wordcolor">小賽（Cipher）</span>每天忙著修郵局，卻怎麼都找不到問題。</p>
        </div>

        <!-- 呼籲段 -->
        <div class="story-paragraph fade-in-delay-3 mt-8">
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">為了讓貓鎮重新恢復秩序，</p>
          <p class="text-xl md:text-2xl leading-relaxed text-gray-800">小賽需要一位<span class="font-bold text-wordcolor text-2xl md:text-3xl">「系統助理」</span>來幫牠一起建造安全的郵件防線。</p>
        </div>

        <!-- 結尾 -->
        <div class="story-paragraph fade-in-delay-4 mt-12">
          <p class="text-2xl md:text-3xl leading-relaxed text-gray-700 mb-6">而那位助理——</p>
          <p class="text-4xl md:text-6xl font-extrabold text-wordcolor mt-6 animate-pulse">
            就是你。
          </p>
        </div>
      </div>
    </div>
  </section>

</template>

<style scoped>
.story-paragraph {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.fade-in {
  animation-delay: 0.2s;
}

.fade-in-delay-1 {
  animation-delay: 0.6s;
}

.fade-in-delay-2 {
  animation-delay: 1s;
}

.fade-in-delay-3 {
  animation-delay: 1.4s;
}

.fade-in-delay-4 {
  animation-delay: 1.8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
