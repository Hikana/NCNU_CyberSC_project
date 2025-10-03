import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isWallMenuOpen = ref(false);
  const isNpcMenuOpen = ref(false);
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

  return {
    isWallMenuOpen,
    isNpcMenuOpen,
    toggleWallMenu,
    toggleNpcMenu,
    closeAllMenus,
  };
});