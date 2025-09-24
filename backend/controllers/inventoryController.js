const { db, admin } = require('../firebase/admin');



exports.getInventory = async (req, res) => {
  try {
    const playerId = req.params.playerId || req.user.uid;
    const invSnap = await db.collection('players')
                          .doc(playerId)
                          .collection('inventory')
                          .get();
    const items = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'getInventory failed' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const playerId = req.params.playerId || req.user.uid;
    const { templateId, amount = 1 } = req.body;
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    const invDocRef = db.collection('players').doc(playerId).collection('inventory').doc(templateId);
    const templateRef = db.collection('itemTemplates').doc(templateId);

    // transaction: 如果已存在就增加 qty，不存在就建立並從模板帶入 name/type/defense
    await db.runTransaction(async (tx) => {
      const invDoc = await tx.get(invDocRef);
      if (!invDoc.exists) {
        const tmpl = (await tx.get(templateRef)).data() || {};
        tx.set(invDocRef, {
          templateId,
          name: tmpl.name || templateId,
          qty: amount,
          defenseValue: tmpl.defenseValue || 0,
          meta: tmpl.meta || {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        tx.update(invDocRef, { qty: admin.firestore.FieldValue.increment(amount) });
      }
      // optional: push to history
      const hRef = db.collection('players').doc(playerId).collection('history').doc();
      tx.set(hRef, {
        type: 'inventory_add',
        templateId,
        amount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'addItem failed' });
  }
};

exports.useItem = async (req, res) => {
  try {
    const playerId = req.params.playerId || req.user.uid;
    const { templateId, amount = 1 } = req.body;
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    const invDocRef = db.collection('players').doc(playerId).collection('inventory').doc(templateId);

    const result = await db.runTransaction(async (tx) => {
      const invDoc = await tx.get(invDocRef);
      if (!invDoc.exists) throw new Error('item not found');
      const curQty = invDoc.data().qty || 0;
      if (curQty < amount) throw new Error('not enough qty');
      const newQty = curQty - amount;
      if (newQty > 0) tx.update(invDocRef, { qty: newQty });
      else tx.delete(invDocRef);

      // add history
      const hRef = db.collection('players').doc(playerId).collection('history').doc();
      tx.set(hRef, {
        type: 'inventory_use',
        templateId,
        amount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { templateId, used: amount };
    });

    res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'useItem failed' });
  }
};
