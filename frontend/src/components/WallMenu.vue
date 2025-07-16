<template>
  <div class="wall-menu" v-if="visible">
    <div class="menu-body">
      <div class="menu-left">
        <button :class="{ active: currentView === 'upgrade' }" @click="currentView = 'upgrade'">城牆升級</button>
        <button :class="{ active: currentView === 'shop' }" @click="currentView = 'shop'">建築商店</button>
      </div>

      <div class="menu-right">
        <!-- 升級畫面 -->
        <div v-if="currentView === 'upgrade'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in walls" :key="wall.name">
            <h3>{{ wall.name }}牆</h3>
            <p>當前防禦力 {{ wall.defense }}%</p>

            <div class="controls">
              <button @click="decrease(index)">−</button>
              <span class="adjust-value">{{ wall.adjustment }}</span>
              <button @click="increase(index)">＋</button>
            </div>
            
            <!-- NEW cost line -->
            <p v-if="wall.showCostText && wall.adjustment !== 0">  
              消耗 {{ wall.cost * Math.abs(wall.adjustment) }} 城牆防禦力 
            </p>

            <button class="confirm-button" @click="applySingleAdjustment(index)">確認</button>
          </div>
        </div>

        <!-- 建築商店畫面 -->
        <div v-else-if="currentView === 'shop'" class="shop-container">
          <div class="shop-item" v-for="n in 9" :key="n">
            建築 {{ n }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
defineProps({ visible: Boolean })

const currentView = ref('upgrade')

const walls = ref([
  { name: 'C', defense: 80, cost: 10, adjustment: 0, showCostText: false },
  { name: 'I', defense: 60, cost: 8, adjustment: 0, showCostText: false },
  { name: 'A', defense: 90, cost: 12, adjustment: 0, showCostText: false }
])

const increase = (index) => {
  const wall = walls.value[index]
  if (wall.defense + wall.adjustment < 100) {
    wall.adjustment += 1
    wall.showCostText = true
  }
}

const decrease = (index) => {
  const wall = walls.value[index]
  if (wall.adjustment > -wall.defense) {
    wall.adjustment -= 1
    wall.showCostText = true
  }
}

const applySingleAdjustment = (index) => {
  const wall = walls.value[index]
  wall.defense += wall.adjustment
  wall.adjustment = 0
  wall.showCostText = false
}
</script>

<style scoped>
.wall-menu {
  position: absolute;
  top: 70px;
  right: 0;
  width: 1200px;
  height: 600px;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 1001;
}

.menu-body {
  display: flex;
  height: 100%;
}

.menu-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  gap: 40px;
  width: 100%;
  justify-content: center;
}

.wall-item {
  background-color: rgba(53, 202, 7, 0.75);
  border-radius: 12px;
  padding: 20px 30px;
  width: 250px;
  text-align: center;
  font-weight: bold;
  font-size: 30px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.controls {
  margin-top: 10px;
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
  background-color: #3947c2;
  color: white;
  cursor: pointer;
}

.controls button:hover {
  background-color: #2b3699;
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
  background-color: #22aa44;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #198038;
}

/* shopstuff */
.shop-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  padding: 20px;
  justify-items: center;
}

.shop-item {
  width: 200px;
  height: 150px;
  background-color: #ffe4a8;
  border: 2px solid #c18b00;
  border-radius: 12px;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
