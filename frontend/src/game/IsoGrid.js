import * as PIXI from 'pixi.js'

export class IsoGrid {
  constructor(app, rows, cols, tileSize = 64, onTileClick, mapData = null) {
    console.log('IsoGrid 構造器:', { rows, cols, tileSize, onTileClick: !!onTileClick })
    
    this.app = app
    this.rows = rows
    this.cols = cols
    this.tileSize = tileSize
    this.onTileClick = onTileClick
    this.mapData = mapData || this.createDefaultMap()
    this.selectedTile = null // 添加選中瓦片追蹤
    this.gridContainer = new PIXI.Container()
    
    // 確保容器可以接收交互事件
    this.gridContainer.interactive = true
    this.gridContainer.eventMode = 'static' // PIXI v8 的新屬性
    
    this.app.stage.addChild(this.gridContainer)
    
    console.log('IsoGrid 初始化完成')
  }

  createDefaultMap() {
    console.log('創建默認地圖:', this.rows, 'x', this.cols)
    const map = []
    for (let row = 0; row < this.rows; row++) {
      map[row] = []
      for (let col = 0; col < this.cols; col++) {
        map[row][col] = { type: 'empty' }
      }
    }
    return map
  }

  updateMapData(newMapData) {
    console.log('更新地圖數據:', newMapData)
    this.mapData = newMapData
    this.drawGrid()
  }

  // 新增：設置選中的瓦片
  setSelectedTile(x, y) {
    console.log('IsoGrid 設置選中瓦片:', { x, y });
    this.selectedTile = { x, y };
    this.drawGrid(); // 重新繪製以顯示選中狀態
  }

  // 新增：清除選中的瓦片
  clearSelectedTile() {
    this.selectedTile = null;
    this.drawGrid();
  }

  drawGrid() {
    console.log('開始繪製網格，瓦片數量:', this.rows * this.cols)
    
    // 清除現有網格
    this.gridContainer.removeChildren()

    const halfW = this.tileSize / 2
    const halfH = this.tileSize / 4

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = (col - row) * halfW + this.app.screen.width / 2
        const y = (col + row) * halfH + 100

        const tile = new PIXI.Graphics()
        const cell = this.mapData[row][col]

        let color = 0xffffff
        let alpha = 0.3
        
        // 檢查是否為選中的瓦片
        const isSelected = this.selectedTile && this.selectedTile.x === col && this.selectedTile.y === row;
        
        if (cell.type === 'building') {
          color = 0x999999
          alpha = 0.6
        } else if (isSelected) {
          // 選中的瓦片使用綠色
          color = 0x00ff00
          alpha = 0.7
        }

        tile
          .moveTo(0, -halfH)   // 上
          .lineTo(halfW, 0)    // 右
          .lineTo(0, halfH)    // 下
          .lineTo(-halfW, 0)   // 左
          .closePath()         // 回到起點
          .stroke({ width: 1, color: 0xcccccc, alpha: 0.6 }) // 描邊
          .fill({ color: color, alpha: alpha });              // 填充

        // 如果是選中的瓦片，添加邊框（單獨的 Graphics，避免覆蓋填充）
        if (isSelected) {
          const borderTile = new PIXI.Graphics();
          borderTile.lineStyle(3, 0x00ff00, 1);
          borderTile.drawRect(-halfW, -halfH, this.tileSize, this.tileSize);
          borderTile.x = x;
          borderTile.y = y;
          borderTile.eventMode = 'none'; // 邊框不攔截事件
          this.gridContainer.addChild(borderTile);
        }

        tile.x = x
        tile.y = y
        tile.eventMode = 'static' // PIXI v8 使用 eventMode 替代 interactive
        tile.cursor = 'pointer'
  
        tile.on('pointerdown', () => { // 使用 pointerdown 捕捉按下
          console.log('🎯 瓦片 pointerdown:', { row, col });
        });
        tile.on('pointerup', () => { // 放開
          console.log('🖱️ 瓦片 pointerup:', { row, col });
        });
        tile.on('pointertap', () => { // 單擊
          console.log('✅ 瓦片 pointertap（單擊）:', { row, col, cell, isSelected });
          if (this.onTileClick) {
            this.onTileClick(row, col);
          }
        });

        // 添加更多事件來調試
        tile.on('pointerover', () => {
          console.log('🖱️ 瓦片懸停:', { row, col });
        });

        tile.on('pointerout', () => {
          console.log('🚪 瓦片離開:', { row, col });
        });
  
        this.gridContainer.addChild(tile);
      }
    }
    
    console.log('網格繪製完成，總瓦片數:', this.rows * this.cols)
    console.log('gridContainer 子元素數量:', this.gridContainer.children.length)
    console.log('gridContainer 可見性:', this.gridContainer.visible)
    console.log('gridContainer 交互性:', this.gridContainer.interactive)
  }
}