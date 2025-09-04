import { Application, Container } from 'pixi.js';
import { IsoGrid } from './IsoGrid';

export async function createPixiApp(container, mapData = null) {
  const app = new Application();
  
  // 確保容器已渲染並有尺寸
  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width || window.innerWidth;
  const height = containerRect.height || window.innerHeight;

  await app.init({
    width: width,
    height: height,
    backgroundColor: 0xf0f0f0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  container.appendChild(app.canvas);

  // 監聽視窗大小變化
  const handleResize = () => {
    const newRect = container.getBoundingClientRect();
    const newWidth = newRect.width || window.innerWidth;
    const newHeight = newRect.height || window.innerHeight;
    app.renderer.resize(newWidth, newHeight);

    // 重新調整世界容器位置
    worldContainer.x = newWidth / 2
    worldContainer.y = newHeight / 2 - 100 // 調整 Y 軸位置以適應等角視圖
  };
  
  window.addEventListener('resize', handleResize);

  // 創建容器層級
  const worldContainer = new Container();
  const mapContainer = new Container();
  const playerContainer = new Container();

  worldContainer.addChild(mapContainer);
  worldContainer.addChild(playerContainer);
  app.stage.addChild(worldContainer);

  // 將世界容器移動到螢幕中心 (統一在這裡處理定位)
  worldContainer.x = width / 2
  worldContainer.y = height / 2 - 100 // 稍微向上偏移

  // 初始化等角網格，傳入地圖數據
  const grid = new IsoGrid(app, 20, 20, 120, null, mapData); 

  // 把網格容器移到 worldContainer（很關鍵）
  app.stage.removeChild(grid.gridContainer);
  worldContainer.addChildAt(grid.gridContainer, 0);

  // 明確啟用 zIndex 並設定繪製層級，確保 player 顯示在地圖上方
  worldContainer.sortableChildren = true;
  grid.gridContainer.zIndex = 1;      // 地圖置底
  mapContainer.zIndex = 2;            // 其他地圖元素（預留）
  playerContainer.zIndex = 10;        // 玩家置頂

  return { 
    app, 
    mapContainer, 
    playerContainer, 
    worldContainer,
    grid,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true);
    }
  };
}
