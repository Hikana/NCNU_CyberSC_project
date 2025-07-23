import * as PIXI from 'pixi.js'

const TILE_SIZE = 64
const MAP_SIZE = 21
const CENTER = Math.floor(MAP_SIZE / 2)

function toIsometric(x, y) {
  const isoX = (x - y) * (TILE_SIZE / 2)
  const isoY = (x + y) * (TILE_SIZE / 4)
  return { x: isoX, y: isoY }
}

export function createMap(mapContainer) {
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let y = 0; y < MAP_SIZE; y++) {
      const tile = new PIXI.Graphics()
      const iso = toIsometric(x - CENTER, y - CENTER)
      const tileX = iso.x
      const tileY = iso.y
      
      const distanceFromCenter = Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER))
      let color
      let alpha = 1
      
      if (distanceFromCenter === 0) {
        // 城堡 (中心)
        color = 0xf1c40f
        tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
          .fill({color, alpha})
          .stroke({ width: 3, color: 0xe67e22 })

        const castleText = new PIXI.Text({
          text: '🏰',
          style: {
            fontSize: 32,
            fill: 0x8b4513,
            fontFamily: 'Arial'
          }
        })
        castleText.anchor.set(0.5)
        castleText.position.set(TILE_SIZE / 2, TILE_SIZE / 2)
        tile.addChild(castleText)

      } else if (distanceFromCenter <= 2) {
        // CIA 區域
        color = 0x27ae60
        tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
          .fill({color, alpha})

        if (distanceFromCenter === 1) {
          tile.stroke({ width: 4, color: 0x1e8449 })

          const wallText = new PIXI.Text({
            text: 'CIA',
            style: {
              fontSize: 12,
              fill: 0xffffff,
              fontWeight: 'bold',
              fontFamily: 'Arial'
            }
          })
          wallText.anchor.set(0.5)
          wallText.position.set(TILE_SIZE / 2, TILE_SIZE / 2)
          tile.addChild(wallText)
        } else {
          const buildText = new PIXI.Text({
            text: '🏗️',
            style: {
              fontSize: 20,
              fontFamily: 'Arial'
            }
          })
          buildText.anchor.set(0.5)
          buildText.position.set(TILE_SIZE / 2, TILE_SIZE / 2)
          tile.addChild(buildText)
        }

      } else if (distanceFromCenter <= 6) {
        // OWASP 區域
        color = 0x3498db
        alpha = 0.8
        tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
          .fill({color, alpha})

        if (distanceFromCenter === 6) {
          tile.stroke({ width: 3, color: 0x2980b9 })

          const owaspText = new PIXI.Text({
            text: 'OWASP',
            style: {
              fontSize: 10,
              fill: 0xffffff,
              fontWeight: 'bold',
              fontFamily: 'Arial'
            }
          })
          owaspText.anchor.set(0.5)
          owaspText.position.set(TILE_SIZE / 2, TILE_SIZE / 2)
          tile.addChild(owaspText)
        }

      } else {
        // 未知區域
        color = 0x34495e
        alpha = 0.6
        tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
          .fill({color, alpha})

        const unknownText = new PIXI.Text({
          text: '?',
          style: {
            fontSize: 24,
            fill: 0x95a5a6,
            fontFamily: 'Arial'
          }
        })
        unknownText.anchor.set(0.5)
        unknownText.position.set(TILE_SIZE / 2, TILE_SIZE / 2)
        tile.addChild(unknownText)
      }

      tile.x = tileX
      tile.y = tileY
      mapContainer.addChild(tile)
    }
  }

  return mapContainer
}
