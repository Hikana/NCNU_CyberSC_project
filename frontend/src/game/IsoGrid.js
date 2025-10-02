import * as PIXI from 'pixi.js'
import grassImg from '@/assets/grass.png'
import landImg from '@/assets/land.png'
import { useBuildingStore } from '@/stores/buildings'
import castleImg from '@/assets/can1.png'

const CASTLE_TILES = new Set([
  '0,0','0,1','0,2',
  '1,0','1,1','1,2',
  '2,0','2,1','2,2',
])
function isCastleTile(row, col) {
  return CASTLE_TILES.has(`${row},${col}`)
}

// 計算城堡區域邊界與中心（供 3x3 單張圖定位）
const CASTLE_BOUNDS = (() => {
  const rows = []
  const cols = []
  CASTLE_TILES.forEach(key => {
    const [r, c] = key.split(',').map(Number)
    rows.push(r); cols.push(c)
  })
  const minRow = Math.min(...rows), maxRow = Math.max(...rows)
  const minCol = Math.min(...cols), maxCol = Math.max(...cols)
  return {
    minRow, maxRow, minCol, maxCol,
    centerRow: Math.round((minRow + maxRow) / 2),
    centerCol: Math.round((minCol + maxCol) / 2)
  }
})()

export class IsoGrid {
  constructor(app, rows, cols, tileSize = 150, onTileClick, mapData = null) {
    console.log('IsoGrid 構造器:', { rows, cols, tileSize, onTileClick: !!onTileClick })
    
    this.app = app
    this.rows = rows
    this.cols = cols
    this.tileSize = tileSize
    this.onTileClick = onTileClick
    this.mapData = mapData || this.createDefaultMap()
    this.selectedTile = null
    this.gridContainer = new PIXI.Container()
    // 允許依據 zIndex 排序，確保地圖元素可正確分層
    this.gridContainer.sortableChildren = true
    // 分層：地面(草地) 與 物件(建築/互動)
    this.groundContainer = new PIXI.Container()
    this.objectContainer = new PIXI.Container()
    this.groundContainer.sortableChildren = true
    this.objectContainer.sortableChildren = true
    this.groundContainer.zIndex = 0
    this.objectContainer.zIndex = 1
    // 物件層不攔截滑鼠事件，確保可點擊到地面格
    this.objectContainer.eventMode = 'none'
    
    // 確保容器可以接收交互事件
    this.gridContainer.interactive = true
    this.gridContainer.eventMode = 'static'
    
    this.app.stage.addChild(this.gridContainer)
    this.gridContainer.addChild(this.groundContainer)
    this.gridContainer.addChild(this.objectContainer)
    
    this.loadBuildingTextures()
    this.loadGrassTextures() 
    this.loadLandTexture()
    this.loadCastleTexture()
  }
  
  // 從 Graphics 對象創建紋理 (PixiJS v8 兼容)
  createTextureFromGraphics(graphics) {
    const renderTexture = PIXI.RenderTexture.create({
      width: this.tileSize,
      height: this.tileSize
    })
    
    // 使用應用程序的渲染器來渲染圖形到紋理
    this.app.renderer.render(graphics, { renderTexture })
    
    return new PIXI.Texture(renderTexture)
  }

  // 預載入建築圖片
  loadBuildingTextures() {
    this.buildingTextures = {}
    
    // 使用 Vite 的動態導入來載入圖片
    const importBuildingImage = async (id) => {
      try {
        // 使用 Vite 的動態導入，獲取正確的資源 URL
        const module = await import(`../assets/B${id}.png`)
        const imageUrl = module.default
        
        // 創建 Image 對象來預載入
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          // 圖片載入完成後創建 PIXI 紋理
          const texture = PIXI.Texture.from(img)
          this.buildingTextures[id] = texture
        }
        img.src = imageUrl
        
      } catch (error) {
        console.warn(`⚠️ 建築圖片 ${id} 導入失敗:`, error)
        // 如果導入失敗，創建一個彩色矩形作為替代
        const graphics = new PIXI.Graphics()
        graphics.rect(0, 0, this.tileSize, this.tileSize)
          .fill({ color: 0x00ff00 + (id * 0x111111) })
        this.buildingTextures[id] = this.createTextureFromGraphics(graphics)
      }
    }
    
    // 動態載入建築圖片，根據商店中定義的建築 ID
    const buildingStore = useBuildingStore()
    const buildingIds = buildingStore.shopBuildings.map(building => building.id)
    
    buildingIds.forEach(id => {
      importBuildingImage(id)
    })
  }

  // 預載入草地圖片
  async loadGrassTextures() {
    this.grassTextures = {}
    try {
      const texture = await PIXI.Assets.load(grassImg)
      this.grassTextures.grass = texture
      // 紋理就緒後重繪，讓草地立即顯示
      if (this.mapData) {
        this.drawGrid()
      }
    } catch (e) {
      console.warn('⚠️ 草地圖片載入失敗，使用後備方案:', e)
      // 後備：若載入失敗，仍以 Texture.from 建立
      this.grassTextures.grass = PIXI.Texture.from(grassImg)
      if (this.mapData) {
        this.drawGrid()
      }
    }
  }

  async loadLandTexture() {
    this.landTexture = null
    try {
      this.landTexture = await PIXI.Assets.load(landImg)
    } catch (e) {
      console.warn('⚠️ 地圖圖片載入失敗，使用後備方案:', e)
      this.landTexture = PIXI.Texture.from(landImg)
    }
    // 載入完成後重繪
    if (this.mapData) {
      this.drawGrid()
    }
  }
  
  // 預載入城堡圖片
  async loadCastleTexture() {
    this.castleTexture = null
    try {
      this.castleTexture = await PIXI.Assets.load(castleImg)
    } catch (e) {
      console.warn('⚠️ 城堡圖片載入失敗，使用後備方案:', e)
      this.castleTexture = PIXI.Texture.from(castleImg)
    }
    // 載入完成後重繪
    if (this.mapData) {
      this.drawGrid()
    }
  }

  createDefaultMap() {
    console.log('創建默認地圖:', this.rows, 'x', this.cols)
    const map = []
    const center = Math.floor(this.rows / 2)

    for (let row = 0; row < this.rows; row++) {
      map[row] = []
      for (let col = 0; col < this.cols; col++) {
        const distanceFromCenter = Math.max(Math.abs(row - center), Math.abs(col - center))

        // 初始化：依 CASTLE_TILES 清單標記城堡，其餘鋪草地
        map[row][col] = {
          type: isCastleTile(row, col) ? 'castle' : 'grass',
          explored: distanceFromCenter <= 6
        }
      }
    }
    return map
  }



  updateMapData(newMapData) { 
    if (!newMapData || Object.keys(newMapData).length === 0) return;
    this.mapData = newMapData;
    this.drawGrid();
  }

  setSelectedTile(x, y) { this.selectedTile = { x, y }; this.drawGrid(); }
  clearSelectedTile() { this.selectedTile = null; this.drawGrid(); }

  revealTile(row, col) { 
    if (this.mapData[row] && this.mapData[row][col]) {
      this.mapData[row][col].explored = true
      this.drawGrid()
    }
  }
  
  // 在 drawGrid 方法中修正點擊區域問題
  drawGrid() {
    // 清除現有網格
    this.groundContainer.removeChildren()
    this.objectContainer.removeChildren()

    const halfW = this.tileSize / 2
    const halfH = this.tileSize / 4

    // 第一階段：繪製所有草地
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = (col - row) * halfW
        const y = (col + row) * halfH

        // 創建地面瓦片容器
        const groundTileContainer = new PIXI.Container()
        groundTileContainer.sortableChildren = true
        groundTileContainer.x = x
        groundTileContainer.y = y
        groundTileContainer.zIndex = row + col

        const cell = this.mapData[row]?.[col] || { status: 'locked' }
        
        // 檢查是否為選中的瓦片
        const isSelected = this.selectedTile && this.selectedTile.x === col && this.selectedTile.y === row;

        // 先鋪草地作為地面（每格都鋪，包括城堡格）
        if (this.grassTextures && this.grassTextures.grass) {
          const mask = new PIXI.Graphics();
          mask
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .fill(0xffffff);

          const grass = new PIXI.Sprite(this.grassTextures.grass);
          grass.anchor.set(0.5, 0.5);
          const coverageScale = 2.0;
          grass.width = this.tileSize * coverageScale;
          grass.height = this.tileSize * coverageScale;
          grass.mask = mask; 
          grass.zIndex = 1;
          
          groundTileContainer.addChild(mask);
          groundTileContainer.addChild(grass);

          if (cell.status === 'locked' && this.landTexture) {
            const mask2 = new PIXI.Graphics();
            mask2
              .moveTo(0, -halfH)
              .lineTo(halfW, 0)
              .lineTo(0, halfH)
              .lineTo(-halfW, 0)
              .closePath()
              .fill(0xffffff);

            const landCover = new PIXI.Sprite(this.landTexture);
            landCover.anchor.set(0.51, 0.36);
            const coverageScale2 = 2.5;
            landCover.width = this.tileSize * coverageScale2;
            landCover.height = this.tileSize * coverageScale2;
            landCover.mask = mask2; 
            landCover.zIndex = 2;  

            groundTileContainer.addChild(mask2);
            groundTileContainer.addChild(landCover);
          }
        }

        // 只為非城堡格子創建可互動區域
        if (cell.type !== 'castle') {
          const tile = new PIXI.Graphics();
          tile
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .stroke({ width: 1, color: 0xcccccc, alpha: 0.3})
            .fill({ color: 0xffffff, alpha: 0 });
          tile.zIndex = 2;
          groundTileContainer.addChild(tile);

          // 設置點擊區域和事件
          groundTileContainer.hitArea = new PIXI.Rectangle(-halfW, -halfH, this.tileSize, this.tileSize);
          groundTileContainer.eventMode = 'static';
          groundTileContainer.interactive = true;
          groundTileContainer.cursor = 'pointer';

          // 綁定點擊事件
          groundTileContainer.on('pointertap', () => {
            if (this.onTileClick) {
              this.onTileClick(row, col);
            }
          });

          // hover 效果
          groundTileContainer.on('pointerover', () => { tile.tint = 0xdddddd; });
          groundTileContainer.on('pointerout', () => { tile.tint = 0xffffff; });
        }

        // 如果是選中的瓦片，添加邊框
        if (isSelected) {
          const highlight = new PIXI.Graphics();
          highlight
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .stroke({ width: 3, color: 0x00ff00, alpha: 1 });
          
          highlight.zIndex = 10;
          groundTileContainer.addChild(highlight);
        }

        this.groundContainer.addChild(groundTileContainer);
      }
    }

    // 第二階段：繪製城堡（城堡圖片的 zIndex 要低於點擊區域）
    const castleCenterRow = CASTLE_BOUNDS.centerRow
    const castleCenterCol = CASTLE_BOUNDS.centerCol
    
    if (this.castleTexture) {
      const castleContainer = new PIXI.Container()
      castleContainer.sortableChildren = true
      // 確保城堡不攔截點擊事件
      castleContainer.eventMode = 'none'
      
      const castleX = (castleCenterCol - castleCenterRow) * halfW
      const castleY = (castleCenterCol + castleCenterRow) * halfH
      
      castleContainer.x = castleX
      castleContainer.y = castleY
      
      const offsetX = this.tileSize * 0.1
      castleContainer.x -= offsetX

      const castle = new PIXI.Sprite(this.castleTexture)
      castle.eventMode = 'none'
      castle.anchor.set(0.5, 0.55)
      const castleScale = 2.5
      castle.width = this.tileSize * 3 * castleScale
      castle.height = this.tileSize * 2 * castleScale
      castle.zIndex = 5 // 城堡在建築層
      
      castleContainer.addChild(castle)
      this.objectContainer.addChild(castleContainer)
    }

    // 第三階段：繪製其他建築（保持不變）
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.mapData[row][col]
        
        if (cell.status === 'placed' && cell.item) {
          const x = (col - row) * halfW
          const y = (col + row) * halfH

          const buildingContainer = new PIXI.Container()
          buildingContainer.sortableChildren = true
          buildingContainer.x = x
          buildingContainer.y = y
          buildingContainer.zIndex = row + col + 50

          const buildingId = cell.item
          const buildingTexture = this.buildingTextures[buildingId]
          
          if (buildingTexture) {
            const buildingSprite = new PIXI.Sprite(buildingTexture)
            buildingSprite.zIndex = 5
            
            const originalWidth = buildingTexture.width
            const originalHeight = buildingTexture.height
            const scale = Math.min(this.tileSize / originalWidth, this.tileSize / originalHeight)
            
            buildingSprite.width = originalWidth * scale
            buildingSprite.height = originalHeight * scale
            buildingSprite.anchor.set(0.5, 0.8)
            buildingSprite.y = halfH * 0.1
            
            buildingContainer.addChild(buildingSprite)
            this.objectContainer.addChild(buildingContainer)
          }
        }
      }
    }
  }
}
