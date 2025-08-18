import { defineStore } from 'pinia';
import { usePlayerStore } from './player';

// 從 assets 引入圖片資源
import buildingAImg from '@/assets/b1.png';
import buildingBImg from '@/assets/b2.png';
import buildingCImg from '@/assets/b3.png';
import buildingDImg from '@/assets/b4.png';
import buildingEImg from '@/assets/b5.png';
import buildingFImg from '@/assets/b6.png';
import buildingGImg from '@/assets/b7.png';
import buildingHImg from '@/assets/b8.png';
import buildingIImg from '@/assets/b9.png';

export const useBuildingsStore = defineStore('buildings', {
  state: () => ({
    // 遊戲中的防禦建築狀態
    walls: [
      { name: 'C', defense: 80, cost: 10, adjustment: 1 },
      { name: 'I', defense: 60, cost: 8, adjustment: 1 },
      { name: 'A', defense: 90, cost: 12, adjustment: 1 },
    ],
    ciaDefense: 30, // 總防禦值
    castleLevel: 1,

    // 商店中可購買的建築列表
    shopBuildings: [
      { id: 1, name: '建築A', img: buildingAImg, techCost: 50 },
      { id: 2, name: '建築B', img: buildingBImg, techCost: 60 },
      { id: 3, name: '建築C', img: buildingCImg, techCost: 70 },
      { id: 4, name: '建築D', img: buildingDImg, techCost: 80 },
      { id: 5, name: '建築E', img: buildingEImg, techCost: 90 },
      { id: 6, name: '建築F', img: buildingFImg, techCost: 100 },
      { id: 7, name: '建築G', img: buildingGImg, techCost: 110 },
      { id: 8, name: '建築H', img: buildingHImg, techCost: 120 },
      { id: 9, name: '建築I', img: buildingIImg, techCost: 130 },
    ],
  }),

  actions: {
    /**
     * 確認單一城牆的升級
     */
    confirmWallUpgrade(wallIndex) {
      const wall = this.walls[wallIndex];
      if (!wall) return;

      const totalCost = wall.cost * wall.adjustment;
      const playerStore = usePlayerStore();

      if (playerStore.spendTechPoints(totalCost)) {
        wall.defense = Math.min(100, wall.defense + wall.adjustment);
        console.log(`${wall.name}牆 升級成功，目前防禦: ${wall.defense}`);
        wall.adjustment = 1;
      } else {
        alert('科技點不足，升級失敗！');
      }
    },

    /**
     * 購買建築
     */
    buyBuilding(buildingItem) {
        const playerStore = usePlayerStore();
        if (playerStore.spendTechPoints(buildingItem.techCost)) {
            alert(`成功購買 ${buildingItem.name}！`);
            // 未來可以在這裡加入將建築放置到地圖上的邏輯
        } else {
            alert('科技點不足，無法購買！');
        }
    },
    
    /**
     * 升級城堡 (完整版)
     */
    upgradeCastle() {
      const playerStore = usePlayerStore();
      const cost = this.castleLevel * 100;

      if (playerStore.spendTechPoints(cost)) {
        this.castleLevel++;
        alert(`城堡成功升級至等級 ${this.castleLevel}！`);
      } else {
        // spendTechPoints 內部已有提示，這裡可以不用再 alert
      }
    },
    
    /**
     * 強化 CIA 城牆 (完整版)
     */
    reinforceWall() {
      const playerStore = usePlayerStore();
      const cost = 50;
      
      if (playerStore.spendTechPoints(cost)) {
        this.ciaDefense += 10;
        alert(`CIA 城牆強化成功！目前防禦值: ${this.ciaDefense}`);
      }
    },
  },
});