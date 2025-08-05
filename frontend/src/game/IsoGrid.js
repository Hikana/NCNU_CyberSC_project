import * as PIXI from 'pixi.js';

export class IsoGrid {
  constructor(app, rows = 10, cols = 10, tileSize = 64) {
    this.app = app;
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;
    this.gridContainer = new PIXI.Container();
    this.app.stage.addChild(this.gridContainer);
  }

  drawGrid() {
    const halfW = this.tileSize / 2;
    const halfH = this.tileSize / 4;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = (col - row) * halfW + this.app.screen.width / 2;
        const y = (col + row) * halfH + 100;

        const tile = new PIXI.Graphics();
        tile.lineStyle(1, 0xcccccc, 0.6);
        tile.beginFill(0xffffff, 0); // 中心透明
        tile.moveTo(0, -halfH);
        tile.lineTo(halfW, 0);
        tile.lineTo(0, halfH);
        tile.lineTo(-halfW, 0);
        tile.lineTo(0, -halfH);
        tile.endFill();
        tile.x = x;
        tile.y = y;

        this.gridContainer.addChild(tile);
      }
    }
  }
}
