import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // 主角地圖座標
  const x = ref(0)
  const y = ref(0)

  // 移動方法
  function moveUp() { y.value -= 1 }
  function moveDown() { y.value += 1 }
  function moveLeft() { x.value -= 1 }
  function moveRight() { x.value += 1 }

  // 可擴充更多屬性與方法
  return { x, y, moveUp, moveDown, moveLeft, moveRight }
})
