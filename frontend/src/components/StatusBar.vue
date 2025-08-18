<template>
  <div class="top-bar">

    <div class="wall-bar" @click="uiStore.toggleWallMenu">
      <div class="arrow-label">城牆防禦</div>
      <div class="wall-info">
        <span>{{ buildingsStore.ciaDefense }} 點</span>
      </div>
    </div>

    <div class="tech-bar">
      <div class="arrow-label">科技點</div>
      <div class="tech-info">
        <span>{{ playerStore.techPoints }} 個</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// No longer need props, so we can remove the import for WallMenu
// and defineProps.

// 1. Import the stores you need
import { usePlayerStore } from '@/stores/player';
import { useBuildingsStore } from '@/stores/buildings';
import { useUiStore } from '@/stores/ui';

// 2. Create instances of the stores
const playerStore = usePlayerStore();
const buildingsStore = useBuildingsStore();
const uiStore = useUiStore();
</script>

<style scoped>
/* Your styles remain exactly the same */
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
  background: #3947c2;
  border-radius: 4px;
  padding: 0 10px;
  height: 60px;
  position: relative;
  cursor: pointer;
}

.arrow-label {
  background: #68bce9;
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
  font-weight: bold;
}
</style>