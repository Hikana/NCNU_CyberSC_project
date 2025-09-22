import * as PIXI from 'pixi.js';
import { Player } from './Player.js';
import { IsoGrid } from './IsoGrid';
import { watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useGameStore } from '../stores/game';
// ✅ 修正點：將 useBuildingStore 改為 useBuildingsStore (加上 's')
import { useBuildingStore } from '../stores/buildings';

/**
 * 遊戲主引擎類別
 * 職責：管理所有 PixiJS 世界的邏輯，包括場景、遊戲循環、玩家互動等。
 */
export class Game {
  constructor(containerElement) {
    this.container = containerElement;
    // 在 constructor 中直接獲取所有需要的 Pinia stores
    this.playerStore = usePlayerStore();
    this.gameStore = useGameStore();
    // ✅ 修正點：使用正確的複數名稱
    this.buildingStore = useBuildingStore();
    
    // 初始化所有遊戲相關的屬性
    this.app = null;
    this.world = null; // 遊戲世界的主容器，用於攝影機移動
    this.player = null;
    this.grid = null;
    this.keys = {}; // 用於追蹤鍵盤按鍵狀態
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.TILE_SIZE = 120;
  }

  /**
   * 初始化遊戲世界
   */
  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      backgroundColor: 0x1a252f, // 深色背景
      antialias: true,
      resizeTo: this.container,
    });
    this.container.appendChild(this.app.canvas); 
    this.world = new PIXI.Container();
    this.world.sortableChildren = true; // 啟用 Z-Index 排序
    this.app.stage.addChild(this.world);

    // 關鍵步驟：在建立地圖前，先從後端載入玩家的最新地圖資料
    await this.buildingStore.loadMap();

    this._createMap();
    this._createPlayer();
    this._setupControls();
    this._setupWatchers(); // 啟用響應式監聽
    
    this.app.ticker.add((ticker) => this._gameLoop(ticker.deltaTime));
  }

  /**
   * 銷毀遊戲，釋放所有資源
   */
  destroy() {
    window.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('keyup', this._handleKeyup);
    if (this.app) {
      if (this.app.stage) {
        this.app.stage.off('pointerdown', this._onDragStart);
        this.app.stage.off('pointerup', this._onDragEnd);
        this.app.stage.off('pointerupoutside', this._onDragEnd);
        this.app.stage.off('pointermove', this._onDragMove);
      }
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  }

  /**
   * 遊戲主循環，每一幀都會執行
   */
  _gameLoop(delta) { 
    const speed = 5 * delta;
    let { x, y } = this.playerStore.position;
    let hasMoved = false;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) { y -= speed; hasMoved = true; }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) { y += speed; hasMoved = true; }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) { x -= speed; hasMoved = true; }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) { x += speed; hasMoved = true; }
    
    if (hasMoved) {
      this.playerStore.updatePosition({ x, y });
    }
    
    if (this.player) this.player.update();
    this._updateCamera();
  }

  /**
   * 更新攝影機位置以跟隨玩家
   */
  _updateCamera() {
    if (this.isDragging) return; // 拖曳時鏡頭不跟隨
    if (!this.player || !this.player.sprite) return;
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    const targetX = centerX - this.player.sprite.x;
    const targetY = centerY - this.player.sprite.y;
    this.world.x += (targetX - this.world.x) * 0.1; // 緩動效果
    this.world.y += (targetY - this.world.y) * 0.1;
  }

  /**
   * 設定所有控制項 (鍵盤、滑鼠)
   */
  _setupControls() {
    this._handleKeydown = (e) => { this.keys[e.code] = true; };
    this._handleKeyup = (e) => { 
        this.keys[e.code] = false;
        if (e.code === 'Enter') {
            this._inspectCurrentTile();
        }
    };
    window.addEventListener('keydown', this._handleKeydown);
    window.addEventListener('keyup', this._handleKeyup);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this._onDragStart = (e) => {
        this.isDragging = true;
        this.dragStart.x = e.global.x - this.world.x;
        this.dragStart.y = e.global.y - this.world.y;
    };
    this._onDragEnd = () => { this.isDragging = false; };
    this._onDragMove = (e) => {
        if (this.isDragging) {
             const newX = e.global.x - this.dragStart.x;
             const newY = e.global.y - this.dragStart.y;
             this.world.position.set(newX, newY);
        }
    };
    this.app.stage.on('pointerdown', this._onDragStart);
    this.app.stage.on('pointerup', this._onDragEnd);
    this.app.stage.on('pointerupoutside', this._onDragEnd);
    this.app.stage.on('pointermove', this._onDragMove);
  }

  /**
   * 建立地圖
   */
  _createMap() {
    this.grid = new IsoGrid(
      this.app, 20, 20, this.TILE_SIZE,
      this._handleTileClick.bind(this),
      this.buildingStore.map
    );
    this.grid.gridContainer.zIndex = 1;
    this.world.addChild(this.grid.gridContainer);
  }

  /**
   * 建立玩家
   */
  _createPlayer() {
    this.player = new Player(this.playerStore);
    this.player.create(this.world);
    if (this.player.sprite) {
        this.player.sprite.zIndex = 2; // 確保玩家在網格之上
    }
  }

  /**
   * 處理地圖格子的點擊事件 (智慧點擊)
   */
  _handleTileClick(row, col) {
    if (this.isDragging) return;
    const cell = this.buildingStore.map[row]?.[col];
    if (!cell) return;

    // 如果正在放置建築，只允許在 developed 的土地上進行操作
    if (this.buildingStore.isPlacing) {
        if (cell.status === 'developed') {
            this.buildingStore.selectTile({ x: col, y: row });
        } else {
            alert("只能在已開發的綠色土地上選取位置！");
            this.buildingStore.selectTile(null); // 清除選中的點
        }
        return; // 結束點擊處理
    }

    // 如果不是在放置建築模式，才執行正常的遊戲邏輯
    switch (cell.status) {
      case 'locked':
        this.gameStore.startUnlockProcess({ x: col, y: row });
        break;
      
      case 'developed':
        alert('這塊地已經開發了，可以從商店購買建築來蓋！');
        break;

      case 'placed':
        alert(`這裡已經蓋了建築物 (ID: ${cell.item})`);
        break;
    }
  }

  /**
   * 設定監聽器，讓 PixiJS 世界能響應 Pinia store 的變化
   */
  _setupWatchers() {
    // 監聽地圖資料變化，自動更新畫面
    watch(() => this.buildingStore.map, (newMap) => {
      if(this.grid) { this.grid.updateMapData(newMap); }
    }, { deep: true });

    // 監聽選中瓦片的變化，自動更新高亮
    watch(() => this.buildingStore.selectedTile, (tile) => {
      if(this.grid) {
        if (tile) { this.grid.setSelectedTile(tile.x, tile.y); } 
        else { this.grid.clearSelectedTile(); }
      }
    });
  }

  /**
   * 偵測玩家目前所在的網格座標 (按下 Enter 觸發)
   */
  _inspectCurrentTile() {
    const playerPos = this.playerStore.position;
    const isoX = playerPos.x;
    const isoY = playerPos.y;
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    
    const cartX = (isoX / halfW + isoY / halfH) / 2;
    const cartY = (isoY / halfH - isoX / halfW) / 2;

    console.log(`按下 Enter，檢視玩家目前約略在網格座標 (${Math.round(cartY)}, ${Math.round(cartX)})`);
  }
}

