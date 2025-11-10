<template>
  <section class="w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">

        <!-- 左欄：標題與說明 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">為什麼需要非對稱加密？</h2>
          <div class="leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2"><br/>對稱式加密速度快但存在「金鑰交換問題」。</h4>
            <h4 class="text-2xl font-semibold mb-2">非對稱加密完美解決了這個問題，</h4>
            <h4 class="text-2xl font-semibold mb-2">讓我們能在不安全的網路上建立安全信任。</h4>
          </div>
        </div>

        <!-- 右欄：內容 -->
        <div class="text-left self-start space-y-10">
          <div>
            <h3 class="text-2xl font-semibold mb-3">對稱式加密的限制</h3>
            <ul class="list-disc ml-6 space-y-2 text-base md:text-xl">
              <li>加密與解密使用同一把鑰匙。</li>
              <li>無法安全地在網路上傳送這把鑰匙。</li>
              <li>若鑰匙被攔截，所有資料都暴露。</li>
              <li>鑰匙數量管理困難（每個人都要不同鑰匙）。</li>
            </ul>
          </div>

          <div>
            <h3 class="text-2xl font-semibold mb-3">非對稱加密的解法</h3>
            <ul class="list-disc ml-6 space-y-2 text-base md:text-xl">
              <li>使用一對鑰匙：公鑰與私鑰。</li>
              <li>公鑰可公開分享，私鑰絕對保密。</li>
              <li>解決金鑰交換問題。</li>
              <li>可用於資料加密、簽章與身分驗證。</li>
            </ul>
          </div>

          <div>
            <h3 class="text-2xl font-semibold mb-3">優點與缺點</h3>
            <ul class="list-disc ml-6 space-y-2 text-base md:text-xl">
              <li><strong>優點：</strong> 完美解決金鑰交換問題，提供身分驗證能力。</li>
              <li><strong>缺點：</strong> 加解密速度慢，不適合大量資料。</li>
              <li><strong>實務做法：</strong> 多使用混合加密（Hybrid Encryption）： 用非對稱方式交換金鑰，再用對稱方式加密大量資料。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
