<template>
  <div class="help-container">
    <div class="help-content">
      <!-- 資源系統 -->
      <div class="help-block">
        <button class="help-header" @click="open.resources = !open.resources">
          <span>💰 資源系統</span>
          <span class="chevron" :class="{ open: open.resources }">﹀</span>
        </button>
        <div class="help-body" v-show="open.resources">
          <ul>
            <li><strong>科技點</strong>：用於購買建築物</li>
            <li><strong>防禦值</strong>：用於升級公網塔，每級需要 150 防禦值</li>
            <li>資源不會低於 0（答錯或事件失敗時不會扣到負數）</li>
          </ul>
        </div>
      </div>

      <!-- 解鎖土地 -->
      <div class="help-block">
        <button class="help-header" @click="open.unlock = !open.unlock">
          <span>📝 解鎖土地與答題</span>
          <span class="chevron" :class="{ open: open.unlock }">﹀</span>
        </button>
        <div class="help-body" v-show="open.unlock">
          <p>走到未解鎖的地塊並回答選擇題。答對可解鎖土地並獲得獎勵；答錯會有小額懲罰。</p>
          <ul>
            <li><strong>答對</strong>：+15 科技點、+15 防禦值，並 100% 隨機獲得 1 個防禦工具</li>
            <li><strong>答錯</strong>：-5 科技點、-5 防禦值</li>
            <li>答對題目後可以解鎖新的地塊，用於建造建築</li>
          </ul>
        </div>
      </div>

      <!-- 建築系統 -->
      <div class="help-block">
        <button class="help-header" @click="open.buildings = !open.buildings">
          <span>🏗️ 建築系統</span>
          <span class="chevron" :class="{ open: open.buildings }">﹀</span>
        </button>
        <div class="help-body" v-show="open.buildings">
          <ul>
            <li>只能在<strong>已開發</strong>的地塊上建造建築</li>
            <li>建造建築需要消耗<strong>科技點</strong>（不同建築消耗不同）</li>
            <li><strong>公網塔區域</strong>（中央 3x3 區域）無法放置其他建築</li>
            <li>可以移除已建造的建築（會同時刪除相關連線）</li>
          </ul>
        </div>
      </div>

      <!-- 防火牆系統 -->
      <div class="help-block">
        <button class="help-header" @click="open.firewall = !open.firewall">
          <span>🛡️ 防火牆系統</span>
          <span class="chevron" :class="{ open: open.firewall }">﹀</span>
        </button>
        <div class="help-body" v-show="open.firewall">
          <ul>
            <li><strong>WAF</strong>：只能架設在<strong>公網塔</strong>上</li>
            <li><strong>NWF</strong>：只能架設在<strong>路由器 (Router)</strong>上</li>
            <li><strong>HF</strong>：只能架設在<strong>主機 (Host)</strong>上</li>
            <li>每個建築只能架設一個防火牆，不能重複架設</li>
          </ul>
        </div>
      </div>

      <!-- 連線系統 -->
      <div class="help-block">
        <button class="help-header" @click="open.connections = !open.connections">
          <span>🔗 連線系統</span>
          <span class="chevron" :class="{ open: open.connections }">﹀</span>
        </button>
        <div class="help-body" v-show="open.connections">
          <ul>
            <li>可以連接不同的建築物，建立網路架構</li>
            <li>連線有特定的規則限制（詳見連線提示）</li>
            <li>移除建築時會自動刪除相關連線</li>
            <li>可以手動刪除不需要的連線</li>
          </ul>
        </div>
      </div>

      <!-- 資安事件 -->
      <div class="help-block">
        <button class="help-header" @click="open.events = !open.events">
          <span>⚡ 資安事件</span>
          <span class="chevron" :class="{ open: open.events }">﹀</span>
        </button>
        <div class="help-body" v-show="open.events">
          <p>解鎖土地時可能觸發資安事件。請在 NPC 菜單的「資安事件紀錄」使用合適工具處理。</p>
          <ul>
            <li>需要使用<strong>正確的防禦工具</strong>來抵擋攻擊</li>
            <li><strong>成功抵擋</strong>：獲得獎勵，維持資源</li>
            <li><strong>失敗</strong>：扣除科技點和防禦值（通常為 -10）</li>
            <li>安全區域 (x,y 在 0~4) 不會觸發事件</li>
            <li>距離越遠、邊界地帶觸發機率越高（最高 80%）</li>
            <li>每個事件有<strong>冷卻時間</strong>，不會連續觸發相同事件</li>
          </ul>
        </div>
      </div>

      <!-- 防禦工具 -->
      <div class="help-block">
        <button class="help-header" @click="open.tools = !open.tools">
          <span>🛡️ 防禦工具</span>
          <span class="chevron" :class="{ open: open.tools }">﹀</span>
        </button>
        <div class="help-body" v-show="open.tools">
          <ul>
            <li>答對題目保證掉落 1 個工具，存在於背包中</li>
            <li>可用於處理特定資安事件</li>
            <li>使用錯誤的工具仍會消耗，但無法解決事件</li>
            <li>在 NPC 選單的「資安事件紀錄」中可以查看並處理事件</li>
          </ul>
        </div>
      </div>

      <!-- 公網塔升級 -->
      <div class="help-block">
        <button class="help-header" @click="open.castle = !open.castle">
          <span>🏰 公網塔升級</span>
          <span class="chevron" :class="{ open: open.castle }">﹀</span>
        </button>
        <div class="help-body" v-show="open.castle">
          <ul>
            <li>公網塔可以升級，最高等級為 <strong>10 級</strong></li>
            <li>每升一級需要 <strong>150 防禦值</strong></li>
            <li>升級公式：等級 N 需要 N × 150 防禦值</li>
            <li>公網塔等級會影響遊戲進度和成就解鎖</li>
          </ul>
        </div>
      </div>

      <!-- 介面提示 -->
      <div class="help-block">
        <button class="help-header" @click="open.ui = !open.ui">
          <span>💡 介面提示</span>
          <span class="chevron" :class="{ open: open.ui }">﹀</span>
        </button>
        <div class="help-body" v-show="open.ui">
          <p>點擊下方按鈕可以再次顯示操作提示：</p>
          <button class="tutorial-btn" @click="showTutorial">
            📺 顯示操作提示
          </button>
        </div>
      </div>

    </div>
  </div>
  
</template>

<script setup>
import { reactive } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const open = reactive({
  resources: false,
  unlock: false,
  buildings: false,
  firewall: false,
  connections: false,
  events: false,
  tools: false,
  castle: false,
  controls: false,
  ui: false,
})

function showTutorial() {
  uiStore.triggerHint(true)
}
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

.tutorial-btn {
  width: 100%;
  margin-top: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tutorial-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.tutorial-btn:active {
  transform: translateY(0);
}
</style>
