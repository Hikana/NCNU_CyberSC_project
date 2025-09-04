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
        <div v-else>
          <h2>{{ menuItems.find(i => i.id === currentView)?.name }}</h2>
          <p>此功能開發中...</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BuildingShop from '@/components/BuildingShop.vue'
import AchievementMenu from '@/components/AchievementMenu.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import { useUiStore } from '@/stores/ui';


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
}
</style>