<template>
  <div class="wall-menu" v-if="uiStore.isWallMenuOpen">
    <div class="menu-body">
      <div class="menu-left">
        <button :class="{ active: currentView === 'upgrade' }" @click="currentView = 'upgrade'">城牆升級</button>
        <button :class="{ active: currentView === 'shop' }" @click="currentView = 'shop'">建築商店</button>
      </div>

      <div class="menu-right">
        <div v-if="currentView === 'upgrade'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in buildingsStore.walls" :key="wall.name">
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="wall.adjustment > 1 ? wall.adjustment-- : null">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="wall.adjustment++">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 科技點
              </p>
              <button class="confirm-button" @click="buildingsStore.confirmWallUpgrade(index)">確認</button>
            </div>
          </div>
        </div>

        <div v-else-if="currentView === 'shop'" class="shop-container">
          <div class="shop-list">
            <div class="shop-item" v-for="item in buildingsStore.shopBuildings" :key="item.id">
              <div class="item-image">
                <img :src="item.img" :alt="item.name" class="building-img" />
              </div>
              <div class="tech-cost">消耗科技點：{{ item.techCost }}</div>
              <button class="buy-btn" @click="buildingsStore.buyBuilding(item)">購買</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 移除 props 和 emits，引入需要的 stores
import { useUiStore } from '@/stores/ui';
import { useBuildingsStore } from '@/stores/buildings';

const uiStore = useUiStore();
const buildingsStore = useBuildingsStore();

// `currentView` 是這個元件自己的內部狀態，所以保留
const currentView = ref('upgrade');

// 所有本地的數據和邏輯 (walls, buildings, increase, decrease, etc.) 都被移除
// 因為它們現在都由 Pinia store 統一管理
</script>

<style scoped>
/* 樣式維持不變 */
.wall-menu {
  position: absolute;
  top: 120px;
  right: 40px;
  width: 950px;
  height: 500px;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 1001;
  pointer-events: auto;
}

.menu-body {
  display: flex;
  height: 100%;
}

.menu-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 100px;
  max-width: 100px;
  outline: none;
  box-shadow: none;
}

.menu-left button {
  min-height: 40px;
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 20px;
  background-color: rgb(136, 186, 255);
  cursor: pointer;
}

.menu-left .active {
  background-color: rgb(22, 52, 159);
  color: #fff;
}

.menu-right {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.walls-container {
  display: flex;
  gap: 30px;
  width: 100%;
  justify-content: stretch;
}

.wall-item {
  flex: 2;
  min-width: 180px;
  max-width: 350px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 30px;
  text-align: center;
  font-weight: bold;
  font-size: 25px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 450px;
}
.wall-top { 
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.wall-defense { /* 當前防禦力 */
  margin: 8px 0;
  font-size: 25px;
  margin-bottom: 10px;
}
.wall-bottom { /* 消耗城牆防禦力 */
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25px;
}

.controls {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.controls button {
  font-size: 24px;
  padding: 5px 15px;
  border: none;
  border-radius: 8px;
  background-color: #a5e887;
  color: #222;
  cursor: pointer;
}

.controls button:hover {
  background-color: #7fd36b;
}

.adjust-value {
  font-size: 24px;
  width: 40px;
  display: inline-block;
  text-align: center;
}

.confirm-button {
  margin-top: 15px;
  font-size: 16px;
  padding: 8px 16px;
  background-color: #a5e887;
  color: #222;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #7fd36b;
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
}
.buy-btn:hover {
  background: #7fd36b;
}
.tech-cost {
  margin: 8px 0 8px 0;
  font-size: 1rem;
  color: #226;
  font-weight: 500;
}
</style>