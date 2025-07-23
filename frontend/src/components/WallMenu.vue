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
            <div class="wall-top">
              <h3>{{ wall.name }}牆</h3>
              <p class="wall-defense">當前防禦力 {{ wall.defense }}%</p>
              <div class="controls">
                <button @click="decrease(index)">−</button>
                <span class="adjust-value">{{ wall.adjustment }}</span>
                <button @click="increase(index)">＋</button>
              </div>
            </div>
            <div class="wall-bottom">
              <p class="wall-cost">
                消耗 {{ wall.cost * wall.adjustment }} 城牆防禦力
              </p>
              <button class="confirm-button" @click="applySingleAdjustment(index)">確認</button>
            </div>
          </div>
        </div>

        <!-- 建築商店畫面 -->
        <div v-else-if="currentView === 'shop'" class="shop-container">
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
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import buildingAImg from '../assets/b1.png'
import buildingBImg from '../assets/b2.png'
import buildingCImg from '../assets/b3.png'
import buildingDImg from '../assets/b4.png'
import buildingEImg from '../assets/b5.png'
import buildingFImg from '../assets/b6.png'
import buildingGImg from '../assets/b7.png'
import buildingHImg from '../assets/b8.png'
import buildingIImg from '../assets/b9.png'

const props = defineProps({
  visible: Boolean,
  techPoints: Number,
  wallDefense: Number
})
const emit = defineEmits(['update-tech', 'update-wall'])

const currentView = ref('upgrade')

const walls = ref([
  { name: 'C', defense: 80, cost: 10, adjustment: 1, showCostText: false },
  { name: 'I', defense: 60, cost: 8, adjustment: 1, showCostText: false },
  { name: 'A', defense: 90, cost: 12, adjustment: 1, showCostText: false }
])

const buildings = ref([
  { id: 1, name: '建築A', img: buildingAImg, techCost: 50 },
  { id: 2, name: '建築B', img: buildingBImg, techCost: 60 },
  { id: 3, name: '建築C', img: buildingCImg, techCost: 70 },
  { id: 4, name: '建築D', img: buildingDImg, techCost: 80 },
  { id: 5, name: '建築E', img: buildingEImg, techCost: 90 },
  { id: 6, name: '建築F', img: buildingFImg, techCost: 100 },
  { id: 7, name: '建築G', img: buildingGImg, techCost: 110 },
  { id: 8, name: '建築H', img: buildingHImg, techCost: 120 },
  { id: 9, name: '建築I', img: buildingIImg, techCost: 130 },
])


const increase = (index) => {
  const wall = walls.value[index]
  const totalCost = wall.cost * (Math.abs(wall.adjustment) + 1)
  if (wall.defense + wall.adjustment < 100 && props.wallDefense >= totalCost) {
    wall.adjustment = Math.max(1, wall.adjustment + 1)
    wall.showCostText = true
  }
}

const decrease = (index) => {
  const wall = walls.value[index]
  if (wall.adjustment > 1) { // 最小只能到 1
    wall.adjustment -= 1
    wall.showCostText = true
  }
}

const applySingleAdjustment = (index) => {
  const wall = walls.value[index]
  // 消耗城牆防禦點，emit 給父層
  const totalCost = wall.cost * Math.abs(wall.adjustment)
  if (wall.adjustment >= 1 && props.wallDefense >= totalCost) {
    emit('update-wall', props.wallDefense - totalCost)
    wall.defense += wall.adjustment
    wall.adjustment = 1 // 重設為 1
    wall.showCostText = false
  }
}

function buy(item) {
  // 這裡可以加購買邏輯，例如 emit('update-tech', ...) 或 alert
  alert('購買 ' + item.name)
}
</script>

<style scoped>
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
