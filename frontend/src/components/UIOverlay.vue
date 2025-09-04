<template>
  <div class="ui-overlay">
    <!-- <div class="top-ui">
      <div class="resource">
        <div class="resource-icon tech-icon"></div>
        <span>科技點: 100</span>
      </div>
      <div class="resource">
        <div class="resource-icon cia-icon"></div>
        <span>CIA防禦值: 30</span>
      </div>
    </div> -->
    <!-- <div class="bottom-ui">📡 資安助手</div> -->
    <div class="controls">
      ↑↓←→ 移動角色<br />
      Enter 檢視區域<br />
      滑鼠拖動畫面
    </div>
  </div>
</template>

<style scoped>
.ui-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 5; /* 降低 z-index，確保不會覆蓋遊戲畫布 */
}
/* .top-ui {
  position: absolute;
  top: 20px; left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px 30px;
  border-radius: 10px;
  display: flex;
  gap: 30px;
  font-size: 18px;
}
.resource { display: flex; gap: 8px; align-items: center; }
.resource-icon {
  width: 20px; height: 20px;
  border-radius: 50%;
}
.tech-icon { background: #3498db; }
.cia-icon { background: #e74c3c; } */
/* .bottom-ui {
  position: absolute; bottom: 20px; left: 20px;
  background: rgba(0, 0, 0, 0.8); color: white;
  padding: 15px; border-radius: 10px;
  pointer-events: auto; cursor: pointer;
} */
.controls {
  position: absolute; bottom: 20px; right: 20px;
  background: rgba(0, 0, 0, 0.8); color: white;
  padding: 15px; border-radius: 10px;
}
</style>