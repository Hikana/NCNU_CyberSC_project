<!--A=g^a 各自加強演算法內容算法解釋-->
<template>
  <section class="hash-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 HASH 字 -->
    <div
      class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
    >
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[25rem]"
      >
        HASH
      </span>
    </div>

    <!-- 上半部 說明內容 -->
    <!-- 上半部 說明內容 -->
  <div class="flex-1 flex items-start">
    <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10">

      <!-- 左欄 -->
      <div class="text-left self-start">
        <h2 class="text-5xl font-bold mb-6">雜湊函數 Hash</h2>
        <div class="text-lg md:text-xl leading-relaxed space-y-4">
          <h4 class="text-2xl font-bold mb-2">
            <br/>這不是加密，而是「單向不可逆」的運算。<br/><br/>
            就像把牛肉放進絞肉機，變成絞肉後無法還原成牛肉。<br/>
            只要輸入有一點改變，輸出就會完全不同。
          </h4>
        </div>
      </div>

      <!-- 右欄 -->
      <div class="text-left self-center">
        <div class="mb-8">

          <!-- 優缺點 -->
          <div class="grid grid-cols-2 gap-6 text-lg md:text-xl leading-relaxed mb-10">
            <div>
              <h3 class="text-2xl font-semibold mb-4">優點：</h3>
              <ul class="list-disc pl-6 space-y-1">
                <li>驗證資料完整性</li>
                <li>運算速度快</li>
                <li>無需保存原始資料即可比對</li>
              </ul>
            </div>
            <div>
              <h3 class="text-2xl font-semibold mb-4">缺點：</h3>
              <ul class="list-disc pl-6 space-y-1">
                <li>無法還原原始資料</li>
                <li>可能遭受碰撞攻擊（不同資料產生相同雜湊）</li>
              </ul>
            </div>
          </div>

          <!-- 運作原理 -->
          <div class="mb-10">
            <h3 class="text-2xl font-semibold mb-4">運作原理：</h3>
            <ul class="list-disc pl-6 space-y-1 text-lg md:text-xl italic">
              <li>輸入任何長度的資料 → 經過雜湊演算法 → 產生固定長度的雜湊值。</li>
              <li>相同輸入 → 一定得到相同結果。</li>
              <li>輸入改一個字 → 結果完全不同（雪崩效應）。</li>
              <li>無法從雜湊值反推出原始資料。</li>
            </ul>
          </div>

          <!-- 舉例應用 -->
          <div class="mb-10">
            <h3 class="text-2xl font-semibold mb-4">舉例應用：</h3>
            <ul class="list-disc pl-6 space-y-1 text-lg md:text-xl italic">
              <li class="font-bold">密碼儲存：</li>
              <p>網站不會直接存密碼，而是存 Hash(密碼)。登入時比對雜湊值即可。</p>
              <li class="font-bold">檔案驗證：</li>
              <p>下載軟體時會提供 SHA-256 或 MD5 值，確認檔案是否被竄改。</p>
            </ul>
          </div>

          <!-- 常見演算法 -->
          <div>
            <h3 class="text-2xl font-semibold mb-4">常見演算法：</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
              <span>SHA-256</span>
              <span>SHA-1</span>
              <span>MD-5（已不安全）</span>
            </div>
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
          <label class="block font-semibold mb-2">Plaintext</label>
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
            class="px-6 py-2 bg-blueGray hover:bg-blueGrayPressed rounded text-white font-semibold"
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
            :class="algorithm.safe ? 'bg-wordcolor text-green-400' : 'bg-wordcolor text-red-400'"
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

    const algorithm = ref(algorithms[0]);

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
