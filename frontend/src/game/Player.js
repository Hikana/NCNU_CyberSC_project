import * as PIXI from 'pixi.js';

const TILE_SIZE = 120; // 與 Game.js 和 IsoGrid 保持一致

export class Player {
  /**
   * @param {object} playerStore - 從 Pinia 傳入的 player store 實例
   */
  constructor(playerStore) {
    this.store = playerStore; // 保存 store 的引用
    this.sprite = null; // 用來存放 PixiJS 的圖形物件
  }

  // 將座標轉換變成一個私有方法
  _toIsometric(x, y) {
    const isoX = (x - y) * (TILE_SIZE / 2);
    const isoY = (x + y) * (TILE_SIZE / 4);
    return { x: isoX, y: isoY };
  }

  /**
   * 建立玩家的視覺圖形
   * @param {PIXI.Container} container - 要將玩家加入的 PixiJS 容器
   */
  create(container) {
    this.sprite = new PIXI.Graphics();
    this.sprite.circle(0, 0, 18).fill({ color: 0xe74c3c }); // 紅色圓形
    
    const playerIcon = new PIXI.Text({ text: '👤', style: { fontSize: 20 }});
    playerIcon.anchor.set(0.5);
    this.sprite.addChild(playerIcon);
    
    container.addChild(this.sprite);
    
    // 根據 store 的初始位置，設定 sprite 的初始位置
    this.update();
  }

  /**
   * 在遊戲循環中每一幀被呼叫的更新函式
   */
  update() {
    if (!this.sprite) return;

    // 從 store (大腦) 讀取當前最新的座標
    const { x, y } = this.store.position;
    
    // 將座標轉換成等角座標
    const isoPosition = this._toIsometric(x / TILE_SIZE, y / TILE_SIZE);
    
    // 更新 sprite (身體) 在畫面上的位置
    this.sprite.x = x;
    this.sprite.y = y;
  }
}