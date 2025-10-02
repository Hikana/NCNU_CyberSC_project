<template>
  <div class="controls-hint">
    <div><strong>控制說明:</strong></div>
    <div>↑↓←→ 移動角色</div>
    <div>Enter 檢視區域</div>
    <div>滑鼠拖動 移動視野</div>
  </div>
</template>

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
  pointer-events: auto; /* 確保自身可以被互動 (雖然目前不需要) */
}
</style>