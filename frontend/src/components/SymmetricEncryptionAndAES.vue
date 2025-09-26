<template>
  <section class="w-screen min-h-screen bg-grass text-wordcolor flex flex-col relative z-10">
    <!-- 背景 ENCRYPTION 字 -->
    <div
      class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
    >
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[15rem]"
      >
        SYMMETRIC
      </span>
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[15rem]"
      >
        ENCRYPTION
      </span>
    </div>

    <!-- 上半部 說明內容 -->
    <div class="flex-1 flex items-center">
      <div
        class="w-full px-8 md:px-16 grid md:grid-cols-2 gap-10"
      >
        <!-- 左欄 -->
        <div class="text-left self-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            對稱式加密 Symmetric
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">
              加密與解密使用相同的金鑰。
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
                  <li>速度快</li>
                  <li>效率高</li>
                  <li>適合大量資料傳輸</li>
                </ul>
              </div>
              <div>
                <h3 class="text-2xl font-semibold mb-4">缺點：</h3>
                <ul class="list-disc pl-6 space-y-1">
                  <li>金鑰分配困難</li>
                  <li>若金鑰外洩，安全性受威脅</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-semibold mb-4">常見演算法：</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
              <span>AES</span>
              <span>DES</span>
              <span>3DES</span>
              <span>RC4</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部 AES Demo -->
    <div class="flex-1 flex items-center justify-center px-8">
      <div
        class="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">AES</h2>

        <!-- Key 輸入 -->
      <div class="mb-6">
        <label class="block font-semibold mb-2">Key</label>
        <input
          v-model="key"
          type="text"
          class="w-full p-2 rounded bg-white/80 text-black"
        />
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
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-semibold"
          >
            Encrypt
          </button>
        </div>
        <div id="encText" class="mt-2 text-wordcolor break-all">
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
            class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white font-semibold"
          >
            Decrypt
          </button>
        </div>
        <div id="decText" class="mt-2 text-wordcolor break-all">
          {{ decrypted }}
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";

export default {
  name: "CryptoPage",
  setup() {
    // AES Demo state
    const key = ref("#TheKey");
    const plain = ref("Hello World!");
    const encrypted = ref("QfKvmv2wlAMhqXYM1c5gzLcrf24x+qnMXIwHpNqO4Os=");
    const decrypted = ref("");

    const createCryptoKey = async (keyStr, keyUsage) => {
      const hashBuffer = await window.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(keyStr)
      );
      let keyPart = new Uint8Array(hashBuffer.slice(0, 16));
      let ivPart = new Uint8Array(hashBuffer.slice(16));

      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyPart,
        { name: "AES-CBC" },
        false,
        [keyUsage]
      );
      return { cryptoKey, ivPart };
    };

    const encryptData = async (plain, keyStr) => {
      const { cryptoKey, ivPart } = await createCryptoKey(keyStr, "encrypt");
      const data = new TextEncoder().encode(plain);
      const encryptedBytes = await window.crypto.subtle.encrypt(
        { name: "AES-CBC", iv: ivPart },
        cryptoKey,
        data
      );
      return btoa(String.fromCharCode(...new Uint8Array(encryptedBytes)));
    };

    const decryptData = async (encryptedText, keyStr) => {
      const { cryptoKey, ivPart } = await createCryptoKey(keyStr, "decrypt");
      const dataBytes = new Uint8Array(
        atob(encryptedText)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      const decryptedBytes = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv: ivPart },
        cryptoKey,
        dataBytes
      );
      return new TextDecoder().decode(decryptedBytes);
    };

    const encrypt = async () => {
      try {
        encrypted.value = await encryptData(plain.value, key.value);
      } catch (err) {
        alert("Encryption Error: " + err.message);
      }
    };

    const decrypt = async () => {
      try {
        decrypted.value = await decryptData(encrypted.value, key.value);
      } catch (err) {
        alert("Decryption Error: " + err.message);
      }
    };

    return {
      key,
      plain,
      encrypted,
      decrypted,
      encrypt,
      decrypt,
    };
  },
};
</script>
