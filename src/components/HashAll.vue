<!--A=g^a 各自加強演算法內容算法解釋-->
<template>
  <section class="hash-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 HASH 字 -->
    <div
      class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
    >
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[40rem]"
      >
        HASH
      </span>
    </div>

    <!-- 上半部 說明內容 -->
    <div class="flex-1 flex items-center">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10">
        <!-- 左欄 -->
        <div class="text-left self-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            雜湊 Hash Function
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">雜湊是一種對資料的處理方法，透過一連串的演算，</h4>
            <h4 class="text-2xl font-semibold mb-2">將資料轉換成看似亂碼的字串。</h4>
          </div>
        </div>

        <!-- 右欄 -->
        <div class="text-left self-center">
          <div class="mb-8">
            <h3 class="text-2xl font-semibold mb-4">特性：</h3>
            <ul class="list-disc pl-6 space-y-2 text-lg md:text-xl leading-relaxed">
              <li><strong>一致性：</strong>相同輸入，雜湊值相同</li>
              <li><strong>不可逆：</strong>無法從雜湊值反推出原始內容</li>
              <li><strong>抗碰撞：</strong>難以找出不同資料卻產生相同雜湊值</li>
            </ul>
          </div>
          <div>
            <h3 class="text-2xl font-semibold mb-4">常見演算法：</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
              <span>MD-5（不安全）</span>
              <span>SHA-1（不安全）</span>
              <span>SHA-256</span>
              <span>RIPEMD-160</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部 HASH Demo -->
    <div class="flex-1 flex items-center justify-center px-8 py-16">
      <div
        class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">
          Hash Function
        </h2>

        <!-- 輸入 -->
        <div class="mb-6">
          <label class="block font-semibold mb-2">輸入文字</label>
          <input
            v-model="plain"
            type="text"
            class="w-full p-2 rounded bg-white/80 text-black"
          />
        </div>

        <!-- 演算法選擇 -->
        <div class="mb-6">
          <label class="block font-semibold mb-2">選擇演算法</label>
          <select
            v-model="algorithm"
            class="w-full p-2 rounded bg-white/80 text-black"
          >
            <option v-for="algo in algorithms" :key="algo.name" :value="algo">
              {{ algo.name }}
            </option>
          </select>
        </div>

        <!-- 按鈕 -->
        <div class="mb-6 text-center">
          <button
            @click="hashTextFn"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-semibold"
          >
            Hash
          </button>
        </div>

        <!-- 結果 -->
        <div v-if="hashed">
          <label class="block font-semibold mb-2">
            {{ algorithm.name }}
          </label>
          <div
            class="p-3 rounded font-mono break-all"
            :class="algorithm.safe ? 'bg-black/70 text-green-400' : 'bg-black/70 text-red-400'"
          >
            {{ hashed }}
          </div>
          <p
            class="mt-2 text-sm"
            :class="algorithm.safe ? 'text-black-70' : 'text-red-400'"
          >
            {{ algorithm.safe ? '安全演算法' : '已知不安全，僅供示範' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";
import CryptoJS from "crypto-js";

export default {
  name: "HashPage",
  setup() {
    const plain = ref("Hello World!");
    const hashed = ref("");

    const algorithms = [
      { name: "MD-5（不安全）", method: (t) => CryptoJS.MD5(t).toString(), safe: false },
      { name: "SHA-1（不安全）", method: (t) => CryptoJS.SHA1(t).toString(), safe: false },
      { name: "SHA-256", method: (t) => CryptoJS.SHA256(t).toString(), safe: true },
      { name: "RIPEMD-160", method: (t) => CryptoJS.RIPEMD160(t).toString(), safe: true },
    ];

    const algorithm = ref(algorithms[1]);

    const hashTextFn = () => {
      hashed.value = algorithm.value.method(plain.value);
    };

    return {
      plain,
      hashed,
      algorithms,
      algorithm,
      hashTextFn,
    };
  },
};
</script>
