<template>
  <section class="concept-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 主內容 -->
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">
        
        <!-- 左欄：標題與說明 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">明文、密文和密鑰</h2>

          <div class="leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2"><br/>理解加密之前，先要知道三個關鍵字。</h4>
            <h4 class="text-2xl font-semibold mb-2">它們是所有密碼學的基礎組件。</h4>
            <h4 class="text-2xl font-semibold mb-2">了解這三者，才能明白資料保護的核心原理。</h4>
          </div>
        </div>

        <!-- 右欄：主要內容 -->
        <div class="text-left self-start space-y-8">
          <div>
            <h3 class="font-semibold text-2xl mb-3">明文 (Plaintext)</h3>
            <p class="text-xl leading-relaxed">
              指<span class="font-bold">原始、未加密的訊息</span>，例如你寄出的電子郵件內容「你好，明天中午開會」。<br/>
              它是可以被任何人直接閱讀與理解的資料。
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-2xl mb-3">密文 (Ciphertext)</h3>
            <p class="text-xl leading-relaxed">
              經過加密演算法處理後的結果，看起來像<span class="font-bold">亂碼</span>：「aXj9#8dK!qZp@3...」。<br/>
              即使駭客攔截，也無法解讀出真正內容。
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-2xl mb-3">密鑰 (Key)</h3>
            <p class="text-xl leading-relaxed">
              <span class="font-bold">加密與解密所使用的「鑰匙」。</span><br/>
              不同密鑰會對相同明文產生完全不同的密文。<br/>
              <span class="font-bold">鑰匙是整個加密過程中最關鍵的部分。</span>
            </p>
            <p class="text-lg leading-relaxed mt-2">
              例如：若用同一把鑰匙加密，任何一方只要擁有該鑰匙，就能將密文解回原文。
            </p>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script>
export default {
  name: "ConceptSection",
}
</script>

<style scoped>
.concept-section {
  overflow: hidden;
}
</style>
