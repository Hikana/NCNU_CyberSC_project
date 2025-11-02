<template>
  <section class="w-screen h-auto bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 主內容 -->
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">

        <!-- 左欄：標題與說明 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">為什麼要有密碼學？</h2>
          <div class="leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2"><br/>因為我們需要在「不安全」的環境中，做「安全」的事情。</h4>
            <h4 class="text-2xl font-semibold mb-2">網際網路就像一個大廣場，每一句話都可能被所有人聽見。</h4>
            <h4 class="text-2xl font-semibold mb-2">密碼學就是確保即使資料被攔截，也無法被看懂。</h4>
            </div>
        </div>

        <!-- 右欄：內容 -->
        <div class="text-left self-start space-y-8">
          <div>
            <h3 class="text-2xl font-semibold mb-3">不安全的世界，需要安全的溝通</h3>
            <p class="text-base md:text-xl leading-relaxed">
              想像你在廣場的一端對朋友喊話：「我的銀行密碼是 123456！」  
              所有人都聽到了，駭客也能竊取。  
              密碼學讓我們能在公開環境中仍然安全交流。
            </p>
          </div>

          <div>
            <h3 class="text-2xl font-semibold mb-3">加密的目的</h3>
            <ul class="list-disc ml-6 space-y-2 text-base md:text-xl">
              <li>防止資料被未授權人讀取。</li>
              <li>確保資料在傳輸過程中不被竄改。</li>
              <li>驗證資料來源的真實性。</li>
            </ul>
          </div>        
        </div>
      </div>
    </div>
  </section>
</template>
