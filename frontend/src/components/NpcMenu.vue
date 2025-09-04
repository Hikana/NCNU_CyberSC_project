<template>
  <div class="npc-menu" v-if="visible">
    <div class="menu-body">
      <div class="menu-left">
        <button>背包</button>
        <button :class="{ active: currentView === 'shop' }" @click="currentView = 'shop'">建築商店</button>
        <button>資安事件紀錄</button>
        <button>答題紀錄</button>
        <button :class="{ active: currentView === 'achievement' }" @click="currentView = 'achievement'">成就</button>
      </div>
      <div class="menu-right">
        <!-- 建築商店畫面 -->
        <div v-if="currentView === 'shop'" class="shop-container">
          <div class="shop-list">
            <div class="shop-item" v-for="item in buildings" :key="item.id">
              <div class="item-image">
                <img :src="item.img" :alt="item.name" class="building-img" />
              </div>
              <div class="tech-cost">消耗科技點：{{ item.techCost }}</div>
              <button class="buy-btn" @click="buy(item)">購買</button>
            </div>
          </div>
        </div>
        <!-- 成就頁面 -->
        <div v-else-if="currentView === 'achievement'" class="achievement-container">
          <AchievementMenu 
            :isVisible="true" 
            @close="currentView = 'shop'" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBuildingStore } from '../stores/buildings'
import AchievementMenu from './AchievementMenu.vue'

const buildingStore = useBuildingStore()

defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const currentView = ref('shop') // 確保顯示商店

// 建築圖片導入
import buildingAImg from '../assets/b1.png'
import buildingBImg from '../assets/b2.png'
import buildingCImg from '../assets/b3.png'
import buildingDImg from '../assets/b4.png'
import buildingEImg from '../assets/b5.png'
import buildingFImg from '../assets/b6.png'
import buildingGImg from '../assets/b7.png'
import buildingHImg from '../assets/b8.png'
import buildingIImg from '../assets/b9.png'

const buildings = ref([
  { id: 1, name: '建築A', img: buildingAImg, techCost: 50 },
  { id: 2, name: '建築B', img: buildingBImg, techCost: 60 },
  { id: 3, name: '建築C', img: buildingCImg, techCost: 70 },
  { id: 4, name: '建築D', img: buildingDImg, techCost: 80 },
  { id: 5, name: '建築E', img: buildingEImg, techCost: 90 },
  { id: 6, name: '建築F', img: buildingFImg, techCost: 100 },
  { id: 7, name: '建築G', img: buildingGImg, techCost: 110 },
  { id: 8, name: '建築H', img: buildingHImg, techCost: 120 },
  { id: 9, name: '建築I', img: buildingIImg, techCost: 130 }
])

function buy(item) {
  console.log('NpcMenu: 購買建築', item)
  
  // 設置放置模式
  buildingStore.setPlacementMode(true, item.id)
  
  console.log('NpcMenu: 放置模式設置完成', {
    isPlacing: buildingStore.isPlacing,
    selectedBuildingId: buildingStore.selectedBuildingId
  })
  
  // 關閉選單
  closeMenu()
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
  width: 50%;
  height: 65%;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 30; /* 提高層級 */
  pointer-events: auto; /* 明確設置 */
}

.menu-body {
  display: flex;
  height: 100%;
}

.menu-left {
  display: flex; 
  flex-direction: column;
  gap: 10px;
  width: 120px;
  flex-shrink: 0;
}

.menu-left button {
  min-height: 40px; 
  flex: 1; 
  padding: 1px;
  border: none;
  border-radius: 16px;
  background-color: rgb(136, 186, 255);
  cursor: pointer;
  pointer-events: auto; /* 明確設置按鈕可點擊 */
}

.menu-left .active {
  background-color: rgb(22, 52, 159);
  color: #fff;
}

.menu-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* shopstuff */
.shop-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  pointer-events: auto; /* 確保商店容器可以交互 */
}

.shop-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  height: 100%;
  overflow-y: auto; /* 讓內容可以滾動 */
  padding: 20px;
  box-sizing: border-box;
  pointer-events: auto; 
}

.shop-item {
  background: #fff;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px #0001;
  justify-content: space-between;
  height: 220px;
  pointer-events: auto; /* 確保商品項目可以點擊 */
}

.item-image {
  border-radius: 16px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.building-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none; 
}

.buy-btn {
  background: #a5e887;
  color: #222;
  border: none;
  border-radius: 16px;
  padding: 8px 24px;
  font-size: 1.1rem;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  z-index: 100;
  min-height: 40px;
  width: 100%;
  font-weight: bold;
  pointer-events: auto;
}

.buy-btn:hover {
  background: #7fd36b;
}

.buy-btn:active {
  background: #6bc25a;
  transform: translateY(1px);
}

.tech-cost {
  margin: 8px 0 8px 0;
  font-size: 1rem;
  color: #226;
  font-weight: 500;
  pointer-events: auto;
}

.achievement-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
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
</style>