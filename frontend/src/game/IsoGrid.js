import * as PIXI from 'pixi.js'

export class IsoGrid {
  constructor(app, rows, cols, tileSize = 120, onTileClick, mapData = null) {
    console.log('IsoGrid 構造器:', { rows, cols, tileSize, onTileClick: !!onTileClick })
    
    this.app = app
    this.rows = rows
    this.cols = cols
    this.tileSize = tileSize
    this.onTileClick = onTileClick
    this.mapData = mapData || this.createDefaultMap()
    this.selectedTile = null
    this.gridContainer = new PIXI.Container()
    
    // 確保容器可以接收交互事件
    this.gridContainer.interactive = true
    this.gridContainer.eventMode = 'static'
    
    this.app.stage.addChild(this.gridContainer)
    
    // 預載入建築圖片
    this.loadBuildingTextures()
  }
  
  // 預載入建築圖片
  loadBuildingTextures() {
    this.buildingTextures = {}
    
    // 使用 Vite 的動態導入來載入圖片
    const importBuildingImage = async (id) => {
      try {
        // 使用 Vite 的動態導入，獲取正確的資源 URL
        const module = await import(`../assets/b${id}.png`)
        const imageUrl = module.default
        
        // 創建 Image 對象來預載入
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
                 img.onload = () => {
           // 圖片載入完成後創建 PIXI 紋理
           const texture = PIXI.Texture.from(img)
           this.buildingTextures[id] = texture
           console.log(`✅ 建築圖片 ${id} 載入成功:`, {
             url: imageUrl,
             size: `${img.naturalWidth}x${img.naturalHeight}`,
             texture: texture.baseTexture ? `${texture.baseTexture.width}x${texture.baseTexture.height}` : 'unknown'
           })
         }
        
        img.onerror = () => {
          console.warn(`⚠️ 建築圖片 ${id} 載入失敗:`, imageUrl)
          // 如果載入失敗，創建一個彩色矩形作為替代
          const graphics = new PIXI.Graphics()
          graphics.rect(0, 0, this.tileSize, this.tileSize)
            .fill({ color: 0x00ff00 + (id * 0x111111) })
          this.buildingTextures[id] = graphics.generateTexture()
        }
        
        img.src = imageUrl
        
      } catch (error) {
        console.warn(`⚠️ 建築圖片 ${id} 導入失敗:`, error)
        // 如果導入失敗，創建一個彩色矩形作為替代
        const graphics = new PIXI.Graphics()
        graphics.rect(0, 0, this.tileSize, this.tileSize)
          .fill({ color: 0x00ff00 + (id * 0x111111) })
        this.buildingTextures[id] = graphics.generateTexture()
      }
    }
    
    // 並行載入所有建築圖片
    for (let i = 1; i <= 9; i++) {
      importBuildingImage(i)
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

        map[row][col] = { 
          type: 'empty',
          explored: distanceFromCenter <= 6  // 內圈預設可開發，外圈未知
        }
      }
    }
    return map
  }


  updateMapData(newMapData) {
    console.log('更新地圖數據:', newMapData)
    this.mapData = newMapData
    this.drawGrid()
  }


  setSelectedTile(x, y) {
    this.selectedTile = { x, y };
    this.drawGrid();
  }

  clearSelectedTile() {
    this.selectedTile = null;
    this.drawGrid();
  }


  revealTile(row, col) {
    if (this.mapData[row] && this.mapData[row][col]) {
      this.mapData[row][col].explored = true
      this.drawGrid()
    }
  }
  
  drawGrid() {
    
    // 清除現有網格
    this.gridContainer.removeChildren()

    const halfW = this.tileSize / 2
    const halfH = this.tileSize / 4

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // 將格子繪製在世界座標系原點，交給 worldContainer 做置中/鏡頭移動
        const x = (col - row) * halfW
        const y = (col + row) * halfH

        // 創建瓦片容器
        const tileContainer = new PIXI.Container()
        tileContainer.x = x
        tileContainer.y = y

        const tile = new PIXI.Graphics()
        const cell = this.mapData[row][col]

        let color = 0xffffff
        let alpha = 0.3
        
        
        // 檢查是否為選中的瓦片
        const isSelected = this.selectedTile && this.selectedTile.x === col && this.selectedTile.y === row;
        
        // 檢查是否為建築瓦片
        if (cell.type === 'building') {
          // 建築瓦片：顯示建築圖片
          const buildingId = cell.buildingId || 1 // 默認使用建築1
          const buildingTexture = this.buildingTextures[buildingId]
          
          if (buildingTexture) {
            const buildingSprite = new PIXI.Sprite(buildingTexture)
            
            // 計算合適的尺寸，保持比例
            const originalWidth = buildingTexture.baseTexture.width
            const originalHeight = buildingTexture.baseTexture.height
            const scale = Math.min(this.tileSize / originalWidth, this.tileSize / originalHeight)
            
            buildingSprite.width = originalWidth * scale
            buildingSprite.height = originalHeight * scale
            buildingSprite.anchor.set(0.5, 0.5) // 設置錨點為中心
            
            
            // 將建築精靈添加到容器
            tileContainer.addChild(buildingSprite)
            
            // 將建築瓦片容器添加到網格容器
            this.gridContainer.addChild(tileContainer)
            
            // 建築瓦片不需要基礎菱形，直接跳過
            continue
          } else {
            // 如果圖片還沒載入完成，顯示彩色矩形作為佔位符
            const placeholder = new PIXI.Graphics()
            placeholder.rect(-halfW, -halfH, this.tileSize, this.tileSize)
              .fill({ color: 0x00ff00 + (buildingId * 0x111111) })
            tileContainer.addChild(placeholder)
            continue
          }
        }
        
        // 非建築瓦片：繪製菱形
        if (isSelected) {
          color = 0x00ff00  // 選中的瓦片使用綠色
          alpha = 0.7
        }

        // 繪製菱形瓦片
        tile
          .moveTo(0, -halfH)   // 上
          .lineTo(halfW, 0)    // 右
          .lineTo(0, halfH)    // 下
          .lineTo(-halfW, 0)   // 左
          .closePath()
          .stroke({ width: 1, color: 0xcccccc, alpha: 0.6 })
          .fill({ color: color, alpha: alpha });

        // 簡化 hitArea 設置，使用矩形區域
        tileContainer.hitArea = new PIXI.Rectangle(-halfW, -halfH, this.tileSize, this.tileSize);
        tileContainer.eventMode = 'static';  // 使用 static 模式
        tileContainer.interactive = true;    // 確保可交互
        tileContainer.cursor = 'pointer';

        // 如果是選中的瓦片，添加邊框
        if (isSelected) {
          const border = new PIXI.Graphics();
          border
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .stroke({ width: 3, color: 0x00ff00, alpha: 1 }); 
          tileContainer.addChild(border);
        }

        tileContainer.addChild(tile);

        // 簡化事件處理，只使用 pointertap

        tileContainer.on('pointertap', () => {
          if (!cell.explored) {
            tileContainer.on('pointerover', () => { tile.tint = 0xdddddd })
            tileContainer.on('pointerout', () => { tile.tint = 0xffffff })
            // 如果這格是未知 → 觸發題目（交給 Vue）
            if (this.onTileClick) {
              this.onTileClick(row, col, false) // false = 未探索
            }
          } else {
            // 已探索 → 可以正常觸發其他事件
            if (this.onTileClick) {
              this.onTileClick(row, col, true) // true = 已探索
            }
          }
        });




        tileContainer.on('pointerover', () => { //懸停
          tile.tint = 0xdddddd;
        });

        tileContainer.on('pointerout', () => { //離開
          tile.tint = 0xffffff;
        });

        this.gridContainer.addChild(tileContainer);
      }
    }
  }

  

}