<template>
  <div class="chapter-intro-section w-full bg-bgg py-12">
    <div class="max-w-7xl mx-auto px-8 md:px-16">
      <div class="split-layout">
        <div class="story-side story-content">
          <h3 class="section-title">事件大綱：</h3>
          <p class="story-text">白貓收到三封奇怪的投訴信：</p>
          <p class="story-text">「我的信被偷看了！（機密性）」</p>
          <p class="story-text">「有人改了我寄的內容！（完整性）」</p>
          <p class="story-text">「為什麼郵局突然當機！（可用性）」</p>
          <p class="story-text">小賽皺著眉毛，趴在郵件堆裡打滾：「喵嗚～這可不是單純寄信問題，這是資安大事件！」</p>
        </div>

        <div class="menu-side chapter-content">
          <h3 class="section-title">主要學習內容：</h3>
          <p class="story-text">所有資訊安全的基礎都來自三大原則：</p>
          <p class="story-text"><span class="font-bold text-wordcolor">機密性（Confidentiality）</span>、<span class="font-bold text-wordcolor">完整性（Integrity）</span>、<span class="font-bold text-wordcolor">可用性（Availability）</span>。</p>
          <p class="story-text">這三個原則就像郵局的三條守則：不能偷看信、不能亂改信、也不能讓郵局壞掉。</p>
          <p class="story-text">這三者合在一起，才是穩固的「資安三角防線」，也是每個系統最重要的核心信念。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* 分割佈局 */
.split-layout {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 5%;
}

/* 左右兩側區塊 */
.story-side,
.menu-side {
  flex: 0 0 45%;
  padding: 2.5rem;
  border-radius: 30px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  background-color: #D7D1E2; /* lightGray 調亮 5% */
  display: flex;
  flex-direction: column;
}

/* 左邊故事區塊 */
.story-side {
  justify-content: center;
}

/* 右邊說明區塊 */
.menu-side {
  justify-content: center;
}

/* 區塊標題 */
.section-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
}

/* 文字樣式 */
.story-text {
  font-size: 1.25rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
  color: #374151;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.story-text:last-child {
  margin-bottom: 0;
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
}
</style>

