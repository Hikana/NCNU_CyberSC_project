import { defineStore } from 'pinia';
// 從我們初始化好的 Firebase 取出 Firestore 實例
import { db } from '@/firebase/firebase';
// 從 Firestore 套件引入需要用到的函式
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

// 防禦工具定義
const DEFENSE_TOOLS = {
  cdn: { name: 'CDN 分流雲網' },
  prepared_statements: { name: 'Prepared Statements（參數化查詢）' },
  output_encoding: { name: 'Output Encoding（輸出編碼）' },
  mfa: { name: 'MFA（多因素驗證）' },
  code_signing: { name: 'Code Signing（軟體簽章驗證）' },
  port_blocking: { name: 'Port Blocking（封鎖未用埠口）' },
};

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // 防禦工具列表；每項包含 id、名稱、數量
    items: [], // 每項: { id, name, qty }
    // 載入指示
    loading: false,
    // 是否已完成初始化（至少載入一次資料）
    isLoaded: false,
    // Firestore 即時監聽的取消函式（用於解除監聽）
    unsubscribe: null,  
  }),
  getters: {
    // 依工具 ID 取得單一物品
    getByTemplate: (state) => (toolId) => state.items.find(i => i.id === toolId),
    totalItems: (state) => state.items.reduce((s, it) => s + (it.qty || 0), 0)
  },
  actions: {
    async init(userId) {
      if (!userId) {
        console.warn('init inventory: 缺少 userId');
        return;
      }
      
      this.loading = true;
      const playerRef = doc(db, 'players', userId);
      
      try {
        // 即時監聽玩家資料變更
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
        
        // onSnapshot：監聽玩家資料的變化
        this.unsubscribe = onSnapshot(playerRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const playerData = docSnapshot.data();
            this.updateItemsFromPlayerData(playerData);
          } else {
            this.items = [];
          }
          
          this.isLoaded = true;
          this.loading = false;
        }, (err) => {
          console.error('防禦工具同步失敗', err);
          this.loading = false;
        });

        // 首次載入：馬上取一次現有資料
        const docSnapshot = await getDoc(playerRef);
        if (docSnapshot.exists()) {
          const playerData = docSnapshot.data();
          this.updateItemsFromPlayerData(playerData);
        } else {
          this.items = [];
        }
        
        this.isLoaded = true;
      } catch (err) {
        console.error('❌ 初始化防禦工具失敗', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 從玩家資料中更新物品列表
    updateItemsFromPlayerData(playerData) {
      this.items = [];
      const defenseTools = playerData.defenseTools || {};
      
      // 遍歷所有防禦工具
      Object.keys(DEFENSE_TOOLS).forEach(toolId => {
        const qty = defenseTools[toolId] || 0;
        if (qty > 0) {
          const toolInfo = DEFENSE_TOOLS[toolId];
          this.items.push({
            id: toolId,
            name: toolInfo.name,
            qty: qty,
            type: 'defense'
          });
        }
      });
      
    },
    
    async refreshInventory() {
      // 重新載入防禦工具資料
      const authStore = useAuthStore();
      if (authStore.user) {
        await this.init(authStore.user.uid);
      }
    },
    
    // 使用防禦工具
    async useItem(toolId) {
      try {
        
        // 檢查是否擁有該工具
        const item = this.getByTemplate(toolId);
        if (!item || item.qty <= 0) {
          throw new Error(`你沒有 ${toolId} 這個防禦工具`);
        }
        
        // 呼叫後端 API
        const { apiService } = await import('@/services/apiService');
        const result = await apiService.useDefenseTool(toolId);
        
        if (result.success) {
          // Firestore 即時監聽會自動更新本地狀態
          return result.data;
        } else {
          throw new Error(result.error || '使用防禦工具失敗');
        }
        
      } catch (error) {
        console.error('❌ 使用防禦工具失敗:', error);
        throw error;
      }
    },
    
    // 清理監聽器
    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  }
});