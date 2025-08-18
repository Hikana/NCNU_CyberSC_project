import * as PIXI from 'pixi.js';
import { GameMap } from './Map.js';
import { Player } from './Player.js';

export class Game {
  constructor(containerElement, playerStore, uiStore, gameStore) {
    this.container = containerElement;
    this.playerStore = playerStore;
    this.uiStore = uiStore;
    this.gameStore = gameStore;
    this.app = null;
    this.world = null;
    this.player = null;
    this.keys = {};
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.TILE_SIZE = 64;
  }

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      backgroundColor: 0x1a252f,
      antialias: true,
      resizeTo: this.container,
    });
    this.container.appendChild(this.app.view);
    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);

    this._createMap();
    this._createPlayer();
    this._setupControls();
    
    this.app.ticker.add((ticker) => this._gameLoop(ticker.deltaTime));
  }

  destroy() {
    window.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('keyup', this._handleKeyup);
    // 移除 PixiJS 事件監聽
    if (this.app && this.app.stage) {
      this.app.stage.off('pointerdown', this._onDragStart);
      this.app.stage.off('pointerup', this._onDragEnd);
      this.app.stage.off('pointerupoutside', this._onDragEnd);
      this.app.stage.off('pointermove', this._onDragMove);
    }
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  }

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
    
    this.player.update();
    this._updateCamera();
  }

  _updateCamera() {
    if (this.isDragging) return;
    if (!this.player || !this.player.sprite) return;
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    const targetX = centerX - this.player.sprite.x;
    const targetY = centerY - this.player.sprite.y;
    this.world.x += (targetX - this.world.x) * 0.1;
    this.world.y += (targetY - this.world.y) * 0.1;
  }

  _setupControls() {
    // --- 鍵盤控制 (不變) ---
    this._handleKeydown = (e) => { this.keys[e.code] = true; };
    this._handleKeyup = (e) => { 
        this.keys[e.code] = false;
        if (e.code === 'Enter') {
            this._inspectCurrentTile();
        }
    };
    window.addEventListener('keydown', this._handleKeydown);
    window.addEventListener('keyup', this._handleKeyup);

    // --- 【修正】滑鼠拖曳控制 ---
    // 1. 讓 stage (整個舞台) 可以被互動
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen; // 設定舞台的可點擊範圍為整個螢幕

    // 2. 定義事件處理函式
    this._onDragStart = (e) => {
        this.isDragging = true;
        // 3. 從 PixiJS 事件物件 e 中取得 global 座標
        this.dragStart.x = e.global.x - this.world.x;
        this.dragStart.y = e.global.y - this.world.y;
    };
    this._onDragEnd = () => {
        this.isDragging = false;
    };
    this._onDragMove = (e) => {
        if (this.isDragging) {
            this.world.x = e.global.x - this.dragStart.x;
            this.world.y = e.global.y - this.dragStart.y;
        }
    };
    // 4. 使用 PixiJS 的 .on() 方法來綁定事件
    this.app.stage.on('pointerdown', this._onDragStart);
    this.app.stage.on('pointerup', this._onDragEnd);
    this.app.stage.on('pointerupoutside', this._onDragEnd);
    this.app.stage.on('pointermove', this._onDragMove);
  }
  
  _createMap() {
    const map = new GameMap();
    map.render(this.world, this._handleTileClick.bind(this));
  }

  _createPlayer() {
    this.player = new Player(this.playerStore);
    this.player.create(this.world);
  }

  _handleTileClick(tileData) {
    if (this.isDragging) return; // 如果正在拖曳，則不觸發點擊
    console.log('格子被點擊了:', tileData);
    if (tileData.distanceFromCenter > 6) {
      this.gameStore.fetchRandomQuestion(1);
    } else {
      alert(`你點擊了受保護的區域`);
    }
  }

  _inspectCurrentTile() {
    const playerPos = this.playerStore.position;
    const isoX = playerPos.x;
    const isoY = playerPos.y;
    const gridY = (isoY / (this.TILE_SIZE / 4) + isoX / (this.TILE_SIZE / 2)) / 2;
    const gridX = gridY + (isoX / (this.TILE_SIZE / 2));
    const mapCenter = 10;
    const finalGridX = Math.round(gridX + mapCenter);
    const finalGridY = Math.round(gridY + mapCenter);
    const distanceFromCenter = Math.max(Math.abs(finalGridX - mapCenter), Math.abs(finalGridY - mapCenter));
    console.log(`按下 Enter，檢視座標 (${finalGridX}, ${finalGridY})`);
    this._handleTileClick({
        x: finalGridX,
        y: finalGridY,
        distanceFromCenter
    });
  }
}