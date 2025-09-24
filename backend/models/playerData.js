// backend/models/playerData.js
const { db, FieldValue } = require('../routes/firebase');

class PlayerData {
  constructor() {
    this.collection = db.collection('players');
  }

  async getInventory(userId) {
    if (!userId) throw new Error('缺少 userId');
    const docRef = this.collection.doc(userId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return [];
    }
    const data = snap.data() || {};
    return Array.isArray(data.backpack) ? data.backpack : [];
  }

  async setInventory(userId, items) {
    if (!userId) throw new Error('缺少 userId');
    if (!Array.isArray(items)) throw new Error('items 必須為陣列');
    const docRef = this.collection.doc(userId);
    await docRef.set({ backpack: items, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return items;
  }
}

module.exports = new PlayerData();


