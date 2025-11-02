<template>
  <section class="w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">

        <!-- 左欄：標題與說明 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">公鑰 / 私鑰</h2>
          <div class="leading-relaxed space-y-4 mb-8">
            <h4 class="text-2xl font-semibold mb-2"><br/>現代加密（如 SSL/TLS）最常使用非對稱加密。</h4>
            <h4 class="text-2xl font-semibold mb-2">它使用一對數學上相關的鑰匙：公鑰與私鑰。</h4>
            <h4 class="text-2xl font-semibold mb-2">這是網路安全通訊的核心基礎。</h4>
          
          </div>
          
        </div>
        <!-- <span class="font-bold"></span> -->
        <!-- 右欄：內容 -->
        <div class="text-left self-start space-y-10">
          <div>
            <h3 class="text-2xl font-semibold mb-3">公鑰（Public Key）</h3>
            <p class="text-base md:text-xl leading-relaxed mb-3">
              公開的鑰匙，任何人都能拿來加密資料，但無法解密。
              就像是<span class="font-bold">你在銀行開設的「存款帳號」。</span>
            </p>
            <ul class="list-disc ml-6 space-y-2 text-lg">
              <li>用途：任何人都可以<span class="font-bold">用你的「公鑰」（存款帳號）來加密資料（存錢給你），然後傳送給你</span>。 但是，只有你自己能解開這個加密過的資料。</li>
              <li>比喻：想像一個<span class="font-bold">只能鎖上、不能打開的掛鎖</span>。 你可以把這個掛鎖（公鑰）複製很多份，送給所有朋友。 你的朋友把機密文件放進箱子，用你的掛鎖鎖上。 一旦鎖上，他們自己也打不開了。</li>
            </ul>
          </div>

          <div>
            <h3 class="text-2xl font-semibold mb-3">私鑰（Private Key）</h3>
            <p class="text-base md:text-xl leading-relaxed mb-3">
              這是一把<span class="font-bold">「絕對不能告訴任何人的鑰匙」</span>，由你自己私密地保管，就像是你的<span class="font-bold">「提款卡密碼」</span>。
            </p>
            <ul class="list-disc ml-6 space-y-2 text-lg">
              <li>用途：當你收到那個被「公鑰」鎖住的箱子時，<span class="font-bold">全世界只有你</span>，能用你手中的這把「私鑰」來打開它，讀取裡面的機密文件。</li>
            </ul>
          </div>

          <div class="leading-relaxed space-y-4 mb-8">
            <h3 class="text-xl mb-3 font-bold">公鑰負責加密，私鑰負責解密。</h3>
            <h3 class="text-xl mb-3">這對鑰匙是配對的，用公鑰加密的東西，只能用與之配對的私鑰才能解開。</h3>
            <h3 class="text-xl mb-3">這就是 HTTPS 瀏覽器和網站伺服器之間能安全交換資訊的基本原理。</h3>
            
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
