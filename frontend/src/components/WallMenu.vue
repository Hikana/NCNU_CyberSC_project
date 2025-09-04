<template>
  <div class="wall-menu" v-if="uiStore.isWallMenuOpen">
    <div class="menu-body">
      <div class="menu-left">
        <button :class="{ active: currentView === 'upgrade' }" @click="currentView = 'upgrade'">CIA<br/>城牆升級</button>
        <button :class="{ active: currentView === 'owasp' }" @click="currentView = 'owasp'">OWASP<br/>城牆升級</button>
      </div>

      <div class="menu-right">
        <!-- CIA 升級畫面 -->
        <div v-if="currentView === 'upgrade'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in wallStore.ciaWalls" :key="wall.name">
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="wallStore.decreaseCiaAdjustment(index)">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="wallStore.increaseCiaAdjustment(index)">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 防禦點數
              </p>
              <button class="confirm-button" @click="wallStore.applyCiaUpgrade(index)">確認</button>
            </div>
          </div>
        </div>
        
        <!-- OWASP 升級畫面 -->
        <div v-if="currentView === 'owasp'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in wallStore.owaspWalls" :key="wall.name">
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="wallStore.decreaseOwaspAdjustment(index)">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="wallStore.increaseOwaspAdjustment(index)">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 防禦點數
              </p>
              <button class="confirm-button" @click="wallStore.applyOwaspUpgrade(index)">確認</button>
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
import { useWallStore } from '@/stores/wall';

const uiStore = useUiStore();
const wallStore = useWallStore();

// `currentView` 是這個元件自己的內部狀態，所以保留
const currentView = ref('upgrade');

// 直接使用 store 的數據，不需要本地 ref

// 所有控制函數都移到 store 了，這裡不需要
</script>

<style scoped>
/* 樣式維持不變 */
.wall-menu {
  position: absolute;
  top: 120px;
  right: 40px;
  width: 920px;
  height: 470px;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 1001;
  pointer-events: auto;
}

.menu-body {
  display: flex;
  height: 100%;
  align-items: stretch;
}

.menu-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 100px;
  max-width: 100px;
  outline: none;
  box-shadow: none;
  height: 100%;
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
  padding: 10px 10px 20px 20px;
  display: flex;
  align-items: stretch;
  justify-content: flex-start; 
  height: 100%;
  overflow: hidden;
}

.walls-container {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: stretch;
}

.wall-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px 18px;
  text-align: center;
  font-weight: bold;
  font-size: 22px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
  min-width: 200px;
  flex-shrink: 0;
  max-height: 100%;
}
.wall-top { 
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10px;
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
  flex: 1;
  justify-content: flex-end;
  padding-bottom: 10px;
}

.controls {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.controls button {
  font-size: 20px;
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
  font-size: 20px;
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
</style>
