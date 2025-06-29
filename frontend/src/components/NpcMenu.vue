<template>
  <div class="npc-menu" v-if="visible">

    <div class="menu-body">
      <div class="menu-left">
        <button class="active">背包</button>
        <button>小地圖</button>
        <button>建築商店</button>
        <button>資安事件紀錄</button>
        <button>答題紀錄</button>
        <button>成就</button>
      </div>
      <div class="menu-right">
        <div class="grid">
          <div class="cell" v-for="n in 20" :key="n"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ visible: Boolean })
</script>

<style scoped>
.npc-menu {
  position: absolute;
  bottom: 20px;
  left: 170px;
  width: 70%;
  height: 76%;
  background-color: #c5ffc5;
  border-radius: 20px;
  padding: 20px;
  z-index: 10;
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

.menu-right .grid {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 30px;
  padding: 30px;
}

.cell {
  width: 80px;
  height: 80px;
  background-color: rgba(53, 202, 7, 0.749);
  border-radius: 12px;
}
</style>
