import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isWallMenuOpen = ref(false);
  const isNpcMenuOpen = ref(false);
  const hintTrigger = ref(0); // 用於觸發 ControlsHint 的 tutorial 提示
  const skipNpcDialog = ref(false); // 是否跳過 NPC 對話框，直接顯示 tutorial
  // 未來還可以增加 isQuestionModalOpen, isSettingsOpen 等等...

  // --- Actions ---
  function toggleWallMenu() {
    isWallMenuOpen.value = !isWallMenuOpen.value;
    // 打開一個選單時，可以選擇性地關閉其他選單
    if (isWallMenuOpen.value) {
      isNpcMenuOpen.value = false;
    }
  }

  function toggleNpcMenu() {
    isNpcMenuOpen.value = !isNpcMenuOpen.value;
    if (isNpcMenuOpen.value) {
      isWallMenuOpen.value = false;
    }
  }
  
  function closeAllMenus() {
    isWallMenuOpen.value = false;
    isNpcMenuOpen.value = false;
  }

  function triggerHint(skipDialog = false) {
    skipNpcDialog.value = skipDialog;
    hintTrigger.value++;
  }

  function resetStore() {
    isWallMenuOpen.value = false;
    isNpcMenuOpen.value = false;
    hintTrigger.value = 0;
    skipNpcDialog.value = false;
  }

  return {
    isWallMenuOpen,
    isNpcMenuOpen,
    hintTrigger,
    skipNpcDialog,
    toggleWallMenu,
    toggleNpcMenu,
    closeAllMenus,
    triggerHint,
    resetStore,
  };
});