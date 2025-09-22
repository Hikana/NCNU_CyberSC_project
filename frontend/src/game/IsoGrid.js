import * as PIXI from 'pixi.js';

export class IsoGrid {
  constructor(app, rows, cols, tileSize = 120, onTileClick, mapData = null) {
    this.app = app;
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;
    this.onTileClick = onTileClick;
    this.mapData = mapData || {};
    this.selectedTile = null;
    this.gridContainer = new PIXI.Container();
    this.gridContainer.eventMode = 'static';
    this.buildingTextures = {};

    this.loadBuildingTextures(); // 啟動載入
  }

  /**
   * ✅ 使用 PIXI.Assets 進行資源預載入
   */
  async loadBuildingTextures() {
    const assetsToLoad = [];
    // 1. 準備要載入的資源清單
    for (let i = 1; i <= 9; i++) {
      const id = i.toString();
      try {
        const module = await import(`../assets/b${id}.png`);
        // 給每個資源一個唯一的別名 (alias) 和路徑 (src)
        assetsToLoad.push({ alias: `building${id}`, src: module.default });
      } catch (e) {
        console.warn(`找不到建築圖片 b${id}.png`);
      }
    }
    
    try {
      // 2. 一次性地、並行地載入所有資源
      console.log('⏳ 開始批次載入建築圖片...');
      const loadedTextures = await PIXI.Assets.load(assetsToLoad);
      
      // 3. 將載入好的紋理存起來
      for (const asset of assetsToLoad) {
          const id = asset.alias.replace('building', '');
          this.buildingTextures[id] = loadedTextures[asset.alias];
      }
      console.log('✅ 所有建築圖片已成功載入並快取');
    } catch (error) {
        console.error('批次載入建築圖片失敗:', error);
    }
    
    // 4. 確保所有紋理都準備好後再繪製
    this.drawGrid();
  }

  // --- drawGrid 和其他方法維持不變 ---


  updateMapData(newMapData) {
    if (!newMapData || Object.keys(newMapData).length === 0) return;
    this.mapData = newMapData;
    this.drawGrid();
  }

  setSelectedTile(x, y) { this.selectedTile = { x, y }; this.drawGrid(); }
  clearSelectedTile() { this.selectedTile = null; this.drawGrid(); }

  drawGrid() {
    this.gridContainer.removeChildren();
    const halfW = this.tileSize / 2;
    const halfH = this.tileSize / 4;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = (c - r) * halfW;
        const y = (c + r) * halfH;
        
        // ✅ 修正資料讀取方式，以相容 store 的物件格式
        const cell = this.mapData[r]?.[c] || { status: 'locked' };
        
        const tileContainer = new PIXI.Container();
        tileContainer.position.set(x, y);

        // --- 整合後的渲染邏輯 ---
        
        const tile = new PIXI.Graphics();
        let fillColor;
        let fillAlpha = 0.8;

        // 1. 根據土地狀態決定基礎顏色
        switch (cell.status) {
          case 'developed': fillColor = 0x90ee90; break; // 淺綠色
          case 'placed': fillColor = 0xadd8e6; break;    // 淺藍色
          case 'locked': default: fillColor = 0x808080; fillAlpha = 0.6; break; // 灰色
        }

        // 2. 繪製基礎菱形瓦片
        tile.poly([-halfW, 0, 0, -halfH, halfW, 0, 0, halfH])
            .fill({ color: fillColor, alpha: fillAlpha })
            .stroke({ width: 1, color: 0xFFFFFF, alpha: 0.15 });
        tileContainer.addChild(tile);

        // 3. 如果是已放置狀態，就在上面疊加建築圖片
        if (cell.status === 'placed' && cell.item) {
          const buildingTexture = this.buildingTextures[cell.item];
          if (buildingTexture && buildingTexture.valid) {
            const buildingSprite = new PIXI.Sprite(buildingTexture);
            buildingSprite.anchor.set(0.5, 0.85); // 調整錨點讓建築底部對齊
            const scale = (this.tileSize / buildingTexture.width) * 0.9;
            buildingSprite.scale.set(scale);
            tileContainer.addChild(buildingSprite);
          }
        }
        
        // 4. 如果是選中狀態，再疊加高亮效果
        const isSelected = this.selectedTile && this.selectedTile.x === c && this.selectedTile.y === r;
        if (isSelected) {
          const border = new PIXI.Graphics();
          border.poly([-halfW, 0, 0, -halfH, halfW, 0, 0, halfH])
                .stroke({ width: 3, color: 0x32cd32, alpha: 1 }); // 亮綠色邊框
          tileContainer.addChild(border);
        }
        
        // --- 事件綁定 (維持你的版本) ---
        tileContainer.eventMode = 'static';
        tileContainer.cursor = 'pointer';
        tileContainer.on('pointertap', () => {
          if (this.onTileClick) this.onTileClick(r, c);
        });
        
        this.gridContainer.addChild(tileContainer);
      }
    }
  }
}