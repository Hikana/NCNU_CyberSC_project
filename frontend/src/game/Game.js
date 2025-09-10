import * as PIXI from 'pixi.js';
import { Player } from './Player.js';
import { IsoGrid } from './IsoGrid';

export class Game {
  constructor(containerElement, playerStore, uiStore, gameStore) {
    this.container = containerElement;
    this.playerStore = playerStore;
    this.uiStore = uiStore;
    this.gameStore = gameStore;
    this.app = null;
    this.world = null;
    this.player = null;
    this.grid = null;
    this.keys = {};
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.TILE_SIZE = 150;
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
    this.container.appendChild(this.app.canvas); 
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
    this._onDragEnd = () => {
        this.isDragging = false;
    };
         this._onDragMove = (e) => {
         if (this.isDragging) {
             let newX = e.global.x - this.dragStart.x;
             let newY = e.global.y - this.dragStart.y;
             
             this.world.x = newX;
             this.world.y = newY;
         }
     };
    this.app.stage.on('pointerdown', this._onDragStart);
    this.app.stage.on('pointerup', this._onDragEnd);
    this.app.stage.on('pointerupoutside', this._onDragEnd);
    this.app.stage.on('pointermove', this._onDragMove);
  }
  


  _createMap() {
    // 使用 IsoGrid 創建地圖
    this.grid = new IsoGrid(
      this.app, 
      20, // rows
      20, // cols
      150, // tileSize
      this._handleTileClick.bind(this), // onTileClick callback
      null // mapData (使用預設)
    );
    
    // 將網格容器添加到世界容器中
    this.world.addChild(this.grid.gridContainer);
    
    // 設定網格的 zIndex
    this.grid.gridContainer.zIndex = 1;
    
    // 將網格置中於畫布
    const halfW = this.TILE_SIZE / 2;
    const halfH = this.TILE_SIZE / 4;
    const gridWidth = (this.grid.cols - 1) * halfW;
    const gridHeight = (this.grid.rows + this.grid.cols - 1) * halfH;
    
    this.grid.gridContainer.x = -gridWidth / 2;
    this.grid.gridContainer.y = -gridHeight / 2;
    
    console.log('✅ 網格創建完成，已置中於畫布');
    console.log('✅ 網格尺寸:', gridWidth, 'x', gridHeight);
    console.log('✅ 網格位置:', this.grid.gridContainer.x, this.grid.gridContainer.y);
  }

  _createPlayer() {
    this.player = new Player(this.playerStore);
    this.player.create(this.world);
  }

  _handleTileClick(row, col) {
    if (this.isDragging) return;
    console.log(`點擊了網格位置: (${row}, ${col})`);
    
    const mapCenter = 10;
    const distanceFromCenter = Math.max(
      Math.abs(row - mapCenter), 
      Math.abs(col - mapCenter)
    );
    
    if (distanceFromCenter > 6) {
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
    console.log(`按下 Enter，檢視座標 (${finalGridX}, ${finalGridY})`);
    
    this._handleTileClick(finalGridX, finalGridY);
  }
}