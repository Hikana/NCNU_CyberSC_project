<template>
  <section class="w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">
        <div class="text-left self-start">
          <div class="info-card space-y-4">
            <h2 class="text-3xl md:text-5xl font-bold">公鑰 / 私鑰</h2>
            <div class="leading-relaxed space-y-4">
              <h4 class="text-2xl font-semibold">現代加密（如 SSL/TLS）分為對稱式加密與非對稱加密兩種系統。</h4>
              <h4 class="text-2xl font-semibold">非對稱加密使用一對數學上相關的鑰匙：公鑰與私鑰。</h4>
              <h4 class="text-2xl font-semibold">這是網路安全通訊的核心基礎。</h4>
            </div>
          </div>
          <div class="flex gap-6 mt-8">
            <button
              v-for="item in keyItems"
              :key="item.id"
              @click="selectedKeyId = item.id"
              :class="[
                'w-20 h-20 rounded-full text-2xl font-bold transition-all duration-300 flex items-center justify-center',
                selectedKeyId === item.id
                  ? 'bg-middleGray text-wordcolor scale-110'
                  : 'bg-bggray text-wordcolor hover:bg-lightGray'
              ]"
            >
              {{ item.short }}
            </button>
          </div>
        </div>

        <div class="text-left self-start space-y-8">
          <div class="info-card space-y-3">
            <h3 class="text-2xl font-semibold">{{ selectedKey.title }}</h3>
            <p class="text-base md:text-xl leading-relaxed" v-html="selectedKey.description"></p>
            <ul class="list-disc ml-6 space-y-2 text-lg" v-if="selectedKey.points">
              <li v-for="(point, index) in selectedKey.points" :key="index" v-html="point"></li>
            </ul>
          </div>

          <div class="info-card leading-relaxed space-y-2">
            <h3 class="text-xl font-bold">公鑰負責加密，私鑰負責解密。</h3>
            <h3 class="text-xl">這對鑰匙是配對的，用公鑰加密的東西，只能用與之配對的私鑰才能解開。</h3>
            <h3 class="text-xl">這就是 HTTPS 瀏覽器和網站伺服器之間能安全交換資訊的基本原理。</h3>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const keyItems = [
  {
    id: "public",
    short: "公",
    title: "公鑰（Public Key）",
    description:
      '公開的鑰匙，任何人都能拿來加密資料，但無法解密。就像是<span class="font-bold">你在銀行開設的「存款帳號」。</span>',
    points: [
      '用途：任何人都可以<span class="font-bold">用你的「公鑰」（存款帳號）來加密資料（存錢給你）</span>，然後傳送給你，但只有你自己能解開。',
      '比喻：想像一個<span class="font-bold">只能鎖上、不能打開的掛鎖</span>，你把這個掛鎖（公鑰）送給所有朋友，他們鎖上後自己也無法打開。',
    ],
  },
  {
    id: "private",
    short: "私",
    title: "私鑰（Private Key）",
    description:
      '這是一把<span class="font-bold">「絕對不能告訴任何人的鑰匙」</span>，由你自己私密地保管，就像是你的<span class="font-bold">「提款卡密碼」</span>。',
    points: [
      '用途：當你收到被「公鑰」鎖住的箱子時，<span class="font-bold">全世界只有你</span>能用手中的「私鑰」打開它，讀取裡面的機密資料。',
    ],
  },
];

const selectedKeyId = ref(keyItems[0].id);
const selectedKey = computed(
  () => keyItems.find((item) => item.id === selectedKeyId.value) ?? keyItems[0]
);
</script>
