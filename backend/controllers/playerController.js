// backend/controllers/playerController.js
const playerService = require('../services/playerService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class PlayerController {
  getInventory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const items = await playerService.getInventory(id);
    res.status(200).json({ success: true, data: items });
  });

  setInventory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;
    const saved = await playerService.setInventory(id, items || []);
    res.status(200).json({ success: true, data: saved });
  });
}

module.exports = new PlayerController();


