<template>
  <div class="npc-menu" v-if="uiStore.isNpcMenuOpen">
    <button class="close-btn" @click="uiStore.closeAllMenus()">×</button>
    <div class="menu-body">
      <div class="menu-left">
        <button  
          v-for="item in menuItems" 
          :key="item.id"
          :class="{ active: currentView === item.id }" 
          @click="currentView = item.id"
          class="menu-button"
          :title="item.name"
        >
          <span class="icon">{{ item.icon }}</span>
        </button>
      </div>

      <div class="menu-right">
      
        <!-- 背包頁面 -->
        <div v-if="currentView === 'inventory'" class="inventory-container">
          <h2>背包</h2>
          <div v-if="inv.loading">載入中...</div>
          <div v-else-if="inv.items.length === 0" class="empty-inventory">
            <p>背包是空的</p>
          </div>
          <div v-else class="inventory-content">
            <div class="inventory-list">
              <div v-for="item in inv.items" :key="item.id" 
                   class="inventory-item" 
                   :class="{ selected: selectedItem?.id === item.id }"
                   @click="selectItem(item)">
                <div class="item-icon">📦</div>
                <div class="item-info">
                  <div class="item-name">{{ item.name || item.key || item.id }}</div>
                  <div class="item-qty">x{{ item.qty || 0 }}</div>
                </div>
              </div>
            </div>
            
            <!-- 物品詳細資訊 -->
            <div v-if="selectedItem" class="item-detail">
              <h3>{{ selectedItem.name || selectedItem.key || selectedItem.id }}</h3>
              <p class="item-description">{{ selectedItem.desc || selectedItem.meta || '無描述' }}</p>
              <div class="item-stats">
                <div class="stat">數量: x{{ selectedItem.qty || 0 }}</div>
                <!--<div class="stat">防禦值: {{ selectedItem.defenseValue || 0 }}</div>-->
                <div class="stat">類型: {{ selectedItem.type || '未知' }}</div>
              </div>
              <div class="item-actions">
                <button class="use-btn" @click="useItem(selectedItem)">使用</button>
                <button class="close-btn" @click="selectedItem = null">x</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 建築商店畫面 -->
        <div v-if="currentView === 'shop'" class="shop-container">
          <BuildingShop @purchaseSuccess="closeMenu" />
        </div>
        <!-- 成就頁面 -->
        <div v-else-if="currentView === 'achievement'" class="achievement-container">
          <AchievementMenu 
            :isVisible="true" 
            @close="currentView = 'shop'" 
          />
        </div>
        
        <!-- 答題紀錄頁面 -->
        <div v-else-if="currentView === 'records'"> 
          <HistoryPanel />
        </div>

        <!-- 其他功能頁面 -->
        <div v-else-if="currentView !== 'inventory'">
          <h2>{{ menuItems.find(i => i.id === currentView)?.name }}</h2>
          <p>此功能開發中...</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue' 
import BuildingShop from '@/components/BuildingShop.vue'
import AchievementMenu from '@/components/AchievementMenu.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import { useUiStore } from '@/stores/ui';
import { useInventoryStore } from '@/stores/inventory.js';
import { useAuthStore } from '@/stores/authStore';

import { usePlayerStore } from '@/stores/player'


const player = usePlayerStore()
const inv = useInventoryStore()
const authStore = useAuthStore(); 

// 選中的物品
const selectedItem = ref(null)

// 點擊物品顯示詳細資訊
function selectItem(item) {
  selectedItem.value = item
  console.log('選中物品:', item)
}

// 使用物品
function useItem(item) {
  console.log('使用物品:', item.name)
  // TODO: 實作使用物品的邏輯
  alert(`使用了 ${item.name}！`)
}



const inventoryStore = useInventoryStore()

onMounted(async () => {
  // 初始化背包，即時監聽 Firestore
  const uid = authStore.user?.uid;

  console.log('🚀 初始化背包，玩家ID:', uid)
  await inventoryStore.init(uid)
  console.log('✅ 背包初始化完成，物品數量:', inventoryStore.items.length)
})


const uiStore = useUiStore();

const menuItems = ref([
  { id: 'inventory', name: '背包', icon: '🎒' },
  { id: 'shop', name: '建築商店', icon: '🏪' },
  { id: 'logs', name: '資安事件紀錄', icon: '📜' },
  { id: 'records', name: '答題紀錄', icon: '📝' },
  { id: 'achievement', name: '成就', icon: '🏆' }, 
]);

const currentView = ref('inventory');

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])


// 在 script setup 中新增
function onUse(item) {
  // 1) 如果你想直接影響 RandomEventModal：你可以發一個全域事件或呼叫 event store
  // 這邊先簡單示範：直接用 inventoryStore.useItem()
  inventoryStore.useItem(item.key).then(() => {
    // 可加提示：例如 UI store 顯示 toastr（或 console）
    console.log('使用物品', item.key)
  })
}

function onDrop(item) {
  if (confirm(`確定丟棄 ${item.name} 嗎？`)) {
    inventoryStore.removeItem(item.key)
  }
}



function closeMenu() {
  emit('close')
}
</script>

<style scoped>
.npc-menu {
  position: absolute;
  bottom: 20px;
  left: 170px;
  width: calc(100% - 200px);
  max-width: 900px;
  height: 70vh;
  max-height: 550px;
  background-color: rgba(230, 240, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  z-index: 10;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  backdrop-filter: blur(5px);
  pointer-events: auto;
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: rgba(0,0,0,0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.close-btn:hover {
    background: rgba(0,0,0,0.4);
}
.menu-body {
  display: flex;
  height: 100%;
}
.menu-left {
  display: flex; 
  flex-direction: column;
  gap: 15px;
  padding-right: 20px;
  border-right: 2px solid rgba(0,0,0,0.1);
}
.menu-button {
  width: 60px;
  height: 60px;
  border: 3px solid transparent;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #3498db;
}

.menu-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 商店容器樣式 */
.shop-container {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.achievement-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}

.achievement-container .achievement-menu {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.achievement-container .achievement-content {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.menu-button.active {
  background-color: #3498db;
  border-color: #2980b9;
}
.menu-button .icon {
  font-size: 28px;
  transition: transform 0.2s;
}
.menu-button.active .icon {
    transform: scale(1.2);
}
.menu-right {
  flex-grow: 1;
  padding-left: 20px;
  overflow-y: auto;
}
.menu-right h2 {
    margin-top: 0;
    color: #2c3e50;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
}
.cell {
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.cell-inner {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.item-name {
  font-size: 10px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1.2;
  margin-bottom: 2px;
}

.item-desc {
  font-size: 8px;
  color: #7f8c8d;
  line-height: 1.1;
  margin-bottom: 2px;
}

.item-qty {
  font-size: 9px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 4px;
}

.item-actions {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.item-actions .btn {
  padding: 2px 4px;
  font-size: 7px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-actions .btn:not(.ghost) {
  background-color: #3498db;
  color: white;
}

.item-actions .btn:not(.ghost):hover {
  background-color: #2980b9;
}

.item-actions .btn.ghost {
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.item-actions .btn.ghost:hover {
  background-color: #e74c3c;
  color: white;
}

/* 背包面板樣式 */
.inventory-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.inventory-container h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
}

.empty-inventory {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 50px;
}

.inventory-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.inventory-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.inventory-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.inventory-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.inventory-item.selected {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.item-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-detail {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(52, 152, 219, 0.3);
}

.item-detail h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
}

.item-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.item-stats {
  margin-bottom: 20px;
}

.stat {
  background: rgba(52, 152, 219, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.use-btn, .close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.use-btn {
  background: #27ae60;
  color: white;
}

.use-btn:hover {
  background: #229954;
}

.close-btn {
  background: #95a5a6;
  color: white;
}

.close-btn:hover {
  background: #7f8c8d;
}

.item-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 8px;
}

.item-desc {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.item-qty {
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.item-defense {
  color: #27ae60;
  font-weight: bold;
  font-size: 14px;
}
</style>