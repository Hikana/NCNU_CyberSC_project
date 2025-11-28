import * as PIXI from 'pixi.js';
import '@pixi/gif';

const TILE_SIZE = 150; // 與 Game.js 和 IsoGrid 保持一致

export class Player {
  /**
   * @param {object} playerStore - 從 Pinia 傳入的 player store 實例
   */
  constructor(playerStore) {
    this.store = playerStore;
    this.container = null; // 玩家容器
    this.idleSprite = null; // 不動動畫（或靜態）
    this.walkSprite = null; // 移動動畫
    this.isMoving = false;
    this.scale = 0.1; // 視覺大小微調
    this.isFlipped = false; // 玩家是否面向右（翻轉狀態）
  }

  // 將座標轉換變成一個私有方法（保留以後可能用到）
  _toIsometric(x, y) {
    const isoX = (x - y) * (TILE_SIZE / 2);
    const isoY = (x + y) * (TILE_SIZE / 4);
    return { x: isoX, y: isoY };
  }

  /**
   * 建立玩家的視覺圖形
   * @param {PIXI.Container} container - 要將玩家加入的 PixiJS 容器
   */
  async create(container) {
    this.sprite = new PIXI.Container();

    try {
      // 使用 Vite 的動態導入解析資源路徑
      const idleModule = await import('@/assets/NPC_stop.gif');
      const walkModule = await import('@/assets/NPC_moved.gif');
      
      const idleUrl = idleModule.default;
      const walkUrl = walkModule.default;

      console.log('🎮 載入 GIF 資源:', { idleUrl, walkUrl });

      // 使用 PIXI.Assets.load 來正確載入 GIF
      const [idleTexture, walkTexture] = await Promise.all([
        PIXI.Assets.load(idleUrl),
        PIXI.Assets.load(walkUrl)
      ]);

      console.log('✅ GIF 資源載入成功');

      // 從載入的紋理創建精靈
      this.idleSprite = new PIXI.Sprite(idleTexture);
      this.walkSprite = new PIXI.Sprite(walkTexture);
      
      // 如果是 AnimatedSprite（GIF 格式），設置動畫
      if (this.idleSprite.play) {
        this.idleSprite.animationSpeed = 1.0;
        this.idleSprite.play();
      }
      if (this.walkSprite.play) {
        this.walkSprite.animationSpeed = 1.2;
        this.walkSprite.play();
      }

      // 檢查 sprite 是否成功創建
      if (!this.idleSprite || !this.walkSprite) {
        console.error('❌ NPC sprite 創建失敗');
        return;
      }

      this.idleSprite.anchor.set(0.5);
      this.walkSprite.anchor.set(0.5);
     
      // 分別設定不同精靈的大小
      const baseScale = this.scale;
      const idleScale = this.scale * 1.5; // idle 精靈放大 1.5 倍
      
      this.idleSprite.scale.set(idleScale, idleScale);
      this.walkSprite.scale.set(baseScale, baseScale);
      
      this._updateSpriteRotation();

      // 預設顯示不動狀態
      this.walkSprite.visible = false;

      this.sprite.addChild(this.idleSprite);
      this.sprite.addChild(this.walkSprite);

      // 設置玩家角色不攔截點擊事件，讓點擊可以穿透到下面的格子
      this.sprite.eventMode = 'none';
      if (this.idleSprite) this.idleSprite.eventMode = 'none';
      if (this.walkSprite) this.walkSprite.eventMode = 'none';

      container.addChild(this.sprite);
      
      this.update();

      console.log('✅ Player 創建完成');
    } catch (error) {
      console.error('❌ 載入 NPC GIF 時發生錯誤:', error);
    }
  }

  /**
   * 切換移動/不動動畫
   * @param {boolean} moving
   */
  setMoving(moving) {
    if (this.isMoving === moving) return;
    this.isMoving = moving;
    
    // 確保 sprite 存在
    if (this.idleSprite && this.walkSprite) {
      this.idleSprite.visible = !moving;
      this.walkSprite.visible = moving;
     
    } else {
      console.warn('⚠️ setMoving 被調用但 sprite 不存在');
    }
  }

  /**
   * 翻轉玩家方向
   */
  flipDirection() {
    this.isFlipped = !this.isFlipped;
    this._updateSpriteRotation();
  }

  /**
   * 更新精靈的旋轉狀態
   * @private
   */
  _updateSpriteRotation() {
    // 檢查 sprite 是否存在且有 scale 屬性
    if (!this.idleSprite || !this.walkSprite) {
      return;
    }
    
    // 分別設定不同精靈的大小和翻轉
    const baseScale = this.scale;
    const idleScale = this.scale * 1.5; // idle 精靈保持放大 1.5 倍
    
    const idleScaleX = this.isFlipped ? -idleScale : idleScale;
    const walkScaleX = this.isFlipped ? -baseScale : baseScale;
    
    if (this.idleSprite.scale) {
      this.idleSprite.scale.set(idleScaleX, idleScale);
    }
    if (this.walkSprite.scale) {
      this.walkSprite.scale.set(walkScaleX, baseScale);
    }
  }

  /**
   * 在遊戲循環中每一幀被呼叫的更新函式
   */
  update() {
    if (!this.sprite || !this.store || !this.store.position) return;
    const { x, y } = this.store.position;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /**
   * 銷毀玩家資源，釋放記憶體
   */
  destroy() {
    // 停止動畫
    if (this.idleSprite && this.idleSprite.stop) {
      this.idleSprite.stop();
    }
    if (this.walkSprite && this.walkSprite.stop) {
      this.walkSprite.stop();
    }

    // 清理精靈資源，但保留紋理緩存
    if (this.idleSprite) {
      this.idleSprite.destroy({ texture: false, baseTexture: false });
      this.idleSprite = null;
    }
    if (this.walkSprite) {
      this.walkSprite.destroy({ texture: false, baseTexture: false });
      this.walkSprite = null;
    }

    // 清理主容器，但保留紋理
    if (this.sprite) {
      this.sprite.destroy({ children: true, texture: false, baseTexture: false });
      this.sprite = null;
    }

    // 清理引用
    this.store = null;
    this.container = null;
  }
}