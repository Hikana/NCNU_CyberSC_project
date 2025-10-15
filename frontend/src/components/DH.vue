<template>
  <section class="dh-section w-full min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10 overflow-hidden">
    <!-- 背景大字 -->
    <div class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[20rem]">
        DIFFIE
      </span>
      <span class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[20rem]">
        HELLMAN
      </span>
    </div>

    <!-- 上半部 說明 -->
    <div class="flex-1 flex items-center">
      <div class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10">
        <!-- 左欄 -->
        <div class="text-left self-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            Diffie–Hellman
          </h2>
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            Key Exchange
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">在不安全通道上協商金鑰的方法。</h4>
            <h4 class="text-2xl font-semibold mb-2">Alice 與 Bob 不需直接傳送秘密，就能得到相同金鑰。</h4>
          </div>
        </div>

        <!-- 右欄 -->
        <div class="text-left self-center">
          <div class="mb-8">
            <h3 class="text-2xl font-semibold mb-4">特性：</h3>
            <ul class="list-disc pl-6 space-y-2 text-lg md:text-xl leading-relaxed">
              <li><strong>安全性：</strong>基於離散對數問題，難以破解</li>
              <li><strong>共享秘密：</strong>雙方得到相同金鑰</li>
              <li><strong>防中間人：</strong>需搭配憑證或簽章</li>
            </ul>
          </div>
          <div>
            <h3 class="text-2xl font-semibold mb-4">常見應用：</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
              <span>TLS / HTTPS</span>
              <span>VPN</span>
              <span>安全通訊協定</span>
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
        class="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded text-white font-semibold"
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
          class="w-full h-32 p-2 rounded bg-black/70 text-green-300 font-mono text-xs"
        >{{ alicePublic }}</textarea>
      </div>
      <div>
        <label class="block font-semibold mb-2">Bob's Key (b)</label>
        <textarea
          readonly
          class="w-full h-32 p-2 rounded bg-black/70 text-green-300 font-mono text-xs"
        >{{ bobPublic }}</textarea>
      </div>
    </div>

    <!-- 共享金鑰 -->
    <div v-if="sharedSecretAlice && sharedSecretBob" class="mt-6">
      <label class="block font-semibold mb-2">共享金鑰 (k)</label>
      <div
        class="p-3 rounded bg-black/60 text-pink-300 font-mono break-all"
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
