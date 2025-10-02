
<template></template>
<!-- <template>
  <div class="inventory-modal" v-if="visible">
    <div class="panel">
      <h3>背包</h3>
      <div v-if="loading">載入中...</div>
      <ul v-else>
        //直接顯示 Firestore 即時同步到的背包內容
        <li v-for="item in items" :key="item.templateId || item.id" class="inv-item">
          <div class="left">
            <div class="name">{{ item.name || item.key || item.id }}</div>
            <div class="meta">{{ item.desc || item.meta?.type || '' }} - 防禦值: {{ item.defenseValue || 0 }}</div>
          </div>
          <div class="right">
            <div class="qty">x{{ item.qty }}</div>
          </div>
        </li>
      </ul>
      <div class="actions">
        <button @click="$emit('close')">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { usePlayerStore } from '../stores/player';
const props = defineProps({ visible: Boolean });
const emit = defineEmits(['close']);
const inv = useInventoryStore();
const player = usePlayerStore();

const items = computed(() => inv.items);
const loading = computed(() => inv.loading);

// 目前僅顯示背包；使用道具邏輯可之後再加（直接操作 Firestore 或呼叫 store）
</script>

<style scoped>
/* 簡單 CSS，請依照你的專案樣式調整 */
.inventory-modal { position: fixed; left:0; right:0; top:0; bottom:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.5); }
.panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.inv-item { background: #fff;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px #0001;
  justify-content: space-between;
  height: 220px;
  pointer-events: auto;
}
</style> -->
