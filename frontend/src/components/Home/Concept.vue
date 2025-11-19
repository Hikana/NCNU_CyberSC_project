<template>
  <section class="concept-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <div class="flex-1 flex items-start z-10">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10 mt-20">
        <div class="text-left self-start">
          <div class="info-card space-y-4">
            <h2 class="text-3xl md:text-5xl font-bold">明文、密文和密鑰</h2>
            <div class="leading-relaxed space-y-4">
              <h4 class="text-2xl font-semibold">理解加密之前，先要知道三個關鍵字。</h4>
              <h4 class="text-2xl font-semibold">它們是所有密碼學的基礎組件。</h4>
              <h4 class="text-2xl font-semibold">了解這三者，才能明白資料保護的核心原理。</h4>
            </div>
          </div>
          <div class="flex gap-6 mt-8">
            <button
              v-for="item in conceptItems"
              :key="item.id"
              @click="selectedConceptId = item.id"
              :class="[
                'w-20 h-20 rounded-full text-2xl font-bold transition-all duration-300 flex items-center justify-center',
                selectedConceptId === item.id
                  ? 'bg-middleGray text-wordcolor scale-110'
                  : 'bg-bggray text-wordcolor hover:bg-lightGray'
              ]"
            >
              {{ item.short }}
            </button>
          </div>
        </div>

        <div class="text-left self-start">
          <div class="info-card space-y-4">
            <h3 class="font-semibold text-2xl">
              {{ selectedConcept.title }}
            </h3>
            <p class="text-xl leading-relaxed" v-html="selectedConcept.description"></p>
            <p
              v-if="selectedConcept.extra"
              class="text-lg leading-relaxed"
              v-html="selectedConcept.extra"
            ></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const conceptItems = [
  {
    id: "plain",
    short: "明",
    title: "明文 (Plaintext)",
    description:
      '指<span class="font-bold">原始、未加密的訊息</span>，例如你寄出的電子郵件內容「你好，明天中午開會」。<br/>它是可以被任何人直接閱讀與理解的資料。',
  },
  {
    id: "cipher",
    short: "密",
    title: "密文 (Ciphertext)",
    description:
      '經過加密演算法處理後的結果，看起來像<span class="font-bold">亂碼</span>：「aXj9#8dK!qZp@3...」。<br/>即使駭客攔截，也無法解讀出真正內容。',
  },
  {
    id: "key",
    short: "鑰",
    title: "密鑰 (Key)",
    description:
      '<span class="font-bold">加密與解密所使用的「鑰匙」。</span><br/>不同密鑰會對相同明文產生完全不同的密文。<br/><span class="font-bold">鑰匙是整個加密過程中最關鍵的部分。</span>',
    extra: "例如：若用同一把鑰匙加密，任何一方只要擁有該鑰匙，就能將密文解回原文。",
  },
];

const selectedConceptId = ref(conceptItems[0].id);
const selectedConcept = computed(() =>
  conceptItems.find((item) => item.id === selectedConceptId.value) ?? conceptItems[0]
);
</script>

<style scoped>
.concept-section {
  overflow: hidden;
}
</style>
