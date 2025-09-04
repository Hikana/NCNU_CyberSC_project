import { defineStore } from 'pinia';
import { usePlayerStore } from './player';

export const useWallStore = defineStore('wall', {
  state: () => ({
    // CIA 城牆
    ciaWalls: [
      { name: 'C', defense: 80, cost: 10, adjustment: 1, showCostText: false },
      { name: 'I', defense: 60, cost: 8, adjustment: 1, showCostText: false },
      { name: 'A', defense: 90, cost: 12, adjustment: 1, showCostText: false }
    ],
    
    // OWASP 城牆 1-10
    owaspWalls: [
      { name: 'A01', defense: 70, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A02', defense: 65, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A03', defense: 75, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A04', defense: 60, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A05', defense: 80, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A06', defense: 70, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A07', defense: 65, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A08', defense: 75, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A09', defense: 70, cost: 10, adjustment: 1, showCostText: false },
      { name: 'A10', defense: 80, cost: 10, adjustment: 1, showCostText: false }
    ],
    
    // 總防禦點數
    totalDefensePoints: 30,
    
    // 城堡等級
    castleLevel: 1
  }),

  getters: {
    // 計算總防禦力
    totalDefense: (state) => {
      const ciaTotal = state.ciaWalls.reduce((sum, wall) => sum + wall.defense, 0);
      const owaspTotal = state.owaspWalls.reduce((sum, wall) => sum + wall.defense, 0);
      return ciaTotal + owaspTotal;
    }
  },

  actions: {
    // CIA 城牆控制函數
    increaseCiaAdjustment(index) {
      const wall = this.ciaWalls[index];
      const totalCost = wall.cost * (Math.abs(wall.adjustment) + 1);
      
      if (wall.defense + wall.adjustment < 100 && this.totalDefensePoints >= totalCost) {
        wall.adjustment = Math.max(1, wall.adjustment + 1);
        wall.showCostText = true;
      }
    },

    decreaseCiaAdjustment(index) {
      const wall = this.ciaWalls[index];
      if (wall.adjustment > 1) {
        wall.adjustment -= 1;
        wall.showCostText = true;
      }
    },

    applyCiaUpgrade(index) {
      const wall = this.ciaWalls[index];
      const totalCost = wall.cost * Math.abs(wall.adjustment);
      
      if (wall.adjustment >= 1 && this.totalDefensePoints >= totalCost) {
        this.totalDefensePoints -= totalCost;
        wall.defense += wall.adjustment;
        wall.adjustment = 1;
        wall.showCostText = false;
        console.log(`${wall.name}牆升級成功，目前防禦: ${wall.defense}%`);
      }
    },

    // OWASP 城牆控制函數
    increaseOwaspAdjustment(index) {
      const wall = this.owaspWalls[index];
      const totalCost = wall.cost * (Math.abs(wall.adjustment) + 1);
      
      if (wall.defense + wall.adjustment < 100 && this.totalDefensePoints >= totalCost) {
        wall.adjustment = Math.max(1, wall.adjustment + 1);
        wall.showCostText = true;
      }
    },

    decreaseOwaspAdjustment(index) {
      const wall = this.owaspWalls[index];
      if (wall.adjustment > 1) {
        wall.adjustment -= 1;
        wall.showCostText = true;
      }
    },

    applyOwaspUpgrade(index) {
      const wall = this.owaspWalls[index];
      const totalCost = wall.cost * Math.abs(wall.adjustment);
      
      if (wall.adjustment >= 1 && this.totalDefensePoints >= totalCost) {
        this.totalDefensePoints -= totalCost;
        wall.defense += wall.adjustment;
        wall.adjustment = 1;
        wall.showCostText = false;
        console.log(`${wall.name}牆升級成功，目前防禦: ${wall.defense}%`);
      }
    },

    // 城堡升級
    upgradeCastle() {
      const playerStore = usePlayerStore();
      const cost = this.castleLevel * 100;
      
      if (playerStore.spendTechPoints(cost)) {
        this.castleLevel++;
        this.totalDefensePoints += 20; // 升級城堡獲得防禦點數
        console.log(`城堡升級成功！目前等級: ${this.castleLevel}`);
      }
    },

    // 強化防禦
    reinforceDefense() {
      const playerStore = usePlayerStore();
      const cost = 50;
      
      if (playerStore.spendTechPoints(cost)) {
        this.totalDefensePoints += 10;
        console.log(`防禦強化成功！目前防禦點數: ${this.totalDefensePoints}`);
      }
    },

    // 更新防禦點數
    updateDefensePoints(newValue) {
      this.totalDefensePoints = newValue;
    }
  }
});
