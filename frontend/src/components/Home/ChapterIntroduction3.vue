<template>
  <div class="chapter-intro-section w-full bg-bgg py-12">
    <div class="max-w-7xl mx-auto px-8 md:px-16">
      <div class="split-layout">
        <div class="story-side story-content">
          <h3 class="section-title">事件大綱：</h3>
          <p class="story-text">最近郵局裡出現了一隻長得和小賽很像的白貓，大家都搞不清楚誰才是真的。</p>
          <p class="story-text">那隻假郵差還偷拿信件亂送，結果整個小鎮的信箱都寄錯！</p>
          <p class="story-text">小賽只好請你幫忙，建立一套「郵差身分驗證系統」。</p>
        </div>

        <div class="menu-side chapter-content">
          <h3 class="section-title">主要學習內容：</h3>
          <p class="story-text">在資訊安全中，系統要能分辨「誰是誰」，並控制「誰能做什麼」。</p>
          <p class="story-text">這就是 <span class="font-bold text-wordcolor">AAA 模型：</span></p>
          <p class="story-text">Authentication（認證）：確認身份</p>
          <p class="story-text">Authorization（授權）：決定權限</p>
          <p class="story-text">Accounting（稽核）：記錄行為</p>
          <p class="story-text">這三道程序確保郵件的每一步都安全透明，就像在資安小鎮郵局掛名牌、蓋章、登記。</p>
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
  background-color: #FAC6D3;
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
  color: #352E2A;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
}

/* 文字樣式 */
.story-text {
  font-size: 1.25rem;
  line-height: 1.8;
  letter-spacing: 0.3px;
  color: #352E2A;
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

