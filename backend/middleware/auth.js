const { admin } = require('../config/firebase');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.*)$/);
  if (!match) return res.status(401).json({ error: 'No token' });
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // contains uid, email, ...
    next();
  } catch (err) {
    console.error('verifyIdToken failed', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
