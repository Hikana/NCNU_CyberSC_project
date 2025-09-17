const buildingData = require('../models/buildingData');

class BuildingService {
  async getMapState() {
    return buildingData.getMap();
  }
  async placeBuilding(buildingId, position) {
    const map = await buildingData.getMap();
    if (position.y < 0 || position.y >= 20 || position.x < 0 || position.x >= 20) {
      throw new Error('位置超出地圖範圍');
    }
    if (map[position.y][position.x].type !== 'empty') {
      throw new Error('此位置已被佔用');
    }
    map[position.y][position.x] = { type: 'building', buildingId };
    await buildingData.updateMap(map);
    return map;
  }

  async clearAllBuildings() {
    const emptyMap = Array.from({ length: 20 }, () =>
      Array.from({ length: 20 }, () => ({ type: 'empty' }))
    );
    await buildingData.updateMap(emptyMap);
    return emptyMap;
  }
}
module.exports = new BuildingService();