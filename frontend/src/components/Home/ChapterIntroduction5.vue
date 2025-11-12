<template>
  <div class="chapter-intro-section w-full bg-bgg py-12">
    <div class="max-w-7xl mx-auto px-8 md:px-16">
      <div class="split-layout">
        <div class="story-side story-content">
          <h3 class="section-title">事件大綱：</h3>
          <p class="story-text">白貓想給遠方的朋友寄一封驚喜信，但又怕信被偷看。</p>
          <p class="story-text">牠在郵局地下室發現一本古老的《加密郵件魔法書》。</p>
          <p class="story-text">「喵～只要用對的信封，就能讓只有收件貓能打開！」</p>
        </div>

        <div class="menu-side chapter-content">
          <h3 class="section-title">主要學習內容：</h3>
          <p class="story-text">這章要學的就是 <span class="font-bold text-wordcolor">密碼學（Cryptography）</span>。</p>
          <p class="story-text">它就像郵件世界的魔法：</p>
          <ul class="list-disc pl-6 space-y-2 story-text">
            <li>加密（Encryption）：把內容藏起來，只讓有鑰匙的人能看見</li>
            <li>解密（Decryption）：用鑰匙打開封印，讀出原始信件</li>
            <li>金鑰（Key）：就像開信封的密碼，只有正確的人才拿得到</li>
          </ul>
          <p class="story-text">透過這些技術，白貓的秘密信件才能安全送達，驚喜不被偷看。</p>
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

