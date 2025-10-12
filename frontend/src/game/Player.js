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
    this.sprite = new PIXI.Graphics();

    // 使用 Vite 解析資源路徑
    const idleUrl = new URL('../assets/NPC_stop.gif', import.meta.url).href;
    const walkUrl = new URL('../assets/NPC_moved.gif', import.meta.url).href;

    // 使用已註冊的 GIF 解析器載入
    const [idleAsset, walkAsset] = await Promise.all([
      PIXI.Assets.load(idleUrl),
      PIXI.Assets.load(walkUrl)
    ]);

    // 某些版本會直接回傳 AnimatedSprite，若回傳的是 Texture/資源，統一處理為 Sprite
    this.idleSprite = idleAsset?.play ? idleAsset : PIXI.Sprite.from(idleUrl);
    this.walkSprite = walkAsset?.play ? walkAsset : PIXI.Sprite.from(walkUrl);

    this.idleSprite.anchor.set(0.5);
    this.walkSprite.anchor.set(0.5);
   
    // 分別設定不同精靈的大小
    const baseScale = this.scale;
    const idleScale = this.scale * 1.5; // idle 精靈放大 1.5 倍
    
    this.idleSprite.scale.set(idleScale, idleScale);
    this.walkSprite.scale.set(baseScale, baseScale);
    
    this._updateSpriteRotation();

    // 若為 AnimatedSprite 則設定並播放
    if (this.idleSprite.play) {
      this.idleSprite.animationSpeed = 1.0;
      this.idleSprite.play();
    }
    if (this.walkSprite.play) {
      this.walkSprite.animationSpeed = 1.2;
      this.walkSprite.play();
    }

    // 預設顯示不動狀態
    this.walkSprite.visible = false;

    this.sprite.addChild(this.idleSprite);
    this.sprite.addChild(this.walkSprite);

    container.addChild(this.sprite);
    // 與舊邏輯相容：讓 sprite 指向根容器，供鏡頭與其他邏輯使用
    this.sprite = this.sprite;
    this.update();
  }

  /**
   * 切換移動/不動動畫
   * @param {boolean} moving
   */
  setMoving(moving) {
    if (this.isMoving === moving) return;
    this.isMoving = moving;
    if (this.idleSprite && this.walkSprite) {
      this.idleSprite.visible = !moving;
      this.walkSprite.visible = moving;
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
    if (this.idleSprite && this.walkSprite) {
      // 分別設定不同精靈的大小和翻轉
      const baseScale = this.scale;
      const idleScale = this.scale * 1.5; // idle 精靈保持放大 1.5 倍
      
      const idleScaleX = this.isFlipped ? -idleScale : idleScale;
      const walkScaleX = this.isFlipped ? -baseScale : baseScale;
      
      this.idleSprite.scale.set(idleScaleX, idleScale);
      this.walkSprite.scale.set(walkScaleX, baseScale);
    }
  }

  /**
   * 在遊戲循環中每一幀被呼叫的更新函式
   */
  update() {
    if (!this.sprite) return;
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

    // 清理精靈資源
    if (this.idleSprite) {
      this.idleSprite.destroy();
      this.idleSprite = null;
    }
    if (this.walkSprite) {
      this.walkSprite.destroy();
      this.walkSprite = null;
    }

    // 清理主容器
    if (this.sprite) {
      this.sprite.destroy({ children: true });
      this.sprite = null;
    }

    // 清理引用
    this.store = null;
    this.container = null;
  }
}