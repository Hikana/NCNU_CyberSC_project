<template>
  <div
    class="flex w-full min-h-screen items-center justify-center bg-bgg overflow-hidden relative py-20"
  >
    <div class="split-layout max-w-7xl w-full px-8 md:px-16">
      <!-- 左邊：故事介紹 -->
      <div class="story-side story-content">
        <div class="story-paragraph fade-in">
          <p class="story-text">🐾為了讓郵件順利傳送，小賽決定整理出一份</p>
          <p class="story-text-center"><span class="font-bold text-wordcolor text-xl md:text-2xl">「資安筆記」</span></p>
        </div>
        
        <div style="height: 2rem;"></div>

        <div class="story-paragraph fade-in-delay-1">
          <p class="story-text">筆記裡記錄了所有郵件傳送的秘密——</p>
          <p class="story-text">從資料怎麼傳、要怎麼保護、再到防禦那些調皮的 BugBug！</p>
          <p class="story-text-center"><span class="font-bold text-wordcolor text-xl md:text-2xl"></span> </p>
        </div>
        
        <div style="height: 2rem;"></div>
        
        <div class="story-paragraph fade-in-delay-2">
          <p class="story-text">現在，就讓我們一起翻開筆記，</p>
          <p class="story-text">學習如何成為資安小鎮的守護工程師吧！</p>
          <p class="story-text-center"><span class="font-bold text-wordcolor text-xl md:text-2xl"></span> </p>
        </div>
      </div>

      <!-- 右邊：章節介紹 -->
      <div class="menu-side chapter-content">
        <h2 class="chapter-title story-paragraph fade-in-delay-3">目錄</h2>
        <ul class="chapter-list">
          <li class="story-paragraph fade-in-delay-4">
            <h3 class="font-bold text-wordcolor">🐾第一章：信件為什麼會寄丟？（網路七層）</h3>
            <p>了解資料如何一層層傳遞，讓信件不再迷路。</p>
          </li>

          <li class="story-paragraph fade-in-delay-4">
            <h3 class="font-bold text-wordcolor">🐾第二章：三封被偷看的信（CIA 三元組）</h3>
            <p>學習機密性、完整性與可用性三大守則。</p>
          </li>

          <li class="story-paragraph fade-in-delay-5">
            <h3 class="font-bold text-wordcolor">🐾第三章：誰是假郵差？（AAA 模型）</h3>
            <p>認證、授權、稽核——辨別誰能寄信、誰能收信。</p>
          </li>

          <li class="story-paragraph fade-in-delay-6">
            <h3 class="font-bold text-wordcolor">🐾第四章：BugBug 郵件風暴！（OWASP Top 10）</h3>
            <p>認識十種常見漏洞小怪獸，守護貓鎮郵件安全。</p>
          </li>

          <li class="story-paragraph fade-in-delay-7">
            <h3 class="font-bold text-wordcolor">🐾第五章：祕密信封的魔法（密碼學）</h3>
            <p>用加密與簽章保護信件，讓祕密安全送達。</p>
          </li>
          
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const storyParagraphs = ref([]);
const chapterItems = ref([]);

onMounted(() => {
  // 觸發動畫
  setTimeout(() => {
    storyParagraphs.value = document.querySelectorAll('.story-paragraph');
  }, 100);
});
</script>

<style scoped>
/* 分割佈局 */
.split-layout {
  display: flex;
  justify-content: space-between;
  align-items: stretch; /* 讓兩個框框高度一致 */
  gap: 5%;
}

/* 左右兩側區塊 */
.story-side,
.menu-side {
  flex: 0 0 calc(50% - 0.5cm);
  padding: 2.5rem;
  border-radius: 30px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  background-color: #FAC6D3;
  display: flex;
  flex-direction: column;
}

/* 左邊故事區塊 - 垂直置中 */
.story-side {
  justify-content: center;
}

/* 右邊目錄區塊 */
.menu-side {
  justify-content: flex-start;
}

/* 目錄標題 */
.chapter-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #352E2A;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
}

/* 章節清單 */
.chapter-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-list li {
  margin-bottom: 1rem;
}

.chapter-list li:last-child {
  margin-bottom: 0;
}

.chapter-list h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
  color: #352E2A;
}

.chapter-list p {
  font-size: 1rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
  color: #352E2A;
}

/* 故事段落樣式 */
.story-side p {
  font-size: 1.125rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
  color: #352E2A;
  margin-bottom: 0.5rem;
}

.story-side p:last-child {
  margin-bottom: 0;
}

.story-text {
  white-space: pre-line; /* 保留換行和空格 */
}

.story-text-center {
  text-align: center;
  white-space: pre-line;
}

/* 動畫 */
.story-paragraph {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.fade-in {
  animation-delay: 0.2s;
}

.fade-in-delay-1 {
  animation-delay: 0.6s;
}

.fade-in-delay-2 {
  animation-delay: 1s;
}

.fade-in-delay-3 {
  animation-delay: 1.4s;
}

.fade-in-delay-4 {
  animation-delay: 1.8s;
}

.fade-in-delay-5 {
  animation-delay: 2.2s;
}

.fade-in-delay-6 {
  animation-delay: 2.6s;
}

.fade-in-delay-7 {
  animation-delay: 3s;
}

.fade-in-delay-8 {
  animation-delay: 3.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 手機版響應式 */
@media (max-width: 900px) {
  .split-layout {
    flex-direction: column;
    gap: 2rem;
  }

  .story-side,
  .menu-side {
    flex: 1 1 100%;
    width: 100%;
    padding: 1.25rem;
  }

  .story-side {
    min-height: auto;
  }
}
</style>

