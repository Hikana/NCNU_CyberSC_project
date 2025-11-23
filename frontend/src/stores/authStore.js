// frontend/src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from '@/firebase/firebase';
import { useHistoryStore } from '../stores/historyStore.js';
import{usePlayerStore}from '../stores/player.js'
import { useBuildingStore } from '../stores/buildings.js';
import { resetAllStores } from './resetStores';

/**
 * AuthStore
 * 職責：管理所有與 Firebase Authentication 相關的狀態和操作。
 */
export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const user = ref(null); // 存放當前登入的使用者物件 (包含 uid)
  const isLoading = ref(true); // 用於判斷 Firebase Auth 是否已初始化完成

  // --- Actions ---

  /**
   * 初始化，監聽 Firebase 的登入狀態變化
   * 這是讓應用程式知道玩家是否已登入的關鍵
   */
  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
        isLoading.value = false;
        console.log('Firebase Auth 狀態已更新, 當前使用者:', firebaseUser?.uid || '未登入');
        resolve();
      });
    });
  }

  /**
   * 處理使用者註冊
   * @param {string} email - 使用者 Email
   * @param {string} password - 使用者密碼
   */
  async function signup(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  }


  /**
   * 處理使用者登入
   * @param {string} email - 使用者 Email
   * @param {string} password - 使用者密碼
   */
  async function login(email, password) {
    try {
      console.log('🔐 開始登入流程...');
      
      // 1. Firebase 登入
      await signInWithEmailAndPassword(auth, email, password);

      // 1.5. 清除所有 Pinia 狀態，確保新帳號資料不受舊資料影響
      resetAllStores();
      
      // 2. 自動載入新帳號的歷史紀錄
      await reloadHistoryData();
      
      console.log('✅ 登入成功，已載入當前帳號紀錄');
    } catch (error) {
      console.error('❌ 登入失敗:', error);
      throw error;
    }
  }

  /**
   * 處理使用者登出
   */
  async function logout() {
    try {
      console.log('🚪 開始登出流程...');
      
      // 0. 清除所有 Pinia 狀態
      resetAllStores();
      
      // 1. 先清空本地紀錄
      await clearOnLogout();
      
      // 2. 再執行 Firebase 登出
      await signOut(auth);
      
      console.log('✅ 登出成功，準備重新整理頁面...');
      
      // 3. 使用更安全的方式重新整理
      safePageReload();
      
    } catch (error) {
      console.error('❌ 登出失敗:', error);
      throw error;
    }
  }

  /**
   * 清空所有本地紀錄
   */
  async function clearOnLogout() {
    try {
      const historyStore = useHistoryStore();
      
      // 確保呼叫 historyStore 的清空方法
      if (historyStore.clearOnLogout) {
        historyStore.clearOnLogout();
      } else {
        // 如果方法不存在，直接重置狀態
        historyStore.$reset();
      }
      
      console.log('🗑️ 已清空所有答題紀錄');
    } catch (error) {
      console.error('清空紀錄時發生錯誤:', error);
    }
  }

  /**
   * 重新載入歷史紀錄
   */
  async function reloadHistoryData() {
    try {
      const historyStore = useHistoryStore();
      const playerStore = usePlayerStore();
      const buildingStore = useBuildingStore();
      
      console.log('🔄 開始重新載入所有使用者資料...');
      console.log('🔑 當前登入使用者:', user.value?.uid);
      
      // 確保 playerStore 使用正確的使用者 ID
      if (user.value) {
        const currentUid = user.value.uid;
        console.log('👤 設定玩家 ID:', currentUid);
        playerStore.setUserId(currentUid);
        
        // 依序載入所有資料
        if (playerStore.loadUserData) {
          await playerStore.loadUserData();
          console.log('✅ 已重新載入玩家資料');
        }
        
        if (buildingStore.loadMap) {
          await buildingStore.loadMap();
          console.log('✅ 已重新載入地圖資料');
        }
        
        if (historyStore.loadUserHistory) {
          await historyStore.loadUserHistory();
          console.log('✅ 已重新載入歷史紀錄');
        }
              
      } else {
        console.warn('⚠️ 沒有登入使用者，跳過資料載入');
      }
      
    } catch (error) {
      console.error('❌ 重新載入使用者資料失敗:', error);
    }
  }

  /**
   * 安全重新整理頁面，避免 DOM 操作錯誤
   */
  function safePageReload() {
    // 等待下一個事件循環，確保 Vue 完成當前操作
    setTimeout(() => {
      try {
        // 使用 location.href 而不是 location.reload() 避免 DOM 錯誤
        window.location.href = window.location.origin + window.location.pathname;
      } catch (error) {
        console.error('安全重新整理失敗:', error);
        // 最終備用方案
        window.location.reload();
      }
    }, 100);
  }

  return { 
    user, 
    isLoading, 
    init, 
    signup, 
    login, 
    logout,
    clearOnLogout,
    reloadHistoryData
  };
});