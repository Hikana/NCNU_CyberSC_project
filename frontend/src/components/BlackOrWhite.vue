<template>
  <section
    class="hacker-section w-screen min-h-screen text-wordcolor flex flex-col relative z-10 bg-cover bg-center"
    style="background-image: url('src/assets/image/AAA.png');"
  >
    <!-- 標題 左上角 -->
    <div ref="BlackOrWhite" class="absolute top-8 left-8 px-8">
      <h2 class="text-4xl md:text-5xl font-bold">駭客與資安的關聯</h2>
    </div>

    <!-- 上半部按鈕 -->
    <div class="flex justify-center gap-16 mt-32 mb-20">
      <button
        @click="showContent('white')"
        class="px-16 py-10 rounded-3xl bg-lightGray text-gray-700 hover:bg-gray-300 font-bold text-3xl transition shadow-lg"
      >
        白帽駭客
      </button>

      <button
        @click="showContent('black')"
        class="px-16 py-10 rounded-3xl bg-gray-700 text-gray-200 hover:bg-gray-700 font-bold text-3xl transition shadow-lg"
      >
        黑帽駭客
      </button>
    </div>

    <!-- 下半部內容 -->
    <div class="flex-1 flex justify-center items-start px-8">
      <transition name="fade" mode="out-in">
        <div
          v-if="active === 'white'"
          key="white"
          class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-10"
        >
          <h3 class="text-3xl font-bold mb-6">白帽駭客</h3>
          <p class="text-xl leading-relaxed mb-4">
            白帽駭客是正向的資安專家，通常協助企業或組織找出系統漏洞，進而提升防護能力。
          </p>
          <ul class="list-disc pl-6 space-y-3 text-lg">
            <li>進行滲透測試</li>
            <li>回報安全漏洞</li>
            <li>協助改善資訊安全</li>
          </ul>
        </div>

        <div
          v-else-if="active === 'black'"
          key="black"
          class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-10"
        >
          <h3 class="text-3xl font-bold mb-6">黑帽駭客</h3>
          <p class="text-xl leading-relaxed mb-4">
            黑帽駭客則是利用漏洞進行惡意攻擊，目的是竊取、破壞或牟取利益。
          </p>
          <ul class="list-disc pl-6 space-y-3 text-lg">
            <li>入侵系統</li>
            <li>竊取個資或機密</li>
            <li>散布惡意程式</li>
          </ul>
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";

export default {
  name: "HackerPage",
  setup() {
    const active = ref(null);

    const showContent = (type) => {
      active.value = active.value === type ? null : type; // 點同一顆可收回
    };

    return { active, showContent };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
