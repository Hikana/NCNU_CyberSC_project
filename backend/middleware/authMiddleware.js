// backend/middlewares/authMiddleware.js
const admin = require('firebase-admin');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: '缺少 Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '缺少 Token' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // 存放解碼後的使用者資訊（包含 uid, email）
    next();
  } catch (err) {
    console.error('❌ Token 驗證失敗:', err.message);
    res.status(401).json({ success: false, message: '無效的 Token' });
  }
}

module.exports = verifyToken;
