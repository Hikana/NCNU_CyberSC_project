<template>
  <section class="rsa-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 ENCRYPTION 字 -->
    <div
      class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
    >
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[12rem]"
      >
        ASYMMETRIC
      </span>
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[12rem]"
      >
        ENCRYPTION
      </span>
    </div>

    <!-- 上半部 說明內容 -->
    <div class="flex-1 flex items-start">
      <div
        class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10"
      >
        <!-- 左欄 -->
        <div class="text-left self-start">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            非對稱式加密
          </h2>
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            Asymmetric Cryption
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">
              使用一組「公鑰」與「私鑰」，
            </h4>
            <h4 class="text-2xl font-semibold mb-2">
              公鑰加密的內容必須用私鑰解密。
            </h4>
          </div>
        </div>

        <!-- 右欄 -->
        <div class="text-left self-center">
          <div class="mb-8">
            <div class="grid grid-cols-2 gap-6 text-lg md:text-xl leading-relaxed">
              <div>
                <h3 class="text-2xl font-semibold mb-4">優點：</h3>
                <ul class="list-disc pl-6 space-y-1">
                  <li>解決金鑰分配問題</li>
                  <li>常用於數位簽章、身分驗證</li>
                </ul>
              </div>
              <div>
                <h3 class="text-2xl font-semibold mb-4">缺點：</h3>
                <ul class="list-disc pl-6 space-y-1">
                  <li>加密速度比對稱式慢，<br>不適合大量資料</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-semibold mb-4">常見演算法：</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
              <span>RSA</span>
              <span>ECC</span>
              <span>ElGamal</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部 RSA Demo -->
    <div class="flex-1 flex items-center justify-center px-8">
      <div
        class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">RSA</h2>

        <!-- 金鑰產生 -->
        <div class="mb-6 text-center">
          <button
            @click="generateKeys"
            class="px-6 py-2 bg-gray-400 hover:bg-gray-500 rounded text-white font-semibold"
          >
            產生新的 RSA 公私鑰
          </button>
          <p v-if="publicKeyPem" class="mt-2 text-sm text-black-200 font-bold">
            已產生金鑰，可以進行加解密
          </p>
        </div>

        <!-- 公鑰 / 私鑰 顯示 -->
        <div v-if="publicKeyPem" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block font-semibold mb-2">Public Key</label>
            <textarea
              readonly
              class="w-full h-40 p-2 rounded bg-wordcolor text-green-300 font-mono text-xs"
            >{{ publicKeyPem }}</textarea>
          </div>
          <div>
            <label class="block font-semibold mb-2">Private Key</label>
            <textarea
              readonly
              class="w-full h-40 p-2 rounded bg-wordcolor text-red-300 font-mono text-xs"
            >{{ privateKeyPem }}</textarea>
          </div>
        </div>

        <!-- 明文加密 -->
        <div class="mb-6">
          <label class="block font-semibold mb-2">Plaintext</label>
          <div class="flex gap-2">
            <input
              v-model="plain"
              type="text"
              class="flex-1 p-2 rounded bg-white/80 text-black"
            />
            <button
              @click="encrypt"
              class="px-4 py-2 bg-blueGray hover:bg-blueGrayPressed rounded text-white font-semibold"
            >
              Encrypt
            </button>
          </div>
          <div class="mt-2 text-wordcolor break-all font-mono text-sm">
            {{ encrypted }}
          </div>
        </div>

        <!-- 密文解密 -->
        <div>
          <label class="block font-semibold mb-2">Encrypted</label>
          <div class="flex gap-2">
            <input
              v-model="encrypted"
              type="text"
              class="flex-1 p-2 rounded bg-white/80 text-black"
            />
            <button
              @click="decrypt"
              class="px-4 py-2 bg-pinkGray hover:bg-pinkGrayPressed rounded text-white font-semibold"
            >
              Decrypt
            </button>
          </div>
          <div class="mt-2 text-wordcolor break-all font-mono text-sm">
            {{ decrypted }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "RsaDemo",
  data() {
    return {
      plain: "Hello RSA!",
      encrypted: "",
      decrypted: "",
      publicKey: null,
      privateKey: null,
      publicKeyPem: "",
      privateKeyPem: "",
    };
  },
  methods: {
    async generateKeys() {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048, // key size
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      this.publicKey = keyPair.publicKey;
      this.privateKey = keyPair.privateKey;

      this.publicKeyPem = await this.exportKey(keyPair.publicKey);
      this.privateKeyPem = await this.exportKey(keyPair.privateKey);
    },
    async exportKey(key) {
      const exported = await crypto.subtle.exportKey("spki", key).catch(() =>
        crypto.subtle.exportKey("pkcs8", key)
      );
      const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
      return `-----BEGIN ${key.type.toUpperCase()} KEY-----\n${b64}\n-----END ${key.type.toUpperCase()} KEY-----`;
    },
    async encrypt() {
      try {
        const data = new TextEncoder().encode(this.plain);
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          this.publicKey,
          data
        );
        this.encrypted = btoa(
          String.fromCharCode(...new Uint8Array(encryptedBuffer))
        );
      } catch (err) {
        alert("你沒有產生金鑰！！");
      }
    },
    async decrypt() {
      try {
        const encryptedBytes = new Uint8Array(
          atob(this.encrypted)
            .split("")
            .map((c) => c.charCodeAt(0))
        );
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: "RSA-OAEP" },
          this.privateKey,
          encryptedBytes
        );
        this.decrypted = new TextDecoder().decode(decryptedBuffer);
      } catch (err) {
        alert("Decryption Error: " + err.message);
      }
    },
  },
  
};
</script>