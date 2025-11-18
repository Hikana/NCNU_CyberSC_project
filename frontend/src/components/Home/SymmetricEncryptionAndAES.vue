<template>
  <section class="aes-section w-screen min-h-screen bg-bgg text-wordcolor flex flex-col relative z-10">
    <!-- 背景 ENCRYPTION 字 -->
    <div
      class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
    >
      <span
        class="font-extrabold text-wordcolor opacity-5 select-none tracking-wider text-[12rem]"
      >
        SYMMETRIC
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
          <div class="info-card space-y-4">
            <h2 class="text-5xl font-bold">對稱式加密</h2>
            <h2 class="text-4xl font-bold">Symmetric Encryption</h2>
            <div class="text-lg md:text-xl leading-relaxed">
              <h4 class="text-2xl font-bold">
                加密和解密使用「同一把」密鑰。<br/><br/>
                這就像你家用的大門鑰匙。你出門時用這把鑰匙鎖上門（加密），<br/>你的家人（接收者）回家時，必須擁有那把一模一樣的鑰匙，<br/>才能把門打開（解密）。
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

            <!-- 運作原理 -->
            <div>
              <h3 class="text-2xl font-semibold mb-4">運作原理：</h3>
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
                <ul class="list-disc pl-6 space-y-1">
                  <li>發送方 (A) 和 接收方 (B) 必須先安全地<span class="font-bold">共享一把「秘密密鑰」。</span></li>
                  <li>A 使用這把密鑰將「明文」訊息加密，產生「密文」。</li>
                  <li>A 將「密文」透過網路傳送給 B（即使被竊聽也沒關係）。</li>
                  <li>B 收到「密文」後，使用<span class="font-bold">同一把「秘密密鑰」</span>將其解密，還原為「明文」。</li>
                </ul>
              </div>
            </div>

            <!-- 舉例 -->
            <div>
              <h3 class="text-2xl font-semibold mb-4">舉例應用：</h3>
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic">
                <ul class="list-disc pl-6 space-y-1">
                  <li class="font-bold">加密壓縮檔 (.zip, .rar)： </li>
                  <p>當您在電腦上壓縮一個資料夾並設定密碼時，您就是在使用對稱式加密（例如 AES 演算法）。 您必須透過其他管道（例如口頭告知、私訊）將這個密碼（密鑰）告訴您的朋友，他才能解壓縮這個檔案。</p>
                  <li class="font-bold">Wi-Fi 安全 (WPA2/WPA3)：</li>
                  <p> 當您的手機連上家中的 Wi-Fi 時，您輸入的「Wi-Fi 密碼」會被用來產生一把共享的「對稱式密鑰」。 之後，您的手機和路由器之間所有的網路流量（例如您瀏覽網頁的內容）都會使用這把密鑰來快速加密和解密。</p>
                  </ul>
              </div>
            </div>

            <!-- 常見演算法 -->
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
            class="px-4 py-2 bg-blueGray hover:bg-blueGrayPressed rounded text-white font-semibold"
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
            class="px-4 py-2 bg-pinkGray hover:bg-pinkGrayPressed rounded text-white font-semibold"
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
        alert("你的Key錯誤了！！");
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
