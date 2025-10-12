const { db, admin } = require('../config/firebase');

exports.getInventory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.uid;
    const invSnap = await db.collection('players')
                          .doc(userId)
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
    const userId = req.params.userId || req.user.uid;
    const { templateId, amount = 1 } = req.body;
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    const invDocRef = db.collection('players').doc(userId).collection('inventory').doc(templateId);
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
      const hRef = db.collection('players').doc(userId).collection('history').doc();
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
    const userId = req.params.userId || req.user.uid;
    const { templateId, amount = 1 } = req.body;
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    const invDocRef = db.collection('players').doc(userId).collection('inventory').doc(templateId);

    const result = await db.runTransaction(async (tx) => {
      const invDoc = await tx.get(invDocRef);
      if (!invDoc.exists) throw new Error('item not found');
      const curQty = invDoc.data().qty || 0;
      if (curQty < amount) throw new Error('not enough qty');
      const newQty = curQty - amount;
      if (newQty > 0) tx.update(invDocRef, { qty: newQty });
      else tx.delete(invDocRef);

      // add history
      const hRef = db.collection('players').doc(userId).collection('history').doc();
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

// 使用防禦工具
exports.useDefenseTool = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { toolId } = req.body;
    
    if (!toolId) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少 toolId 參數' 
      });
    }

    console.log(`🛡️ 收到使用防禦工具請求: 玩家=${userId}, 工具=${toolId}`);

    const inventoryService = require('../services/inventoryService');
    const result = await inventoryService.useDefenseTool(userId, toolId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Controller 使用防禦工具失敗:', error);
    res.status(400).json({
      success: false,
      error: error.message || '使用防禦工具失敗'
    });
  }
};