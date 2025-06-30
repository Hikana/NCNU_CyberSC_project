<template>
  <div class="game-container">
    <StatusBar />
    <img :src="npcImage" alt="NPC" class="npc" @click="showNpcMenu = !showNpcMenu"/>
    <NpcMenu :visible="showNpcMenu" />
    <WallMenu :visible="showWallMenu" />
  </div>
</template>

<script setup>
import StatusBar from './StatusBar.vue'
import npcImage from '../assets/npc.png'
import { ref } from 'vue'
import NpcMenu from './NpcMenu.vue'

const showNpcMenu = ref(false)
</script>

<style scoped>
.npc {
  position: absolute;
  bottom: 20px;
  left: 30px;
  width: 120px;
  height: auto;
  cursor: pointer;
}
</style>