<template>
  <div class="wall-menu" v-if="visible">
    <div class="menu-body">
      <div class="menu-left">
        <button :class="{ active: currentView === 'upgrade' }" @click="currentView = 'upgrade'">CIA<br/>城牆升級</button>
        <button :class="{ active: currentView === 'owasp' }" @click="currentView = 'owasp'">OWASP<br/>城牆升級</button>
      </div>

      <div class="menu-right">
        <!-- CIA 升級畫面 -->
        <div v-if="currentView === 'upgrade'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in ciaWalls" :key="wall.name">
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="decreaseCia(index)">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="increaseCia(index)">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 城牆防禦力
              </p>
              <button class="confirm-button" @click="applySingleAdjustmentCia(index)">確認</button>
            </div>
          </div>
        </div>
        
        <!-- OWASP 升級畫面 -->
        <div v-if="currentView === 'owasp'" class="walls-container">
          <div class="wall-item" v-for="(wall, index) in owaspWalls" :key="wall.name">
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="decreaseOwasp(index)">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="increaseOwasp(index)">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 城牆防禦力
              </p>
              <button class="confirm-button" @click="applySingleAdjustmentOwasp(index)">確認</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean,
  techPoints: Number,
  wallDefense: Number
})
const emit = defineEmits(['update-tech', 'update-wall'])

const currentView = ref('upgrade')

// CIA 城牆
const ciaWalls = ref([
  { name: 'C', defense: 80, cost: 10, adjustment: 1, showCostText: false },
  { name: 'I', defense: 60, cost: 8, adjustment: 1, showCostText: false },
  { name: 'A', defense: 90, cost: 12, adjustment: 1, showCostText: false }
])

// OWASP 城牆 1-10
const owaspWalls = ref([
  { name: 'A01', defense: 70, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A02', defense: 65, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A03', defense: 75, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A04', defense: 60, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A05', defense: 80, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A06', defense: 70, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A07', defense: 65, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A08', defense: 75, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A09', defense: 70, cost: 10, adjustment: 1, showCostText: false },
  { name: 'A10', defense: 80, cost: 10, adjustment: 1, showCostText: false }
])

// CIA 城牆控制函數
const increaseCia = (index) => {
  const wall = ciaWalls.value[index]
  const totalCost = wall.cost * (Math.abs(wall.adjustment) + 1)
  if (wall.defense + wall.adjustment < 100 && props.wallDefense >= totalCost) {
    wall.adjustment = Math.max(1, wall.adjustment + 1)
    wall.showCostText = true
  }
}

const decreaseCia = (index) => {
  const wall = ciaWalls.value[index]
  if (wall.adjustment > 1) { // 最小只能到 1
    wall.adjustment -= 1
    wall.showCostText = true
  }
}

const applySingleAdjustmentCia = (index) => {
  const wall = ciaWalls.value[index]
  // 消耗城牆防禦點，emit 給父層
  const totalCost = wall.cost * Math.abs(wall.adjustment)
  if (wall.adjustment >= 1 && props.wallDefense >= totalCost) {
    emit('update-wall', props.wallDefense - totalCost)
    wall.defense += wall.adjustment
    wall.adjustment = 1 // 重設為 1
    wall.showCostText = false
  }
}

// OWASP 城牆控制函數
const increaseOwasp = (index) => {
  const wall = owaspWalls.value[index]
  const totalCost = wall.cost * (Math.abs(wall.adjustment) + 1)
  if (wall.defense + wall.adjustment < 100 && props.wallDefense >= totalCost) {
    wall.adjustment = Math.max(1, wall.adjustment + 1)
    wall.showCostText = true
  }
}

const decreaseOwasp = (index) => {
  const wall = owaspWalls.value[index]
  if (wall.adjustment > 1) { // 最小只能到 1
    wall.adjustment -= 1
    wall.showCostText = true
  }
}

const applySingleAdjustmentOwasp = (index) => {
  const wall = owaspWalls.value[index]
  // 消耗城牆防禦點，emit 給父層
  const totalCost = wall.cost * Math.abs(wall.adjustment)
  if (wall.adjustment >= 1 && props.wallDefense >= totalCost) {
    emit('update-wall', props.wallDefense - totalCost)
    wall.defense += wall.adjustment
    wall.adjustment = 1 // 重設為 1
    wall.showCostText = false
  }
}
</script>

<style scoped>
.wall-menu {
  position: absolute;
  top: 120px;
  right: 40px;
  width: 940px;
  height: 500px;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 1001;
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
  padding: 20px 10px 20px 20px;
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
  padding: 15px 20px;
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
