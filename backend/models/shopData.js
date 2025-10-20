const { db, FieldValue } = require('../config/firebase');

const SHOP_COLLECTION = 'shop';

class ShopData {
  constructor() {
    this.collectionRef = db.collection(SHOP_COLLECTION);
  }

  async getAllItems() {
    const snapshot = await this.collectionRef.orderBy('id').get();
    return snapshot.docs.map((doc) => ({ id: doc.data().id, ...doc.data() }));
  }

  async getById(id) {
    const query = await this.collectionRef.where('id', '==', id).limit(1).get();
    if (query.empty) return null;
    return { id: query.docs[0].data().id, ...query.docs[0].data() };
  }

  async setItems(items) {
    const batch = db.batch();
    items.forEach((item) => {
      // use a deterministic doc id, e.g., item id as string
      const docRef = this.collectionRef.doc(String(item.id));
      batch.set(docRef, { ...item, updatedAt: FieldValue.serverTimestamp() });
    });
    await batch.commit();
  }
}

module.exports = new ShopData();


