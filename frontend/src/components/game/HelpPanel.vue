<template>
  <div class="help-container">
    <div class="help-content">
      <!-- 解鎖土地 -->
      <div class="help-block">
        <button class="help-header" @click="open.unlock = !open.unlock">
          <span>解鎖土地</span>
          <span class="chevron" :class="{ open: open.unlock }">﹀</span>
        </button>
        <div class="help-body" v-show="open.unlock">
          <p>走到未解鎖的地塊並回答選擇題。答對可解鎖土地並獲得獎勵；答錯會有小額懲罰。</p>
          <ul>
            <li>答對：+50 科技點、+10 防禦值，並 100% 隨機獲得 1 個防禦工具。</li>
            <li>答錯：-5 科技點、-5 防禦值。</li>
          </ul>
        </div>
      </div>

      <!-- 資安事件 -->
      <div class="help-block">
        <button class="help-header" @click="open.events = !open.events">
          <span>資安事件</span>
          <span class="chevron" :class="{ open: open.events }">﹀</span>
        </button>
        <div class="help-body" v-show="open.events">
          <p>解鎖土地時可能觸發資安事件。請在 NPC 菜單的「資安事件紀錄」使用合適工具處理。</p>
          <ul>
            <li>安全區域 (x,y 在 0~4) 不會觸發事件。</li>
            <li>距離越遠、邊界地帶觸發機率越高（最高 80%）。</li>
            <li>目前未解決事件不會自動扣分，僅保留紀錄。</li>
          </ul>
        </div>
      </div>

      <!-- 防禦工具 -->
      <div class="help-block">
        <button class="help-header" @click="open.tools = !open.tools">
          <span>防禦工具</span>
          <span class="chevron" :class="{ open: open.tools }">﹀</span>
        </button>
        <div class="help-body" v-show="open.tools">
          <p>答對題目保證掉落 1 個工具，存在於背包中，可用於處理特定事件。</p>
        </div>
      </div>

      <!-- 介面提示 -->
      <div class="help-block">
        <button class="help-header" @click="open.ui = !open.ui">
          <span>介面提示</span>
          <span class="chevron" :class="{ open: open.ui }">﹀</span>
        </button>
        <div class="help-body" v-show="open.ui">
          <p>畫面左下角會在入場時出現 5 秒提示告知操作與規則入口。</p>
        </div>
      </div>

    </div>
  </div>
  
</template>

<script setup>
import { reactive } from 'vue'

const open = reactive({
  unlock: false,
  events: false,
  tools: false,
  ui: false,
})
</script>

<style scoped>
.help-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}
.help-content {
  width: 100%;
  max-width: 1100px; /* 讓每個框框更寬且置中可讀 */
  margin: 0 auto;
}
.help-content p, .help-content li {
  color: #34495e;
  line-height: 1.6;
}
.help-content ul {
  padding-left: 20px;
}

.help-block {
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  background: #fff;
  margin: 12px 0;
  overflow: hidden;
}

.help-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f7fafc;
  color: #2c3e50;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.chevron {
  display: inline-block;
  transition: transform 0.2s ease;
}
.chevron.open {
  transform: rotate(180deg);
}

.help-body {
  padding: 16px 18px 18px 18px;
  background: #ffffff;
}
</style>
