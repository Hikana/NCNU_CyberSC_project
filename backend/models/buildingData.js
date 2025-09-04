const { db } = require('../config/firebase');

const MAP_COLLECTION = 'gamemap';
const MAP_DOC_ID = 'main_world';

class BuildingData {
  constructor() {
    this.mapDocRef = db.collection(MAP_COLLECTION).doc(MAP_DOC_ID);
  }
  async getMap() {
    const doc = await this.mapDocRef.get();
    if (!doc.exists) {
      const newMap = Array.from({ length: 20 }, () => Array(20).fill({ type: 'empty' }));
      await this.mapDocRef.set({ tiles: newMap });
      return newMap;
    }
    return doc.data().tiles;
  }
  async updateMap(newMap) {
    return this.mapDocRef.update({ tiles: newMap });
  }
}
module.exports = new BuildingData();