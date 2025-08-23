import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const x = ref(18)
  const y = ref(5)

  // 移動方法
  function moveUp() { y.value -= 1 }
  function moveDown() { y.value += 1 }
  function moveLeft() { x.value -= 1 }
  function moveRight() { x.value += 1 }

  // 可擴充更多屬性與方法
  return { x, y, moveUp, moveDown, moveLeft, moveRight }
})
