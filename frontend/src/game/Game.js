import * as PIXI from 'pixi.js';
import { Player } from './Player.js';
import { IsoGrid } from './IsoGrid';
import { watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useGameStore } from '../stores/game';
import { useBuildingStore } from '../stores/buildings';
import { useWallStore } from '../stores/wall';

/**
 * 遊戲主引擎類別
 * 職責：管理所有 PixiJS 世界的邏輯，包括場景、遊戲循環、玩家互動等。
 */
export class Game {
  constructor(containerElement, connectionContainerElement = null) {
    this.container = containerElement;
    this.connectionContainer = connectionContainerElement;
    this.playerStore = usePlayerStore();
    this.gameStore = useGameStore();   
    this.buildingStore = useBuildingStore();
    this.wallStore = useWallStore();
 
    // 初始化所有遊戲相關的屬性
    this.app = null;
    this.connectionApp = null; // 獨立的連線應用實例
    this.world = null; // 遊戲世界的主容器，用於攝影機移動
    this.connectionWorld = null; // 連線世界容器
    this.player = null;
    this.grid = null;
    this.keys = {}; // 用於追蹤鍵盤按鍵狀態
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.TILE_SIZE = 150;
    this.gameLoopCallback = null; // 儲存 ticker 回調函數的引用
    this.wasInCastle = false; // 追蹤玩家是否之前在城堡內
    this.lastInteractAt = 0; // 節流用，避免連按重觸發
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
    
    // 載入連線資料
    await this.buildingStore.loadConnections();

    // 創建獨立的連線應用（如果提供了連線容器）
    if (this.connectionContainer) {
      await this._createConnectionApp();
    }

    this._createMap();
    await this._createPlayer();
    this._setupControls();
    this._setupWatchers(); // 啟用響應式監聽
    
    // 建立並儲存 ticker 回調函數的引用，以便後續正確移除
    this.gameLoopCallback = (ticker) => this._gameLoop(ticker.deltaTime);
    this.app.ticker.add(this.gameLoopCallback);
  }

  /**
   * 銷毀遊戲，釋放所有資源
   */
  destroy() {
    // 清理事件監聽器
    window.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('keyup', this._handleKeyup);
    if (this._moveToPositionHandler) {
      window.removeEventListener('moveToPosition', this._moveToPositionHandler);
    }
    
    if (this.app) {
      // 清理 ticker 回調函數 - 重要：防止記憶體洩漏
      if (this.app.ticker && this.gameLoopCallback) {
        this.app.ticker.remove(this.gameLoopCallback);
        this.gameLoopCallback = null;
      }
      
      // 清理 stage 事件監聽器
      if (this.app.stage) {
        this.app.stage.off('pointerdown', this._onDragStart);
        this.app.stage.off('pointerup', this._onDragEnd);
        this.app.stage.off('pointerupoutside', this._onDragEnd);
        this.app.stage.off('pointermove', this._onDragMove);
      }
      
      // 清理玩家相關資源
      if (this.player) {
        this.player.destroy?.();
        this.player = null;
      }
      
      // 清理地圖網格
      if (this.grid) {
        this.grid.destroy?.();
        this.grid = null;
      }
      
      // 清理世界容器
      if (this.world) {
        this.world.destroy({ children: true });
        this.world = null;
      }
      
      // 銷毀 PIXI Application，但保留紋理緩存以便重新進入時快速載入
      this.app.destroy(true, { 
        children: true, 
        texture: false,  // ✅ 改為 false，保留紋理緩存
        baseTexture: false,  // ✅ 改為 false，保留基礎紋理
        context: false  // ✅ 改為 false，保留 WebGL 上下文
      });
      
      this.app = null;
    }
    
    // 清理其他引用
    this.container = null;
    this.keys = {};
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
          // 向上移動時面向左（預設方向）
          if (this.player && this.player.isFlipped) {
            this.player.flipDirection();
          }
        }
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) { 
        const newY = y + speed;
        if (this._canMoveTo(x, newY)) {
          y = newY;
          hasMoved = true;
          // 向下移動時面向左（預設方向）
          if (this.player && this.player.isFlipped) {
            this.player.flipDirection();
          }
        }
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) { 
        const newX = x - speed;
        if (this._canMoveTo(newX, y)) {
          x = newX;
          hasMoved = true;
          // 向左移動時面向左（預設方向）
          if (this.player && this.player.isFlipped) {
            this.player.flipDirection();
          }
        }
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) { 
        const newX = x + speed;
        if (this._canMoveTo(newX, y)) {
          x = newX;
          hasMoved = true;
          // 向右移動時面向右
          if (this.player && !this.player.isFlipped) {
            this.player.flipDirection();
          }
        }
    }
    
    // 如果有移動，就更新玩家位置到 store（通常會觸發畫面重繪或狀態同步）
    if (hasMoved) {
        this.playerStore.updatePosition({ x, y });
        
        // 檢查伺服器碰撞和離開
        if (this.grid) {
          const isInCastle = this.grid.checkCastleCollision(x, y);
          
      // 如果現在在伺服器區內，且之前不在
          if (isInCastle && !this.wasInCastle) {
            this.grid.replaceCastleWithCan1();
          }
      // 如果現在不在伺服器區內，且之前在
          else if (!isInCastle && this.wasInCastle) {
            this.grid.resetCastleImage();
          }
          
          // 更新城堡狀態
          this.wasInCastle = isInCastle;
        }
    }
    
    // 更新玩家所在的格子位置（用於顯示綠色高亮）
    if (this.grid) {
      const halfW = this.TILE_SIZE / 2;
      const halfH = this.TILE_SIZE / 4;
      const { x, y } = this.playerStore.position;
      
      // 將等角座標轉換為網格座標
      const cartX = (x / halfW + y / halfH) / 2;
      const cartY = (y / halfH - x / halfW) / 2;
      
      // 四捨五入取得整數網格座標
      const col = Math.round(cartX);
      const row = Math.round(cartY);
      
      // 檢查座標是否在有效範圍內
      if (row >= 0 && row < this.grid.rows && col >= 0 && col < this.grid.cols) {
        this.grid.setPlayerTile(row, col);
      }
    }

    // 同步連線世界的位置和縮放（確保連線跟隨地圖移動）
    if (this.connectionWorld) {
      this.connectionWorld.position.copyFrom(this.world.position);
      this.connectionWorld.scale.copyFrom(this.world.scale);
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
        const isInteractKey = (e.code === 'Enter' || e.code === 'KeyE');
        if (isInteractKey) {
            // 題目開啟期間忽略互動鍵，避免重複顯示
            if (this.gameStore?.isAnswering === true) return;
            // 節流：避免短時間連按
            const now = Date.now();
            if (now - this.lastInteractAt < 400) return;
            this.lastInteractAt = now;
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
   * 創建獨立的連線應用
   */
  async _createConnectionApp() {
    if (!this.connectionContainer) return;
    
    this.connectionApp = new PIXI.Application();
    await this.connectionApp.init({
      width: this.connectionContainer.clientWidth,
      height: this.connectionContainer.clientHeight,
      backgroundColor: 0x000000,
      backgroundAlpha: 0, // 完全透明
      antialias: true,
      resizeTo: this.connectionContainer,
    });
    this.connectionContainer.appendChild(this.connectionApp.canvas);
    
    this.connectionWorld = new PIXI.Container();
    this.connectionWorld.sortableChildren = true;
    this.connectionApp.stage.addChild(this.connectionWorld);
    
    // 同步主應用的位置和縮放
    this.connectionWorld.position.copyFrom(this.world.position);
    this.connectionWorld.scale.copyFrom(this.world.scale);
  }

  _createMap() {
    this.grid = new IsoGrid(
      this.app, 
      20, 20, 
      this.TILE_SIZE,
      this._handleTileClick.bind(this),
      this.buildingStore.map,
      this.buildingStore,
      this.connectionApp, // 傳遞連線應用
      this.connectionWorld // 傳遞連線世界容器
    );
    this.grid.gridContainer.zIndex = 0;
    this.world.addChild(this.grid.gridContainer);
  }

  _createPlayer() {
    this.player = new Player(this.playerStore);
    this.player.create(this.world);
    if (this.player.sprite) {
        this.player.sprite.zIndex = 1; // 玩家層級低於建築 
    }
    
    // 設置玩家初始位置
    const initialRow = 1;
    const initialCol = 1;
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    
    // 將網格座標轉換為等角座標
    const isoX = (initialCol - initialRow) * halfW;
    const isoY = (initialCol + initialRow) * halfH;
    
    this.playerStore.updatePosition({ x: isoX, y: isoY });
    
    // 設置玩家初始位置的高亮顯示
    if (this.grid) {
      this.grid.setPlayerTile(initialRow, initialCol);
    }
  }

  /*處理地圖格子的點擊事件 (智慧點擊)*/
  _handleTileClick(row, col) {
    if (this.isDragging) return;
    
    const cell = this.buildingStore.map?.[row]?.[col];
    if (!cell) return;
    
    // 伺服器區域不能互動（除非正在放置 WAF）
    if (cell.type === 'castle') {
      const allowWafPlacement = this.buildingStore?.isPlacing && this.buildingStore.isPlacingFirewall?.() && this.buildingStore.getSelectedFirewallKind?.() === 'waf';
      if (!allowWafPlacement) return;
    }

    // 連線模式處理
    if (this.buildingStore.isConnecting) {
      if (cell.status === 'placed' && cell.buildingId) {
        // 點擊到有建築物的格子，完成連線
        this.buildingStore.completeConnection({ x: col, y: row });
      } else {
        // 點擊到沒有建築物的格子，取消連線
        this.buildingStore.cancelConnection();
      }
      return;
    }

    // 只有在放置建築模式時才允許滑鼠點擊
    if (this.buildingStore.isPlacing) {
      // 防火牆放置：依類型檢查目標（放寬為可用 buildingId 判型）
      if (this.buildingStore.isPlacingFirewall?.()) {
        const kind = this.buildingStore.getSelectedFirewallKind?.();
        let valid = false;
        let reason = '';

          // 通用防重複檢查：若該格已架設任何防火牆，拒絕重複架設
          if (cell && String(cell.firewall || '').length > 0) {
            this.buildingStore.showPlacementMessage('此建築已架設防火牆，不能重複架設');
            this.buildingStore.selectTile(null);
            return;
          }

        // 追加規則：伺服器 3x3 若已任一格安裝 WAF，禁止再次架設
        if (kind === 'waf') {
          let castleHasWaf = false;
          try {
            const map = this.buildingStore.map || [];
            for (let r = 0; r < map.length; r++) {
              for (let c = 0; c < (map[r]?.length || 0); c++) {
                const cell2 = map[r][c];
                if (cell2 && cell2.type === 'castle' && String(cell2.firewall || '').toLowerCase() === 'waf') {
                  castleHasWaf = true;
                  break;
                }
              }
              if (castleHasWaf) break;
            }
          } catch (_) {}
          if (castleHasWaf) {
            this.buildingStore.showPlacementMessage('此建築已架設防火牆，不能重複架設');
            this.buildingStore.selectTile(null);
            return;
          }
        }
        if (kind === 'hf') {
          const isHostByTile = (cell.status === 'placed' && cell.type === 'host');
          const isHostById = !!cell.buildingId && (this.buildingStore.getBuildingType?.(cell.buildingId)?.type === 'host');
          valid = isHostByTile || isHostById;
          if (!valid) reason = 'Host Firewall 只能架在主機 (Host) 上';
        } else if (kind === 'nwf') {
          const isRouterByTile = (cell.status === 'placed' && cell.type === 'router');
          const isRouterById = !!cell.buildingId && (this.buildingStore.getBuildingType?.(cell.buildingId)?.type === 'router');
          valid = isRouterByTile || isRouterById;
          if (!valid) reason = 'Network Firewall 只能架在路由器 (Router) 上';
        } else if (kind === 'waf') {
          valid = (cell.type === 'castle');
          if (!valid) reason = 'WAF 只能架在網路伺服器(Internet Server)';
        }
        if (valid) {
          this.buildingStore.selectTile({ x: col, y: row });
        } else {
          this.buildingStore.showPlacementMessage(reason || '無效的目標');
          this.buildingStore.selectTile(null);
        }
      } else if (cell.status === 'developed') {
        this.buildingStore.selectTile({ x: col, y: row });
      } else {
        this.buildingStore.showPlacementMessage('只能選擇已開發的土地！');
        this.buildingStore.selectTile(null);
      }
      return;
    }

    // 檢查是否點擊到建築物（非放置模式且非連線模式）
    if (cell.status === 'placed' && cell.buildingId) {
      // 顯示建築物操作選單
      this.buildingStore.deleteTarget = { x: col, y: row };
      return;
    }

    // 非放置模式時，滑鼠點擊無效
    return;
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

    // 監聽伺服器等級變化，自動重繪地圖
    watch(() => this.wallStore.castleLevel, (newLevel, oldLevel) => {
      if (oldLevel !== undefined && newLevel !== oldLevel && this.grid) {        
        this.grid.drawGrid(); // 重繪地圖以顯示新的伺服器等級
      }
    });

    // 監聽連線變化，自動重繪連線
    watch(() => this.buildingStore.connections, () => {
      if (this.grid) {
        this.grid.drawConnections();
      }
    }, { deep: true });

    // 監聽連線模式變化
    watch(() => this.buildingStore.isConnecting, (isConnecting) => {
      if (this.grid) {
        // 可以在這裡添加連線模式的視覺提示
        console.log('連線模式:', isConnecting ? '開啟' : '關閉');
      }
    });

    // 監聽連線顯示狀態變化
    watch(() => this.buildingStore.showConnections, async (showConnections) => {
      if (this.grid) {
        // 重繪整張地圖，讓防火牆徽章與連線同步顯示/隱藏
        this.grid.drawGrid();
      }
      // 當顯示連線時，如果連線應用還未創建，則創建它
      if (showConnections && this.connectionContainer && !this.connectionApp) {
        await this._createConnectionApp();
        // 重新創建地圖以連接連線應用（或只更新連線部分）
        if (this.grid) {
          this.grid.connectionApp = this.connectionApp;
          this.grid.connectionWorld = this.connectionWorld;
          this.grid.drawGrid(); 
        }
      }
    });

    // 監聽選中連線變化，重新繪製連線（只顯示選中的連線）
    watch(() => this.buildingStore.selectedConnectionId, () => {
      if (this.grid) {
        this.grid.drawConnections();
      }
    });

    // 監聽地圖移動事件
    this._moveToPositionHandler = this._handleMoveToPosition.bind(this);
    window.addEventListener('moveToPosition', this._moveToPositionHandler);
  }

  /**
   * 處理移動到指定位置的事件
   */
  _handleMoveToPosition(event) {
    if (event.detail && this.world) {
      const { x, y } = event.detail;
      // 計算世界位置（需要考慮視窗中心）
      const screenWidth = this.app.screen.width;
      const screenHeight = this.app.screen.height;
      const targetWorldX = x - screenWidth / 2;
      const targetWorldY = y - screenHeight / 2;
      
      // 平滑移動到目標位置
      this.world.position.set(targetWorldX, targetWorldY);
      // 同步連線世界的位置
      if (this.connectionWorld) {
        this.connectionWorld.position.set(targetWorldX, targetWorldY);
      }
      console.log('地圖已移動到位置:', { x, y, targetWorldX, targetWorldY });
    }
  }

  /**
   * 修改控制設定
   */
  _setupControls() {
    this._handleKeydown = (e) => { this.keys[e.code] = true; };
    this._handleKeyup = (e) => { 
      this.keys[e.code] = false;
      if (e.code === 'Enter' || e.code === 'KeyE') {
        // 只有在沒有輸入框或按鈕獲得焦點時才觸發檢視功能
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          activeElement.tagName === 'BUTTON' ||
          activeElement.contentEditable === 'true'
        );
        
        if (!isInputFocused) {
          this._inspectCurrentTile();
        }
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
        // 同步連線世界的位置
        if (this.connectionWorld) {
          this.connectionWorld.position.set(newX, newY);
        }
      }
    };

    this.app.stage.on('pointerdown', this._onDragStart);
    this.app.stage.on('pointerup', this._onDragEnd);
    this.app.stage.on('pointerupoutside', this._onDragEnd);
    this.app.stage.on('pointermove', this._onDragMove);
  }

  /*偵測玩家目前所在的網格座標 (按下 Enter 觸發)*/
  _inspectCurrentTile() {
    // 若題目正在顯示，直接忽略
    if (this.gameStore?.isAnswering === true) return;
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
        if (cell.type === 'castle') {
          this._showCastleInteraction();
          return;
        }
        
        // 處理格子互動（非放置模式）
        this._handleTileInteraction(row, col);
      }
    } else {
      return;
    }
  }

  /**
   * 處理格子互動（鍵盤 Enter 觸發）
   */
  _handleTileInteraction(row, col) {
    // 若題目正在顯示，直接忽略
    if (this.gameStore?.isAnswering === true) return;
    const cell = this.buildingStore.map?.[row]?.[col];
    if (!cell) return;
    
    if (cell.type === 'castle') {
      return;
    }

    switch (cell.status) {
      case 'locked':
        this.gameStore.startUnlockProcess({ x: col, y: row });
        break;
      case 'developed':
        this.buildingStore.tileDevelopedMessage = '這塊地已經開發了，可以從商店購買建築來蓋！';
        setTimeout(() => {
          this.buildingStore.clearTileMessage();
        }, 2500);
        break;
      case 'placed':
        this.buildingStore.promptDelete({ x: col, y: row, item: cell.item });
        break;
      default:
        break;
    }
  }

  _showCastleInteraction() {
    this.buildingStore.showCastleInteraction();
  }
}  


