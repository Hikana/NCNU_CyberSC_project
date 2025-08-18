import * as PIXI from 'pixi.js';

const TILE_SIZE = 64;
const MAP_SIZE = 21;
const CENTER = Math.floor(MAP_SIZE / 2);

export class GameMap {
  _toIsometric(x, y) {
    const isoX = (x - y) * (TILE_SIZE / 2);
    const isoY = (x + y) * (TILE_SIZE / 4);
    return { x: isoX, y: isoY };
  }

  render(container, onTileClick) {
    const mapContainer = new PIXI.Container();
    for (let x = 0; x < MAP_SIZE; x++) {
      for (let y = 0; y < MAP_SIZE; y++) {
        const tile = new PIXI.Graphics();
        const iso = this._toIsometric(x - CENTER, y - CENTER);
        const distanceFromCenter = Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER));
        
        tile.eventMode = 'static';
        tile.cursor = 'pointer';
        tile.on('pointerdown', () => onTileClick({ x, y, distanceFromCenter }));
        
        // --- 繪圖邏輯 (與你提供的一致) ---
        let color, alpha = 1;
        if (distanceFromCenter === 0) {
            color = 0xf1c40f;
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({color, alpha}).stroke({ width: 3, color: 0xe67e22 });
            const castleText = new PIXI.Text({ text: '🏰', style: { fontSize: 32, fill: 0x8b4513 }});
            castleText.anchor.set(0.5);
            castleText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
            tile.addChild(castleText);
        } else if (distanceFromCenter <= 2) {
            color = 0x27ae60;
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({color, alpha});
            if (distanceFromCenter === 1) {
                tile.stroke({ width: 4, color: 0x1e8449 });
                const wallText = new PIXI.Text({ text: 'CIA', style: { fontSize: 12, fill: 0xffffff, fontWeight: 'bold' }});
                wallText.anchor.set(0.5);
                wallText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
                tile.addChild(wallText);
            } else {
                const buildText = new PIXI.Text({ text: '🏗️', style: { fontSize: 20 }});
                buildText.anchor.set(0.5);
                buildText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
                tile.addChild(buildText);
            }
        } else if (distanceFromCenter <= 6) {
            color = 0x3498db;
            alpha = 0.8;
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({color, alpha});
            if (distanceFromCenter === 6) {
                tile.stroke({ width: 3, color: 0x2980b9 });
                const owaspText = new PIXI.Text({ text: 'OWASP', style: { fontSize: 10, fill: 0xffffff, fontWeight: 'bold' }});
                owaspText.anchor.set(0.5);
                owaspText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
                tile.addChild(owaspText);
            }
        } else {
            color = 0x34495e;
            alpha = 0.6;
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({color, alpha});
            const unknownText = new PIXI.Text({ text: '?', style: { fontSize: 24, fill: 0x95a5a6 }});
            unknownText.anchor.set(0.5);
            unknownText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
            tile.addChild(unknownText);
        }
        
        tile.position.set(iso.x, iso.y);
        mapContainer.addChild(tile);
      }
    }
    container.addChild(mapContainer);
  }
}