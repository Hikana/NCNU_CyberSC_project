<template>
  <section class="dh-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景大字 -->
    <div class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[10rem]">
        DIFFIE-HELLMAN
      </span>
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[10rem]">
        KEY EXCHANGE
      </span>
    </div>

    <!-- 上半部 說明 -->
    <div class="flex-1 flex items-start">
    <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10">

      <!-- 左欄 -->
      <div class="text-left self-start">
        <div class="info-card space-y-4">
          <h2 class="text-5xl font-bold">DH 金鑰交換</h2>
          <h2 class="text-4xl font-bold">Diffie-Hellman Key Exchange</h2>
          <div class="text-lg md:text-xl leading-relaxed">
            <h4 class="text-2xl font-bold">
              這不是加密，而是「在不安全的網路中共享一把秘密鑰匙」。<br/><br/>
              像在大庭廣眾混顏色，每個人都公開「底色 + 自己的部分」，<br/>
              但最終只有兩人能算出完全一樣的「最終顏色（共享密鑰）」。
            </h4>
          </div>
        </div>
      </div>

      <!-- 右欄 -->
      <div class="text-left self-center">
        <div class="info-card space-y-8">

          <!-- 優缺點 -->
          <div class="grid grid-cols-2 gap-6 text-lg md:text-xl leading-relaxed">
            <div>
              <h3 class="text-2xl font-semibold mb-4">優點：</h3>
              <ul class="list-disc pl-6 space-y-1">
                <li>可在公開環境建立秘密金鑰</li>
                <li>不需事先見面或傳遞密鑰</li>
              </ul>
            </div>
            <div>
              <h3 class="text-2xl font-semibold mb-4">缺點：</h3>
              <ul class="list-disc pl-6 space-y-1">
                <li>無法驗證對方身份（可能遭中間人攻擊）</li>
                <li>通常需搭配 RSA 或憑證使用</li>
              </ul>
            </div>
          </div>

          <!-- 運作原理 -->
          <div>
            <h3 class="text-2xl font-semibold mb-4">運作原理：</h3>
            <ul class="list-disc pl-6 space-y-1 text-lg md:text-xl italic">
              <li>A 和 B 先公開一個共同底數 (g) 和模數 (p)。</li>
              <li>A 選私密數 a → 算出 g<sup>a</sup> mod p → 傳給 B。</li>
              <li>B 選私密數 b → 算出 g<sup>b</sup> mod p → 傳給 A。</li>
              <li>A 算 (g<sup>b</sup>)<sup>a</sup> mod p，B 算 (g<sup>a</sup>)<sup>b</sup> mod p → 結果相同 = 共享密鑰。</li>
            </ul>
          </div>

          <!-- 舉例 -->
          <div>
            <h3 class="text-2xl font-semibold mb-4">舉例應用：</h3>
            <ul class="list-disc pl-6 space-y-1 text-lg md:text-xl italic">
              <li>HTTPS / TLS 建立安全通道</li>
              <li>VPN (IPSec)</li>
              <li>SSH 連線建立時的金鑰協商</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </div>

    <!-- 下半部 Demo -->
<div class="flex-1 flex items-center justify-center px-8 py-16">
  <div
    class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8"
  >
    <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">
      Diffie–Hellman Key Exchange
    </h2>

    <!-- 金鑰產生 -->
    <div class="mb-6 text-center">
      <button
        @click="generateKeys"
        class="px-6 py-2 bg-gray-400 hover:bg-gray-500 rounded text-white font-semibold"
      >
        產生 Alice 與 Bob 的金鑰
      </button>
      <p v-if="alicePublic" class="mt-2 text-sm text-wordcolor">
        已產生金鑰，可以進行交換
      </p>
    </div>

    <!-- 公鑰顯示 -->
    <div v-if="alicePublic" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block font-semibold mb-2">Alice's Key (a)</label>
        <textarea
          readonly
          class="w-full h-32 p-2 rounded bg-wordcolor text-green-300 font-mono text-xs"
        >{{ alicePublic }}</textarea>
      </div>
      <div>
        <label class="block font-semibold mb-2">Bob's Key (b)</label>
        <textarea
          readonly
          class="w-full h-32 p-2 rounded bg-wordcolor text-green-300 font-mono text-xs"
        >{{ bobPublic }}</textarea>
      </div>
    </div>

    <!-- 共享金鑰 -->
    <div v-if="sharedSecretAlice && sharedSecretBob" class="mt-6">
      <label class="block font-semibold mb-2">共享金鑰 (k)</label>
      <div
        class="p-3 rounded bg-wordcolor text-pink-300 font-mono break-all"
      >
        {{ sharedSecretAlice }}
      </div>
      <p class="mt-2 text-sm text-wordcolor">
        Alice 與 Bob 的共享金鑰一致！
      </p>
    </div>
  </div>
</div>

  </section>
</template>

<script>
export default {
  name: "DhDemo",
  data() {
    return {
      aliceKeys: null,
      bobKeys: null,
      alicePublic: "",
      bobPublic: "",
      sharedSecretAlice: "",
      sharedSecretBob: "",
    };
  },
  methods: {
    async generateKeys() {
      // 產生 Alice 金鑰
      this.aliceKeys = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
      );

      // 產生 Bob 金鑰
      this.bobKeys = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
      );

      // 取出公鑰
      this.alicePublic = await this.exportKey(this.aliceKeys.publicKey);
      this.bobPublic = await this.exportKey(this.bobKeys.publicKey);

      // 交換金鑰，計算共享密鑰
      await this.deriveSharedSecret();
    },
    async exportKey(key) {
      const raw = await crypto.subtle.exportKey("raw", key);
      return btoa(String.fromCharCode(...new Uint8Array(raw)));
    },
    async deriveSharedSecret() {
      // Alice 使用 Bob 的 public key 推導共享金鑰
      const aliceSecret = await crypto.subtle.deriveBits(
        {
          name: "ECDH",
          public: this.bobKeys.publicKey,
        },
        this.aliceKeys.privateKey,
        256
      );

      // Bob 使用 Alice 的 public key 推導共享金鑰
      const bobSecret = await crypto.subtle.deriveBits(
        {
          name: "ECDH",
          public: this.aliceKeys.publicKey,
        },
        this.bobKeys.privateKey,
        256
      );

      this.sharedSecretAlice = this.toHex(aliceSecret);
      this.sharedSecretBob = this.toHex(bobSecret);
    },
    toHex(buffer) {
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    },
  },
};
</script>
