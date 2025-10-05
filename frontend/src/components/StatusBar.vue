<template>
  <div class="top-bar status-bar">

    <div class="wall-bar"  @click="uiStore.toggleWallMenu()">
      <div class="arrow-label">城牆防禦 🛡️</div>
      <div class="wall-info">
        <span :style="{ color: wallStore.totalDefensePoints < 50 ? 'red' : '#ffffff' }">
          {{ wallStore.defenseProgressText }}
        </span>
      </div>
    </div>

    <div class="tech-bar">
      <div class="arrow-label">科技點 💰</div>
      <div class="tech-info">
        <span>{{ playerStore.techPoints }} </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player';
import { useWallStore } from '@/stores/wall';
import { useUiStore } from '@/stores/ui';
import { useBuildingStore } from '@/stores/buildings';

const playerStore = usePlayerStore();
const wallStore = useWallStore();
const uiStore = useUiStore();
const buildingStore = useBuildingStore();

// 清除所有建築
async function clearAllBuildings() {
  if (confirm('確定要清除地圖上的所有建築嗎？')) {
    const success = await buildingStore.clearAllBuildings();
    if (success) {
      alert('已清除所有建築！');
    } else {
      alert('清除建築時發生錯誤，但本地狀態已清除');
    }
  }
}
</script>

<style scoped>
.top-bar {
  display: flex;
  gap: 20px;
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 1000;
}

.wall-bar,
.tech-bar {
  display: flex;
  align-items: center;
  background: #68bce9;
  border-radius: 4px;
  padding: 0 10px;
  height: 60px;
  position: relative;
  cursor: pointer;
}

.arrow-label {
  background: #3947c2;
  color: #ffffff;
  padding: 8px 12px 8px 10px;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
  text-align: left;
  line-height: 1.1;
}

.tech-info span,
.wall-info span {
  color: #ffffff;
  margin: 0 4px;
  font-size: 16px;
  font-weight: bolder; 
}
</style>