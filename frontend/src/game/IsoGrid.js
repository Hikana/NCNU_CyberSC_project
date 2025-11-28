import * as PIXI from 'pixi.js'
import grassImg from '@/assets/grass.png'
import landImg from '@/assets/land.png'
import { useBuildingStore } from '@/stores/buildings'
import { useWallStore } from '@/stores/wall'
import { getConnectionColor, INTERNET_TOWER_TYPE } from '@/game/connectionRules'
import castleImg from '@/assets/castle0.png'
import can1Img from '@/assets/can1.png'
import { audioService } from '@/services/audioService'
import routerImg from '@/assets/router.png'
import switchImg from '@/assets/switch.png'
import wafIconImg from '@/assets/WAF.png'
import nwfIconImg from '@/assets/NWF.png'
import hfIconImg from '@/assets/HF.png'

function refreshCastleFirewallBadge(mapData, connectionWorld, tileSize, rows, cols) {
  if (!mapData) return;
  let castleFwKind = null;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = mapData[r]?.[c];
      if (cell && cell.type === 'castle') {
        const kind = String(cell.firewall || '').toLowerCase();
        if (kind) {
          castleFwKind = kind;
          break;
        }
      }
    }
    if (castleFwKind) break;
  }
  if (!castleFwKind && connectionWorld) {
    connectionWorld.removeChildren();
  }
}

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
  constructor(app, rows, cols, tileSize = 150, onTileClick, mapData = null, buildingStore = null, connectionApp = null, connectionWorld = null) {
    console.log('IsoGrid 構造器:', { rows, cols, tileSize, onTileClick: !!onTileClick })
    
    this.app = app
    this.connectionApp = connectionApp // 獨立的連線應用
    this.connectionWorld = connectionWorld // 連線世界容器
    this.rows = rows
    this.cols = cols
    this.tileSize = tileSize
    this.onTileClick = onTileClick
    this.mapData = mapData || this.createDefaultMap()
    this.buildingStore = buildingStore || useBuildingStore()
    this.selectedTile = null
    this.playerTile = null // 追蹤玩家所在的格子 { row, col }
    this.gridContainer = new PIXI.Container()
    // 允許依據 zIndex 排序，確保地圖元素可正確分層
    this.gridContainer.sortableChildren = true
    // 分層：地面(草地) 與 物件(建築/互動) 與 連線    第50-62行：連線容器設置
    this.groundContainer = new PIXI.Container()    
    this.objectContainer = new PIXI.Container()
    this.connectionContainer = new PIXI.Container()
    this.groundContainer.sortableChildren = true
    this.objectContainer.sortableChildren = true
    this.connectionContainer.sortableChildren = true
    this.groundContainer.zIndex = 0
    this.objectContainer.zIndex = 1
    this.connectionContainer.zIndex = 10 // 提高連線層級，確保在建築物之上
    // 物件層不攔截滑鼠事件，確保可點擊到地面格
    this.objectContainer.eventMode = 'none'
    // 連線層也不攔截滑鼠事件
    this.connectionContainer.eventMode = 'none'
    
    // 確保容器可以接收交互事件
    this.gridContainer.interactive = true
    this.gridContainer.eventMode = 'static'
    
    // 城堡碰撞檢測相關屬性
    this.castleHit = false // 是否已經碰到城堡
    this.castleContainer = null // 城堡容器引用
    
    // 連線相關屬性
    this.connectionLines = [] // 儲存連線圖形引用
    this.connectionGlowLayers = [] // 儲存發光層引用，用於動畫
    this.connectionAnimations = [] // 儲存動畫時間參數
    this.connectionGlowTicker = null // 儲存ticker引用
    // 防火牆徽章發光（不使用混合模式，以 alpha 脈衝實現）
    this.firewallBadgeAnimations = []
    
    this.app.stage.addChild(this.gridContainer)
    this.gridContainer.addChild(this.groundContainer)
    this.gridContainer.addChild(this.objectContainer)
    this.gridContainer.addChild(this.connectionContainer)   //第75行：連線容器添加到地圖容器
    
    this.loadBuildingTextures()
    this.loadGrassTextures() 
    this.loadLandTexture()
    this.loadCastleTextures()
    
    // 啟動連線發光動畫
    this.startConnectionGlowAnimation()
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

  // 建立防火牆盾牌徽章（以向量繪圖呈現，不使用圖片資源）
  createFirewallBadge(kind) {
    const badge = new PIXI.Container()

    const colorMap = {
      hf: 0x22c55e,   // 綠色：Host Firewall
      nwf: 0x3b82f6,  // 藍色：Network Firewall
      waf: 0xf97316,  // 橘色：WAF
    }
    const baseColor = colorMap[kind] || 0x64748b // 預設灰藍

    const w = this.tileSize * 0.22
    const h = this.tileSize * 0.22

    const drawShield = (g, width, height, fillColor, strokeWidth = 3, strokeColor = 0xffffff, strokeAlpha = 0.9) => {
      g
        .moveTo(0, -height * 0.62)
        .lineTo(width * 0.52, -height * 0.18)
        .lineTo(width * 0.38, height * 0.48)
        .lineTo(0, height * 0.75)
        .lineTo(-width * 0.38, height * 0.48)
        .lineTo(-width * 0.52, -height * 0.18)
        .closePath()
        .fill({ color: fillColor })
        .stroke({ width: strokeWidth, color: strokeColor, alpha: strokeAlpha })
    }

    // 外層盾牌
    const outer = new PIXI.Graphics()
    drawShield(outer, w, h, baseColor, 4)

    // 內層盾徽（較小，白色，營造徽章層次）
    const inner = new PIXI.Graphics()
    drawShield(inner, w * 0.58, h * 0.58, 0xffffff, 0)
    inner.alpha = 0.9

    // 核心小徽（與底色同色，置中，強化辨識）
    const core = new PIXI.Graphics()
    drawShield(core, w * 0.28, h * 0.28, baseColor, 0)
    core.alpha = 0.95

    // 連線式發光：兩層較大、較淡的盾形作為光暈（以 alpha 脈衝呈現）
    const glowOuter = new PIXI.Graphics()
    drawShield(glowOuter, w * 1.28, h * 1.28, baseColor, 0)
    glowOuter.alpha = 0.5
    glowOuter.zIndex = 997

    // 內層改為「白色描邊光圈」，避免被本體覆蓋
    const glowInner = new PIXI.Graphics()
    glowInner
      .moveTo(0, -h * 0.62)
      .lineTo(w * 0.52, -h * 0.18)
      .lineTo(w * 0.38, h * 0.48)
      .lineTo(0, h * 0.75)
      .lineTo(-w * 0.38, h * 0.48)
      .lineTo(-w * 0.52, -h * 0.18)
      .closePath()
      .stroke({ width: Math.max(6, this.tileSize * 0.04), color: 0xffffff, alpha: 0.95 })
    glowInner.zIndex = 1000

    // 先光暈再本體，確保層級正確
    badge.addChild(glowOuter)
    badge.addChild(outer)
    badge.addChild(inner)
    badge.addChild(core)
    badge.addChild(glowInner)
    badge.zIndex = 999

    // 保存動畫引用
    badge.glowOuter = glowOuter
    badge.glowInner = glowInner
    return badge
  }

  // 預載入建築圖片
  async loadBuildingTextures() {
    // 確保先初始化容器，避免其他異步載入先觸發 drawGrid 時為 undefined
    if (!this.buildingTextures) this.buildingTextures = {}

    // 預先為常見的字串路徑建立別名並載入，避免外部用字串 id 取用時找不到快取
    await this._ensureFirewallIconAliases()

    // 如果已經有紋理緩存，直接返回（重新進入時使用緩存）
    if (this.buildingTextures && Object.keys(this.buildingTextures).length > 0) {
      console.log('使用建築紋理緩存');
      return;
    }
    
    this.buildingTextures = this.buildingTextures || {}

    // 從當前地圖建立 id -> type 的對照（用於在商店資料未就緒時推斷類型）
    const idToType = {}
    
    // 確保商店資料可用（取得 type）
    const buildingStoreForInit = useBuildingStore()
    try {
      if (!buildingStoreForInit.shopBuildings || buildingStoreForInit.shopBuildings.length === 0) {
        await buildingStoreForInit.loadShop()
      }
    } catch (_) { /* 忽略，後續仍有備援 */ }

    // host 類型可用圖片的白名單，避免對不存在檔案做動態導入
    const HOST_IMAGE_IDS = new Set([1,2,3,5,6,7,11,12,13,14,15,16,17,18,19])

    // 使用 Vite 的動態導入來載入圖片（依 type 選圖）
    const importBuildingImage = async (id) => {
      try {
        // 透過商店資料判斷類型
        const buildingStore = useBuildingStore()
        const item = (buildingStore.shopBuildings || []).find(b => b.id === id)
        const type = item?.type || idToType[id] || 'host'
        let imageUrl
        if (type === 'router') {
          imageUrl = routerImg
        } else if (type === 'switch') {
          imageUrl = switchImg
        } else if (type === 'firewall') {
          // 防火牆不作為地圖建築紋理（只作為疊加 ICON），這裡給一張小圖避免報錯
          imageUrl = hfIconImg
        } else {
          if (!HOST_IMAGE_IDS.has(id)) {
            throw new Error(`Unknown host image id: ${id}`)
          }
          const module = await import(`@/assets/B${id}.png`)
          imageUrl = module.default
        }

        const texture = await PIXI.Assets.load(imageUrl);
        this.buildingTextures[id] = texture;
        
      } catch (error) {
        console.warn(`⚠️ 建築圖片 ${id} 導入失敗:`, error)
        // 如果導入失敗，創建一個彩色矩形作為替代
        const graphics = new PIXI.Graphics()
        const fallbackColors = [0x66ccff, 0xffcc66, 0xcc66ff, 0x99cc66, 0xcc6666, 0x6699cc]
        const safeColor = fallbackColors[id % fallbackColors.length]
        graphics.rect(0, 0, this.tileSize, this.tileSize)
          .fill({ color: safeColor })
        this.buildingTextures[id] = this.createTextureFromGraphics(graphics)
      }
    }
    
    // 動態載入建築圖片：合併商店定義與當前地圖上已放置的建築 ID
    const buildingStore = useBuildingStore()
    // 只預載入 host/router/switch，忽略 firewall（201/202/203）
    const idsFromShop = (buildingStore.shopBuildings || [])
      .filter(b => b.type !== 'firewall')
      .map(b => b.id)
    const idsFromMap = []
    if (this.mapData) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.mapData[r]?.[c]
          if (cell && cell.status === 'placed' && cell.buildingId) {
            idsFromMap.push(cell.buildingId)
            if (cell.type) {
              idToType[cell.buildingId] = cell.type
            }
          }
        }
      }
    }
    let buildingIds = Array.from(new Set([...idsFromShop, ...idsFromMap]))
    // 若仍為空，載入常用的預設編號，避免初次未載入商店時建築缺圖
    if (buildingIds.length === 0) {
      buildingIds = [1,2,3,5,6,7,11,12,13,14,15,16,17,18,19]
    }
    
    // 等待所有建築圖片載入完成
    await Promise.all(buildingIds.map(id => importBuildingImage(id)));
    
    console.log('所有建築圖片載入完成');
    
    // 載入完成後重繪地圖
    if (this.mapData) {
      this.drawGrid();
    }
  }

  // 確保防火牆 ICON 以字串 id 也能在快取中命中（處理 /src/assets/*.png 類型的取用）
  async _ensureFirewallIconAliases() {
    const registrations = [
      { id: '/src/assets/HF.png', src: hfIconImg },
      { id: '/src/assets/WAF.png', src: wafIconImg },
      { id: '/src/assets/NWF.png', src: nwfIconImg },
    ]
    for (const { id, src } of registrations) {
      try {
        // 嘗試註冊別名
        // 在 Pixi v8：Assets.add({ alias, src })
        // 在 Pixi v7：Assets.add(alias, src) 也可，被 try/catch 掉不影響
        if (PIXI?.Assets?.add) {
          PIXI.Assets.add({ alias: id, src })
        }
        // 預載入，確保之後 Assets.get(id) 能命中
        if (PIXI?.Assets?.load) {
          await PIXI.Assets.load(id)
        }
      } catch (_) {
        // 忽略重複註冊或載入錯誤（不影響後續流程）
      }
    }
  }

  // 確保地圖上需要的建築紋理已載入（在地圖更新後呼叫）
  async ensureBuildingTexturesForMap() {
    if (!this.mapData) return
    if (!this.buildingTextures) this.buildingTextures = {}

    const neededIdsSet = new Set()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.mapData[r]?.[c]
        if (cell && cell.status === 'placed' && cell.buildingId) {
          if (!this.buildingTextures[cell.buildingId]) {
            neededIdsSet.add(cell.buildingId)
          }
        }
      }
    }

    const missingIds = Array.from(neededIdsSet)
    if (missingIds.length === 0) return

    // 依目前地圖再次建立 id -> type 對照
    const idToType2 = {}
    if (this.mapData) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.mapData[r]?.[c]
          if (cell && cell.status === 'placed' && cell.buildingId && cell.type) {
            idToType2[cell.buildingId] = cell.type
          }
        }
      }
    }

    const importBuildingImage = async (id) => {
      try {
        const buildingStore = useBuildingStore()
        const item = (buildingStore.shopBuildings || []).find(b => b.id === id)
        const type = item?.type || idToType2[id] || 'host'
        let imageUrl
        if (type === 'router') {
          imageUrl = routerImg
        } else if (type === 'switch') {
          imageUrl = switchImg
        } else {
          if (!HOST_IMAGE_IDS.has(id)) {
            throw new Error(`Unknown host image id: ${id}`)
          }
          const module = await import(`@/assets/B${id}.png`)
          imageUrl = module.default
        }
        const texture = await PIXI.Assets.load(imageUrl)
        this.buildingTextures[id] = texture
      } catch (error) {
        const graphics = new PIXI.Graphics()
        const fallbackColors = [0x66ccff, 0xffcc66, 0xcc66ff, 0x99cc66, 0xcc6666, 0x6699cc]
        const safeColor = fallbackColors[id % fallbackColors.length]
        graphics.rect(0, 0, this.tileSize, this.tileSize).fill({ color: safeColor })
        this.buildingTextures[id] = this.createTextureFromGraphics(graphics)
      }
    }

    await Promise.all(missingIds.map(id => importBuildingImage(id)))
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
  
  // 預載入城堡圖片（多層級）
  async loadCastleTextures() {
    this.castleTextures = {}
    
    // 載入公網塔基礎圖片（castle0.png）
    try {
      this.castleTextures[0] = await PIXI.Assets.load(castleImg)
    } catch (e) {
      console.warn('⚠️ 公網塔基礎圖片載入失敗，使用後備方案:', e)
      this.castleTextures[0] = PIXI.Texture.from(castleImg)
    }
    
    // 載入 can1.png 作為公網塔被碰到的替換圖片
    try {
      this.castleTextures['can1'] = await PIXI.Assets.load(can1Img)
    } catch (e) {
      console.warn('⚠️ can1.png 載入失敗，使用後備方案:', e)
      this.castleTextures['can1'] = PIXI.Texture.from(can1Img)
    }
    
  // 動態載入公網塔升級層級圖片（castle1.png 到 castle10.png）
  const loadCastleLevel = async (level) => {
    try {
      const module = await import(`@/assets/castle${level}.png`)
      const imageUrl = module.default
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const texture = PIXI.Texture.from(img)
          this.castleTextures[level] = texture
          resolve(texture)
        }
        img.onerror = reject
        img.src = imageUrl
      })
    } catch (error) {
      console.warn(`⚠️ 公網塔圖片 castle${level}.png 載入失敗:`, error)
      return null
    }
  }
    
    // 載入所有公網塔等級圖片
    const loadPromises = []
    for (let level = 1; level <= 10; level++) {
      loadPromises.push(loadCastleLevel(level))
    }
    
    try {
      await Promise.all(loadPromises)
      console.log('公網塔圖片載入完成')
    } catch (e) {
      console.warn('部分公網塔圖片載入失敗:', e)
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

        map[row][col] = {
          type: isCastleTile(row, col) ? 'castle' : 'grass',
          explored: distanceFromCenter <= 6
        }
      }
    }
    return map
  }



  updateMapData(newMapData, updatedPositions = null) { 
    if (!newMapData || Object.keys(newMapData).length === 0) return;
    this.mapData = newMapData;
    if (Array.isArray(updatedPositions) && updatedPositions.length > 0) {
      updatedPositions.forEach(({ x, y }) => {
        if (this.mapData[y] && this.mapData[y][x] && this.mapData[y][x].type === 'castle') {
          refreshCastleFirewallBadge(this.mapData, this.connectionWorld, this.tileSize, this.rows, this.cols);
        }
      });
    }
    this.ensureBuildingTexturesForMap()
      .then(() => this.drawGrid())
      .catch(() => this.drawGrid());
  }

  setSelectedTile(x, y) { this.selectedTile = { x, y }; this.drawGrid(); }
  clearSelectedTile() { this.selectedTile = null; this.drawGrid(); }
  
  // 更新玩家所在的格子位置
  setPlayerTile(row, col) { 
    if (this.playerTile?.row === row && this.playerTile?.col === col) {
      return; // 位置沒有變化，不需要重繪
    }
    this.playerTile = { row, col }; 
    this.drawGrid(); 
  }
  clearPlayerTile() { this.playerTile = null; this.drawGrid(); }

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
    this.connectionContainer.removeChildren()

    // 重置徽章動畫列表（避免保留已被移除的引用）
    this.firewallBadgeAnimations = []

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
        
        // 檢查是否為選中的瓦片（建築放置）
        const isSelected = this.selectedTile && this.selectedTile.x === col && this.selectedTile.y === row;
        
        // 檢查是否為玩家所在的瓦片
        const isPlayerTile = this.playerTile && this.playerTile.row === row && this.playerTile.col === col;

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

        // 互動區域：所有格子都允許點擊（包括城堡格），具體操作由點擊處理邏輯決定
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

        // 如果是玩家所在的瓦片，添加藍色描邊（與建築放置的綠色相同風格，單層）
        // 先添加藍色框框，確保它在綠色框框下面
        if (isPlayerTile) {
          const playerHighlight = new PIXI.Graphics();
          playerHighlight
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .stroke({ width: 3, color: 0x60a5fa, alpha: 1 });
          playerHighlight.zIndex = 10;
          groundTileContainer.addChild(playerHighlight);
        }
        
        // 如果是選中的瓦片（建築放置），添加綠色邊框
        // 後添加綠色框框並設置更高的 zIndex，確保它顯示在藍色框框上面
        if (isSelected) {
          const highlight = new PIXI.Graphics();
          highlight
            .moveTo(0, -halfH)
            .lineTo(halfW, 0)
            .lineTo(0, halfH)
            .lineTo(-halfW, 0)
            .closePath()
            .stroke({ width: 3, color: 0x00ff00, alpha: 1 });
          
          highlight.zIndex = 11; // 設置更高的 zIndex，確保綠色框框在藍色框框上面
          groundTileContainer.addChild(highlight);
        }

        this.groundContainer.addChild(groundTileContainer);
      }
    }

    // 第二階段：繪製城堡（多層級顯示）
    const castleCenterRow = CASTLE_BOUNDS.centerRow
    const castleCenterCol = CASTLE_BOUNDS.centerCol
    
    if (this.castleTextures && this.castleTextures[0]) {
      const wallStore = useWallStore()
      const castleLevel = wallStore.castleLevel || 0
      
      const castleContainer = new PIXI.Container()
      castleContainer.sortableChildren = true
      castleContainer.zIndex = 10
      // 確保城堡不攔截點擊事件
      castleContainer.eventMode = 'none'
      
      // 保存城堡容器引用以便後續操作
      this.castleContainer = castleContainer
      
      const castleX = (castleCenterCol - castleCenterRow) * halfW
      const castleY = (castleCenterCol + castleCenterRow) * halfH
      
      castleContainer.x = castleX
      castleContainer.y = castleY
      
      const offsetX = this.tileSize * 0.1
      castleContainer.x -= offsetX

      // 繪製城堡層級（從基礎層到當前等級）
      // 如果玩家在城堡內（開門狀態），第0層使用 can1.png，否則使用 castle0.png
      let topCastleLayer = null
      for (let level = 0; level <= castleLevel; level++) {
        let texture
        if (level === 0) {
          // 第0層：根據開門狀態選擇圖片
          if (this.castleHit && this.castleTextures['can1']) {
            texture = this.castleTextures['can1'] // 開門狀態
          } else {
            texture = this.castleTextures[0] // 關門狀態
          }
        } else {
          // 其他層級使用原本的城堡圖片
          texture = this.castleTextures[level]
        }
        
        if (texture) {
          const castleLayer = new PIXI.Sprite(texture)
          castleLayer.eventMode = 'none'
          castleLayer.anchor.set(0.5, 0.55)
          const castleScale = 2.5
          castleLayer.width = this.tileSize * 3 * castleScale
          castleLayer.height = this.tileSize * 2 * castleScale
          castleLayer.zIndex = 5 + level // 每層級增加 zIndex，確保正確疊加
          
          // 讓上層稍微偏移，營造疊加效果
          if (level > 0) {
            // Y軸稍微向上偏移（讓上層看起來更高）
            castleLayer.y = -level * 112
          }
          castleContainer.addChild(castleLayer)
          topCastleLayer = castleLayer
        }
      }
      this.objectContainer.addChild(castleContainer)

      // 若有顯示開關時才顯示城堡盾牌
      if (this.buildingStore?.showConnections) {
        // 改為掃描整張地圖的實際城堡區塊，而不是固定 0~2
        let castleFwKind = null
        if (this.mapData) {
          for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
              const cell = this.mapData[r]?.[c]
              if (cell && cell.type === 'castle') {
                const kind = String(cell.firewall || '').toLowerCase()
                if (kind) { castleFwKind = kind; break }
              }
            }
            if (castleFwKind) break
          }
        }
        if (castleFwKind) {
          const badge = this.createFirewallBadge(castleFwKind);
          if (this.connectionWorld) {
            const worldX = castleContainer.x;
            const worldY = castleContainer.y;
            const offsetX = this.tileSize * 0.15;
            const offsetY = -this.tileSize * 0.5;
            badge.x = worldX + offsetX;
            badge.y = worldY + offsetY;
            badge.zIndex = 999;
            this.connectionWorld.addChild(badge);
          } else {
            badge.x = this.tileSize * 0.15;
            badge.y = this.tileSize * 2;
            castleContainer.addChild(badge);
          }
          // 加入徽章動畫池（alpha 脈衝）
          this.firewallBadgeAnimations.push({
            time: Math.random() * 1.5,
            glowInner: badge.glowInner,
            glowOuter: badge.glowOuter
          })
        }
      }
    }

    // 第三階段：繪製其他建築
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.mapData[row]?.[col]
        
        if (cell && cell.status === 'placed' && cell.buildingId) {
          const x = (col - row) * halfW
          const y = (col + row) * halfH

          const buildingContainer = new PIXI.Container()
          buildingContainer.sortableChildren = true
          buildingContainer.x = x
          buildingContainer.y = y
          buildingContainer.zIndex = 5 // 建築容器層級高於玩家

          const buildingId = cell.buildingId
          const buildingTexture = this.buildingTextures[buildingId]
          
          if (buildingTexture) {
            const buildingSprite = new PIXI.Sprite(buildingTexture)
            buildingSprite.zIndex = 5
            
            const originalWidth = buildingTexture.width
            const originalHeight = buildingTexture.height
            const baseScale = Math.min(this.tileSize / originalWidth, this.tileSize / originalHeight)

            // 針對 router/switch 放大並微調位置
            const buildingStore = useBuildingStore()
            const matchedItem = (buildingStore.shopBuildings || []).find(b => b.id === buildingId)
            const bType = matchedItem?.type || 'host'
            const isRouter = bType === 'router'
            const isSwitch = bType === 'switch' 

            const sizeScale = isRouter ? 2.8 : (isSwitch ? 1.6 : 0.75)
            buildingSprite.width = originalWidth * baseScale * sizeScale
            buildingSprite.height = originalHeight * baseScale * sizeScale
            
            if (isRouter) {
              buildingSprite.anchor.set(0.56, 0.48)
            } else if (isSwitch) {
              buildingSprite.anchor.set(0.475, 0.65)
            }
            else {
              buildingSprite.anchor.set(0.5, 0.7)
            }
            
            buildingContainer.addChild(buildingSprite)

            // 疊加防火牆徽章（向量盾牌，不使用照片），需開啟顯示開關
            if (this.buildingStore?.showConnections && cell.firewall) {
              const kind = String(cell.firewall || '').toLowerCase();
              const fwBadge = this.createFirewallBadge(kind);
              // 若有連線世界，將徽章畫在連線層（高於蒙版）
          if (this.connectionWorld) {
            const badgeContainer = new PIXI.Container();
            badgeContainer.x = x + this.tileSize * 0.05;
            badgeContainer.y = y - this.tileSize * 0.35;
            badgeContainer.addChild(fwBadge);
            this.connectionWorld.addChild(badgeContainer);
          } else {
            fwBadge.x = this.tileSize * 0.05;
            fwBadge.y = -this.tileSize * 0.35;
            buildingContainer.addChild(fwBadge);
          }
              // 加入徽章動畫池（alpha 脈衝）
              this.firewallBadgeAnimations.push({
                time: Math.random() * 1.5,
                glowInner: fwBadge.glowInner,
                glowOuter: fwBadge.glowOuter
              })
            }
            this.objectContainer.addChild(buildingContainer)
          }
        }
      }
    }

    // 第四階段：繪製連線
    this.drawConnections();
  }

  /**
   * 繪製建築物之間的連線
   */
  drawConnections() {
    // 清除現有連線
    this.clearConnections();
    
    if (!this.buildingStore || !this.buildingStore.connections) {
      console.log('drawConnections: 沒有 buildingStore 或 connections');
      return;
    }
    
    // 檢查是否應該顯示連線
    if (!this.buildingStore.showConnections) {
      console.log('drawConnections: 連線已隱藏');
      return;
    }
    
    // 如果有選中的連線，只繪製該連線
    const selectedConnectionId = this.buildingStore.selectedConnectionId;
    const connectionsToDraw = selectedConnectionId 
      ? this.buildingStore.connections.filter(conn => conn.id === selectedConnectionId)
      : this.buildingStore.connections;
    
    if (connectionsToDraw.length === 0) {
      console.log('drawConnections: 沒有需要繪製的連線');
      return;
    }
    
    console.log('drawConnections: 開始繪製連線，共有', connectionsToDraw.length, '條連線', selectedConnectionId ? '(只顯示選中連線)' : '(顯示所有連線)');
    
    const halfW = this.tileSize / 2;
    const halfH = this.tileSize / 4;
    
    const resolveCellType = (cell) => {
      if (!cell) return null
      if (cell.buildingId) {
        return this.buildingStore.getBuildingType(cell.buildingId)
      }
      if (cell.type === 'castle') {
        return INTERNET_TOWER_TYPE
      }
      return null
    }

    connectionsToDraw.forEach((connection, index) => {
      // 計算起始和結束位置的等角座標
      const fromX = (connection.from.x - connection.from.y) * halfW;
      const fromY = (connection.from.x + connection.from.y) * halfH;
      const toX = (connection.to.x - connection.to.y) * halfW;
      const toY = (connection.to.x + connection.to.y) * halfH;
      
      console.log(`連線 ${index}:`, {
        from: connection.from,
        to: connection.to,
        fromScreen: { x: fromX, y: fromY },
        toScreen: { x: toX, y: toY }
      });
      
      // 獲取連線顏色
      let connectionColor = 0x00ff00; // 預設綠色
      if (this.buildingStore.map && 
          this.buildingStore.map[connection.from.y] && 
          this.buildingStore.map[connection.from.y][connection.from.x] &&
          this.buildingStore.map[connection.to.y] && 
          this.buildingStore.map[connection.to.y][connection.to.x]) {
        const fromCell = this.buildingStore.map[connection.from.y][connection.from.x];
        const toCell = this.buildingStore.map[connection.to.y][connection.to.x];
        const fromType = resolveCellType(fromCell);
        const toType = resolveCellType(toCell);
        if (fromType && toType) {
          connectionColor = getConnectionColor(fromType, toType);
        }
      }
      
      // 創建多層發光效果（外層、中層、內層）讓發光更明顯
      // 外層發光（最寬、最淡）
      const glowOuter = new PIXI.Graphics();
      glowOuter
        .moveTo(fromX, fromY)
        .lineTo(toX, toY)
        .stroke({ width: 28, color: connectionColor, alpha: 0.2 });
      glowOuter.zIndex = 150; // 確保在蒙版（z-index: 50）上方
      glowOuter.visible = true;
      
      // 中層發光（中等寬度）
      const glowMiddle = new PIXI.Graphics();
      glowMiddle
        .moveTo(fromX, fromY)
        .lineTo(toX, toY)
        .stroke({ width: 20, color: connectionColor, alpha: 0.4 });
      glowMiddle.zIndex = 151; // 確保在蒙版上方
      glowMiddle.visible = true;
      
      // 內層發光（較窄、較亮，會動畫）
      const glowInner = new PIXI.Graphics();
      glowInner
        .moveTo(fromX, fromY)
        .lineTo(toX, toY)
        .stroke({ width: 14, color: connectionColor, alpha: 0.5 });
      glowInner.zIndex = 152; // 確保在蒙版上方
      glowInner.visible = true;
      
      // 創建主線（稍微加粗）
      const connectionLine = new PIXI.Graphics();
      connectionLine
        .moveTo(fromX, fromY)
        .lineTo(toX, toY)
        .stroke({ width: 6, color: connectionColor, alpha: 1.0 }); // 稍微加粗主線
      connectionLine.zIndex = 153; // 確保在蒙版（z-index: 50）上方
      connectionLine.visible = true;
      
      // 添加到連線容器（如果有獨立連線層，則添加到連線世界，否則添加到對象容器）
      const targetContainer = this.connectionWorld || this.objectContainer;
      targetContainer.addChild(glowOuter);
      targetContainer.addChild(glowMiddle);
      targetContainer.addChild(glowInner);
      targetContainer.addChild(connectionLine);
      
      // 儲存連線引用以便後續清除
      if (!this.connectionLines) {
        this.connectionLines = [];
      }
      if (!this.connectionGlowLayers) {
        this.connectionGlowLayers = [];
      }
      if (!this.connectionAnimations) {
        this.connectionAnimations = [];
      }
      
      // 儲存連線圖形和所有發光層
      this.connectionLines.push(connectionLine);
      this.connectionGlowLayers.push(glowOuter, glowMiddle, glowInner);
      
      // 儲存動畫參數（讓內層發光層動畫，alpha從0.5到1.0，更明顯）
      this.connectionAnimations.push({
        time: Math.random() * 1.5, // 隨機起始時間，讓連線不同步
        glowInner: glowInner,
        glowMiddle: glowMiddle, // 中層也稍微動畫
        glowOuter: glowOuter // 外層也稍微動畫
      });
    });
    
    console.log('drawConnections: 完成繪製，共繪製', this.connectionLines.length, '條連線');
  }

  /**
   * 清除所有連線
   */
  clearConnections() {
    if (this.connectionLines) {
      this.connectionLines.forEach(line => {
        if (line.parent) {
          line.parent.removeChild(line);
        }
      });
      this.connectionLines = [];
    }
    
    // 清除發光層
    if (this.connectionGlowLayers) {
      this.connectionGlowLayers.forEach(glow => {
        if (glow.parent) {
          glow.parent.removeChild(glow);
        }
      });
      this.connectionGlowLayers = [];
    }
    
    // 清除動畫參數
    if (this.connectionAnimations) {
      this.connectionAnimations = [];
    }
  }
  
  /**
   * 啟動連線發光動畫（類似successGlow效果）
   */
  startConnectionGlowAnimation() {
    // 選擇使用主應用或連線應用的ticker
    const appToUse = this.connectionApp || this.app;
    
    // 如果已經有ticker，先移除
    if (this.connectionGlowTicker && appToUse.ticker) {
      appToUse.ticker.remove(this.connectionGlowTicker);
    }
    
    // 創建綁定的更新函數
    this.connectionGlowTicker = this.updateConnectionGlow.bind(this);
    
    // 使用PIXI的Ticker來更新動畫
    if (appToUse.ticker) {
      appToUse.ticker.add(this.connectionGlowTicker);
    }
  }
  
  /**
   * 更新連線發光動畫
   * 類似successGlow動畫：1.5秒循環，發光強度從0.3到0.8
   */
  updateConnectionGlow() {
    const hasConn = this.connectionAnimations && this.connectionAnimations.length > 0
    const hasBadges = this.firewallBadgeAnimations && this.firewallBadgeAnimations.length > 0
    if (!hasConn && !hasBadges) return
    
    // 選擇使用主應用或連線應用的ticker
    const appToUse = this.connectionApp || this.app;
    
    // PIXI ticker的deltaTime已經是按幀的，需要轉換為秒
    // deltaTime是基於60fps的，所以除以60得到秒
    const deltaTime = appToUse.ticker.deltaTime / 60; // 轉換為秒（假設60fps）
    const animationDuration = 1.5; // 1.5秒循環（與successGlow相同）
    
    this.connectionAnimations.forEach(anim => {
      // 更新時間
      anim.time += deltaTime;
      if (anim.time >= animationDuration) {
        anim.time -= animationDuration;
      }
      
      // 計算動畫進度（0到1）
      const progress = anim.time / animationDuration;
      
      const pulseValue = (Math.sin(progress * Math.PI * 2) + 1) / 2; // 0 到 1
      
      // 更新內層發光（最明顯）
      if (anim.glowInner && anim.glowInner.visible) {
        const innerAlpha = 0.5 + (1.0 - 0.5) * pulseValue;
        anim.glowInner.alpha = innerAlpha;
      }
      
      // 更新中層發光（中等明顯）
      if (anim.glowMiddle && anim.glowMiddle.visible) {
        const middleAlpha = 0.4 + (0.7 - 0.4) * pulseValue;
        anim.glowMiddle.alpha = middleAlpha;
      }
      
      // 更新外層發光（較弱但保持可見）
      if (anim.glowOuter && anim.glowOuter.visible) {
        const outerAlpha = 0.2 + (0.4 - 0.2) * pulseValue;
        anim.glowOuter.alpha = outerAlpha;
      }
    });

    // 更新防火牆徽章光暈（使用 alpha 脈衝）
    this.firewallBadgeAnimations.forEach(anim => {
      anim.time += deltaTime;
      if (anim.time >= animationDuration) anim.time -= animationDuration;
      const progress = anim.time / animationDuration;
      const pulseValue = (Math.sin(progress * Math.PI * 2) + 1) / 2;

      if (anim.glowInner) {
        anim.glowInner.alpha = 0.88 + (1.00 - 0.88) * pulseValue;
      }
      if (anim.glowOuter) {
        anim.glowOuter.alpha = 0.40 + (0.85 - 0.40) * pulseValue;
      }
    })
  }

  /**
   * 檢查玩家是否碰到城堡
   * @param {number} playerX - 玩家 X 座標
   * @param {number} playerY - 玩家 Y 座標
   * @returns {boolean} 是否碰到城堡
   */
  checkCastleCollision(playerX, playerY) {
    const halfW = this.tileSize / 2
    const halfH = this.tileSize / 4
    
    // 將等角座標轉換為網格座標
    const cartX = (playerX / halfW + playerY / halfH) / 2
    const cartY = (playerY / halfH - playerX / halfW) / 2
    
    // 四捨五入取得整數網格座標
    const col = Math.round(cartX)
    const row = Math.round(cartY)
    
    // 檢查是否在城堡區域內
    return isCastleTile(row, col)
  }

  /**
   * 當玩家碰到城堡時，將城堡圖片替換為 can1.png（僅替換 castle0.png 層）
   */
  async replaceCastleWithCan1() {
    if (!this.castleContainer) {
      console.warn('⚠️ 城堡容器不存在，無法替換圖片')
      return
    }
    
    // 如果 can1 紋理還沒載入，嘗試載入它
    if (!this.castleTextures || !this.castleTextures['can1']) {
      console.log('🔄 can1.png 紋理尚未載入，正在載入...')
      try {
        if (!this.castleTextures) {
          this.castleTextures = {}
        }
        this.castleTextures['can1'] = await PIXI.Assets.load(can1Img)
        console.log('✅ can1.png 紋理載入成功')
      } catch (e) {
        console.warn('⚠️ can1.png 載入失敗，使用後備方案:', e)
        this.castleTextures['can1'] = PIXI.Texture.from(can1Img)
      }
    }
    
    // 再次檢查紋理是否存在
    if (!this.castleTextures['can1']) {
      console.error('❌ can1.png 紋理載入失敗，無法替換城堡圖片')
      return
    }
    
    // 只在第一次碰到時播放音效
    if (!this.castleHit) {
      this.castleHit = true
      console.log('🏰 玩家碰到城堡！將 castle0.png 替換為 can1.png')
      // 播放門開啟音效（前0.5秒）
      audioService.playDoorOpenSound()
    }
    
    // ⭐ 重點：每次都執行圖片更新（移到判斷外面）
    // 清除現有的城堡層級
    this.castleContainer.removeChildren()
    
    const wallStore = useWallStore()
    const castleLevel = wallStore.castleLevel || 0
    
    // 重新繪製城堡，但將第0層替換為 can1.png
    for (let level = 0; level <= castleLevel; level++) {
      let texture
      
      if (level === 0) {
        // 第0層使用 can1.png
        texture = this.castleTextures['can1']
      } else {
        // 其他層級使用原本的城堡圖片
        texture = this.castleTextures[level]
      }
      
      if (texture) {
        const castleLayer = new PIXI.Sprite(texture)
        castleLayer.eventMode = 'none'
        castleLayer.anchor.set(0.5, 0.55)
        const castleScale = 2.5
        castleLayer.width = this.tileSize * 3 * castleScale
        castleLayer.height = this.tileSize * 2 * castleScale
        castleLayer.zIndex = 5 + level
        
        if (level > 0) {
          castleLayer.y = -level * 112
        }
        this.castleContainer.addChild(castleLayer)
      }
    }
    
    console.log('✅ 城堡第0層已替換為 can1.png')
  }

  /**
   * 繪製城堡（用於重置時）
   */
  drawCastle() {
    if (!this.castleContainer || !this.castleTextures) {
      return
    }
    
    const wallStore = useWallStore()
    const castleLevel = wallStore.castleLevel || 0
    
    // 繪製城堡層級（從基礎層到當前等級）
    for (let level = 0; level <= castleLevel; level++) {
      if (this.castleTextures[level]) {
        const castleLayer = new PIXI.Sprite(this.castleTextures[level])
        castleLayer.eventMode = 'none'
        castleLayer.anchor.set(0.5, 0.55)
        const castleScale = 2.5
        castleLayer.width = this.tileSize * 3 * castleScale
        castleLayer.height = this.tileSize * 2 * castleScale
        castleLayer.zIndex = 5 + level // 每層級增加 zIndex，確保正確疊加
        
        // 讓上層稍微偏移，營造疊加效果
        if (level > 0) {
          // Y軸稍微向上偏移（讓上層看起來更高）
          castleLayer.y = -level * 112
        }
        this.castleContainer.addChild(castleLayer)
      }
    }
  }

  /**
   * 重置城堡圖片為原始狀態（當玩家離開城堡時）
   */
  resetCastleImage() {
    if (!this.castleHit || !this.castleContainer) {
      return
    }
    
    this.castleHit = false
    console.log('🏰 玩家離開城堡，重置城堡圖片為原始狀態')
    
    // 播放門關閉音效（後0.5秒）
    audioService.playDoorCloseSound()
    
    // 清除現有的城堡層級
    this.castleContainer.removeChildren()
    
    // 重新繪製原始城堡
    this.drawCastle()
  }

  /**
   * 銷毀 IsoGrid 資源，釋放記憶體
   */
  destroy() {
    // 不銷毀紋理資源，保留緩存以便重新進入時使用
    // 只清空引用
    this.buildingTextures = null;
    this.grassTextures = null;
    this.landTexture = null;
    this.castleTextures = null;

    // 清理容器，但保留紋理
    if (this.groundContainer) {
      this.groundContainer.destroy({ children: true, texture: false, baseTexture: false });
      this.groundContainer = null;
    }

    if (this.objectContainer) {
      this.objectContainer.destroy({ children: true, texture: false, baseTexture: false });
      this.objectContainer = null;
    }

    if (this.gridContainer) {
      this.gridContainer.destroy({ children: true, texture: false, baseTexture: false });
      this.gridContainer = null;
    }

    // 清理引用
    this.app = null;
    this.onTileClick = null;
    this.mapData = null;
    this.selectedTile = null;
  }
}
