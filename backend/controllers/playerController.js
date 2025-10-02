// backend/controllers/playerController.js
const playerService = require('../services/playerService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class PlayerController {
  getInventory = asyncHandler(async (req, res) => {
    const userId = req.user.uid; // ✅ 使用 Firebase UID
    const items = await playerService.getInventory(userId);
    res.status(200).json({ success: true, data: items });
  });

  setInventory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { items } = req.body;
    const saved = await playerService.setInventory(userId, items || []);
    res.status(200).json({ success: true, data: saved });
  });
  getPlayer = asyncHandler(async (req, res) => {
    const userId = req.user.uid; // ✅ 使用 Firebase UID
    const player=await playerService.getPlayer(userId); 
    res.status(200).json({ success: true, data: player });
  });

}

module.exports = new PlayerController();
