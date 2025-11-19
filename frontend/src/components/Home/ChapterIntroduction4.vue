<template>
  <div class="chapter-intro-section w-full bg-bgg py-12">
    <div class="max-w-7xl mx-auto px-8 md:px-16">
      <div class="split-layout">
        <div class="story-side story-content">
          <h3 class="section-title">事件大綱：</h3>
          <p class="story-text">夜裡的資安小鎮被入侵了。</p>
          <p class="story-text">成群結隊的「BugBug怪」闖進郵局——</p>
          <p class="story-text">有的偷偷在信件裡塞垃圾，有的亂改地址，有的冒充郵差寄假信！</p>
          <p class="story-text">白貓被嚇得尾巴炸毛：「喵啊！這些小傢伙是從哪裡跑出來的！」</p>
        </div>

        <div class="menu-side chapter-content">
          <h3 class="section-title">主要學習內容：</h3>
          <p class="story-text">這些「BugBug怪」其實象徵網站與應用程式常見的安全漏洞，例如：</p>
          <ul class="list-disc pl-6 space-y-2 story-text">
            <li>Injection（資料注入）：信件內容被惡意插入指令</li>
            <li>Broken Authentication（破損的身份驗證）：假郵差登入系統</li>
            <li>Cross-Site Scripting（跨站指令）：留言板上藏著陷阱</li>
          </ul>
          <p class="story-text">這些問題被 <span class="font-bold text-wordcolor">OWASP</span> 整理起來稱為 <span class="font-bold text-wordcolor">OWASP Top 10</span>。</p>
          <p class="story-text">學會辨識它們，才能讓系統更安全、信件更安心。</p>
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

