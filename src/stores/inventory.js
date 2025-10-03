import { defineStore } from 'pinia';
// 從我們初始化好的 Firebase 取出 Firestore 實例
import { db } from '@/firebase/firebase';
// 從 Firestore 套件引入需要用到的函式
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';

// 測試階段先寫死一個 userId
const DEFAULT_USER_ID = "test-user";


export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // 背包物品列表；每項包含 id(模板或物品鍵)、名稱、數量、等
    items: [], // 每項: { id(templateId), name, qty, defenseValue, meta }
    // 載入指示
    loading: false,
    // 是否已完成初始化（至少載入一次資料）
    isLoaded: false,
    // Firestore 即時監聽的取消函式（用於解除監聽）
    unsubscribe: null,  
  }),
  getters: {
    // 依模板 ID 或物品 ID 取得單一物品
    getByTemplate: (state) => (templateId) => state.items.find(i => i.templateId === templateId || i.id === templateId),
    totalItems: (state) => state.items.reduce((s, it) => s + (it.qty || 0), 0)
  },
    actions: {
    async init(userId) {
      // 初始化：讀取 players/{userId}/backpack 子集合
      const finalUserId = userId || DEFAULT_USER_ID;

      if (!finalUserId) {
        console.warn('init inventory: 缺少 userId');
        return;
      }
      
      this.loading = true;
      const backpackRef = collection(db, 'players', finalUserId, 'backpack');
      
      try {
        // 即時監聽子集合變更
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
        
        // onSnapshot：監聽子集合的變化
        this.unsubscribe = onSnapshot(backpackRef, (querySnapshot) => {
          this.items = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            this.items.push({
              id: data.itemId || doc.id,  // 使用 itemId 或文件 ID
              ...data
            });
          });
          
          this.isLoaded = true;
          this.loading = false;
          console.log('📦 子集合背包資料已同步:', this.items.length, '個物品');
          console.log('📦 物品列表:', this.items.map(item => item.name));
        }, (err) => {
          console.error('背包子集合同步失敗', err);
          this.loading = false;
        });

        // 首次載入：馬上取一次現有資料
        const querySnapshot = await getDocs(backpackRef);
        this.items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          this.items.push({
            id: data.itemId || doc.id,
            ...data
          });
        });
        
        this.isLoaded = true;
        console.log('✅ 背包初始化完成', this.items.length, '個物品');
      } catch (err) {
        console.error('❌ 初始化背包失敗', err);
      } finally {
        this.loading = false;
      }
    },
    addItem(item) {
      // 新增物品：若已存在同 id，則累加數量；否則新增一筆
      console.log('➕ 嘗試加入物品到背包:', item);
      const existsIndex = this.items.findIndex(it => it.id === item.id);
      if (existsIndex >= 0) {
        const current = this.items[existsIndex];
        const nextQty = (current.qty || 0) + (item.qty || 1);
        this.items.splice(existsIndex, 1, { ...current, qty: nextQty });
        console.log('📈 物品數量已累加:', item.name, '新數量:', nextQty);
      } else {
        this.items.push({ qty: 1, ...item });
        console.log('🆕 新物品已加入:', item.name, '數量:', item.qty || 1);
      }
      console.log('📦 目前背包總物品數:', this.items.length);
    },
    async save(userId) {
      // 儲存目前 items 到 Firestore 子集合
      const finalUserId = userId || DEFAULT_USER_ID;

      if (!finalUserId) {
        console.warn('save inventory: 缺少 userId');
        return;
      }

      try {
        // 清空現有的子集合
        const backpackRef = collection(db, 'players', finalUserId, 'backpack');
        const querySnapshot = await getDocs(backpackRef);
        
        // 刪除所有現有文件
        const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        
        // 新增所有物品到子集合
        const addPromises = this.items.map(item => {
          const { id, ...rest } = item;
          const docRef = doc(backpackRef);
          return setDoc(docRef, {
            itemId: id,
            ...rest
          });
        });
        
        await Promise.all(addPromises);
        console.log('✅ 背包已更新至 Firestore 子集合');
      } catch (err) {
        // 若文件不存在，改用 setDoc
        if (err && err.code === 'not-found') {
          await setDoc(playerRef, { backpack }, { merge: true });
          console.log('✅ 背包已建立並更新至 Firestore');
        } else {
          console.error('❌ 背包更新失敗', err);
        }
      }
    },
    // 可在元件卸載時呼叫釋放監聽
    dispose() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  },
});

