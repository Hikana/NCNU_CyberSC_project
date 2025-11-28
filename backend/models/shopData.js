const { db, FieldValue } = require('../config/firebase');

const SHOP_COLLECTION = 'shop';

class ShopData {
  constructor() {
    this.collectionRef = db.collection(SHOP_COLLECTION);
    this.cache = new Map();
    this.cacheReady = false;
    this.cachePromise = null;
  }

  async ensureCacheLoaded() {
    if (this.cacheReady) return;
    if (this.cachePromise) {
      await this.cachePromise;
      return;
    }
    this.cachePromise = this.collectionRef.orderBy('id').get().then(snapshot => {
      this.cache.clear();
      snapshot.docs.forEach(doc => {
        const data = { id: doc.data().id, ...doc.data() };
        this.cache.set(data.id, data);
      });
      this.cacheReady = true;
    }).finally(() => {
      this.cachePromise = null;
    });
    await this.cachePromise;
  }

  async getAllItems() {
    await this.ensureCacheLoaded();
    return Array.from(this.cache.values());
  }

  async getById(id) {
    await this.ensureCacheLoaded();
    return this.cache.get(id) || null;
  }

  async setItems(items) {
    const batch = db.batch();
    items.forEach((item) => {
      const docRef = this.collectionRef.doc(String(item.id));
      batch.set(docRef, { ...item, updatedAt: FieldValue.serverTimestamp() });
      this.cache.set(item.id, { ...item });
    });
    await batch.commit();
    this.cacheReady = true;
  }
}

module.exports = new ShopData();


