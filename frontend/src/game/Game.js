import * as PIXI from 'pixi.js';
import { Player } from './Player.js';
import { IsoGrid } from './IsoGrid';
import { watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useGameStore } from '../stores/game';
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
    this.TILE_SIZE = 150;
  }

  /**
   * 初始化遊戲世界
   */
  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      backgroundColor: 0x000000, // 透明背景
      backgroundAlpha: 0, // 完全透明
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
    await this._createPlayer();
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
    // 計算移動速度：5 為基礎速度，delta 為每幀的時間倍率（由 PIXI/Ticker 提供，確保不同 FPS 下移動一致）
    const speed = 5 * delta;

    // 從玩家狀態儲存 (playerStore) 取得目前座標
    let { x, y } = this.playerStore.position;

    // 記錄這一幀玩家是否有移動
    let hasMoved = false;

    // 依據按鍵狀態判斷方向並更新座標
    if (this.keys['ArrowUp'] || this.keys['KeyW']) { 
        const newY = y - speed;
        if (this._canMoveTo(x, newY)) {
          y = newY;
          hasMoved = true;
        }
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) { 
        const newY = y + speed;
        if (this._canMoveTo(x, newY)) {
          y = newY;
          hasMoved = true;
        }
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) { 
        const newX = x - speed;
        if (this._canMoveTo(newX, y)) {
          x = newX;
          hasMoved = true;
        }
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) { 
        const newX = x + speed;
        if (this._canMoveTo(newX, y)) {
          x = newX;
          hasMoved = true;
        }
    }
    
    // 如果有移動，就更新玩家位置到 store（通常會觸發畫面重繪或狀態同步）
    if (hasMoved) {
        this.playerStore.updatePosition({ x, y });
    }

    // 如果玩家角色物件存在，更新角色的動畫/狀態
    if (this.player) {
        this.player.setMoving(hasMoved); // 設定角色是否處於移動狀態 (控制走路動畫)
        this.player.update();            // 執行角色更新邏輯 (例如動畫幀、碰撞檢測)
    }

    // 更新攝影機位置，讓畫面跟著玩家移動
    this._updateCamera();
}





  /**
   * 檢查玩家是否可以移動到指定位置
   * @param {number} x - 目標 X 座標
   * @param {number} y - 目標 Y 座標
   * @returns {boolean} - 是否可以移動
   */
  _canMoveTo(x, y) {
    if (!this.grid) {
      return false;
    }
    
    // 將等角座標轉換為網格座標
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    const cartX = (x / halfW + y / halfH) / 2;
    const cartY = (y / halfH - x / halfW) / 2;
    
    // 四捨五入取得整數網格座標
    const col = Math.round(cartX);
    const row = Math.round(cartY);
    
    // 檢查座標是否在有效範圍內
    if (row < 0 || row >= this.grid.rows || col < 0 || col >= this.grid.cols) {
      return false;
    }
    
    // 允許玩家在所有地面類型上移動：
    // - can.png (城堡區域): 座標 0,0 到 2,2 ✅ 允許移動
    // - grass.png (草地): 其他區域 ✅ 允許移動  
    // - land.png (土地): 其他區域 ✅ 允許移動
    
    return true;
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
    this.grid.gridContainer.zIndex = 0;
    this.world.addChild(this.grid.gridContainer);
  }

  /**
   * 建立玩家
   */
  _createPlayer() {
    this.player = new Player(this.playerStore);
    this.player.create(this.world);
    if (this.player.sprite) {
        this.player.sprite.zIndex = 5; // 確保玩家在網格之上
    }
    
    // 設置玩家初始位置在城堡區域（網格座標 1,1）
    const initialRow = 1;
    const initialCol = 1;
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    
    // 將網格座標轉換為等角座標
    const isoX = (initialCol - initialRow) * halfW;
    const isoY = (initialCol + initialRow) * halfH;
    
    this.playerStore.updatePosition({ x: isoX, y: isoY });
    console.log(`🎮 玩家初始位置設置為網格 (${initialRow}, ${initialCol})，等角座標 (${isoX}, ${isoY})`);
  }

  /*處理地圖格子的點擊事件 (智慧點擊)*/
  _handleTileClick(row, col) {
    if (this.isDragging) return;
    
    const cell = this.buildingStore.map?.[row]?.[col];
    if (!cell) return;
    
    // 城堡區域不能互動
    if (cell.type === 'castle') {
      return;
    }

    // 放置建築模式：只允許在 developed 的土地上
    if (this.buildingStore.isPlacing) {
      if (cell.status === 'developed') {
        this.buildingStore.selectTile({ x: col, y: row });
      } else {
        this.buildingStore.showPlacementMessage('只能選擇已開發的土地！');
        this.buildingStore.selectTile(null);
      }
      return;
    }

    // 一般模式：依狀態執行對應行為
    switch (cell.status) {
      case 'locked':
        this.gameStore.startUnlockProcess({ x: col, y: row });
        break;
      case 'developed':
        alert('這塊地已經開發了，可以從商店購買建築來蓋！');
        break;
      case 'placed':
        // 觸發 UI 提示，不用瀏覽器 confirm
        this.buildingStore.promptDelete({ x: col, y: row, item: cell.item });
        break;
      default:
        break;
    }
  }

  /**
   * 設定監聽器，讓 PixiJS 世界能響應 Pinia store 的變化
   */
  _setupWatchers() {
    // 監聽地圖資料變化，自動更新畫面
    watch(() => this.buildingStore.map, (newMap) => {
      if (this.grid) {
        this.grid.updateMapData(newMap);
      }
    }, { deep: true });

    // 監聽選中瓦片的變化，自動更新高亮
    watch(() => this.buildingStore.selectedTile, (tile) => {
      if (!this.grid) return;
      if (tile) {
        this.grid.setSelectedTile(tile.x, tile.y);
      } else {
        this.grid.clearSelectedTile();
      }
    });
  }

  /**
   * 修改控制設定
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
 * 偵測玩家目前所在的網格座標 (按下 Enter 觸發)
 */
  _inspectCurrentTile() {
    const playerPos = this.playerStore.position;
    const isoX = playerPos.x;
    const isoY = playerPos.y;
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    
    // 將等角座標轉換為網格座標
    const cartX = (isoX / halfW + isoY / halfH) / 2;
    const cartY = (isoY / halfH - isoX / halfW) / 2;
    
    // 四捨五入取得整數網格座標
    const col = Math.round(cartX);
    const row = Math.round(cartY);
    
    // 檢查座標是否在有效範圍內
    if (row >= 0 && row < this.grid.rows && col >= 0 && col < this.grid.cols) {
      const cell = this.buildingStore.map?.[row]?.[col];
      if (cell) {
        // 城堡區域不能答題
        if (cell.type === 'castle') {
          alert('城堡區域無法互動！');
          return;
        }
        
        // 顯示題目或格子資訊
        const cellInfo = `格子位置: (${row}, ${col})\n狀態: ${cell.status}`;
        alert(`當前格子資訊:\n${cellInfo}`);
        
        // 觸發格子點擊事件
        this._handleTileClick(row, col);
      }
    } else {
      alert('玩家不在有效的遊戲區域內');
    }
  }
}

