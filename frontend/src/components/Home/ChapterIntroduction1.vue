<template>
  <div class="chapter-intro-section w-full bg-bgg py-12">
    <div class="max-w-7xl mx-auto px-8 md:px-16">
      <div class="split-layout">
        <!-- 左邊：事件大綱 -->
        <div class="story-side story-content">
          <h3 class="section-title">事件大綱:</h3>
          <p class="story-text">清晨的資安小鎮郵局亂成一團。</p>
          <p class="story-text">白貓小賽一邊追著滿天飛的信，一邊碎碎念：「喵？這封信不是要送到東邊嗎？怎麼跑去魚市場了？」</p>
          <p class="story-text">原來郵件的路線設計有問題，信件在傳送過程中常常迷路、撞在一起，甚至消失。</p>
        </div>

        <!-- 右邊：主要學習內容 -->
        <div class="menu-side chapter-content">
          <h3 class="section-title">主要學習內容:</h3>
          <p class="story-text">在網路世界裡，資料就像一封封郵件，會經過許多中繼站才送到對方手中。</p>
          <p class="story-text">這些傳送路徑由<span class="font-bold text-wordcolor">「網路七層模型（OSI 7 Layers）」</span>負責。</p>
          <p class="story-text">從光電訊號的「實體層」，到貓咪打開信件的「應用層」，每一層都要合作，資料才能準確送達。</p>
          <p class="story-text">只要有一層出錯，就會像資安小鎮的郵件系統一樣——亂糟糟！</p>
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

