<template>
  <div v-if="showNpcTip" class="dialog-bottom">我是小賽，想知道遊戲規則及各種資源請點我喵~</div>
  <div class="controls-hint">
    <div><strong>控制說明:</strong></div>
    <div>↑↓←→ 移動角色</div>
    <div>Enter / E 檢視區域</div>
    <div>滑鼠拖動 移動視野</div>
  </div>
  
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  trigger: {
    type: Number,
    default: 0
  }
})

const showNpcTip = ref(false)
let hideTimer = null

watch(
  () => props.trigger,
  () => {
    if (!props.trigger) return
    showNpcTip.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      showNpcTip.value = false
    }, 8000)
  }
)
</script>

<style scoped>
.controls-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 12; /* 確保在 UI 圖層之上 */
}

.dialog-bottom {
  position: absolute;
  bottom: 180px;
  left: 40px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 18px;
  line-height: 1.4;
  z-index: 13;
}
.dialog-bottom::after {
  border-color: rgba(0, 0, 0, 0.7) transparent transparent;
  border-style: solid solid solid solid;
  border-radius: 10px;
  border-width: 13px 8px;
 
  bottom: -20px;
 
  content: "";
  height: 0px;

  position: absolute;
  left: 30px;
  width: 0px;
}
</style>