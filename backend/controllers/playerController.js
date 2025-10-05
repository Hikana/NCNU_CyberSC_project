const playerService = require('../services/playerService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class PlayerController {
  // 取得玩家資料
  getPlayer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const playerData = await playerService.getPlayer(id);
    res.status(200).json({ success: true, data: playerData });
  });

  // 更新玩家科技點
  updateTechPoints = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { techPoints } = req.body;
    const updated = await playerService.updateTechPoints(id, techPoints);
    res.status(200).json({ success: true, data: updated });
  });

  // 更新玩家防禦值
  updateDefense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { defense } = req.body;
    const updated = await playerService.updateDefense(id, defense);
    res.status(200).json({ success: true, data: updated });
  });

  // 更新玩家城堡等級
  updateCastleLevel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { castleLevel } = req.body;
    const updated = await playerService.updateCastleLevel(id, castleLevel);
    res.status(200).json({ success: true, data: updated });
  });

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

  // --- 成就系統 API ---
  
  // 取得所有成就
  getAchievements = asyncHandler(async (req, res) => {
    const achievements = await playerService.getAchievements();
    res.status(200).json({ success: true, data: achievements });
  });

  // 取得玩家成就進度
  getPlayerAchievements = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const achievements = await playerService.getPlayerAchievements(id);
    res.status(200).json({ success: true, data: achievements });
  });

  // 更新玩家成就狀態（領取獎勵）
  updatePlayerAchievement = asyncHandler(async (req, res) => {
    const { id, achievementId } = req.params;
    const { status, progress } = req.body;
    
    console.log(`🔄 更新成就狀態: 玩家=${id}, 成就=${achievementId}, 狀態=${status}, 進度=${progress}`);
    
    try {
      const updated = await playerService.updatePlayerAchievement(id, achievementId, { status, progress });
      console.log(`✅ 成就狀態更新成功:`, updated);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error(`❌ 成就狀態更新失敗:`, error);
      throw error;
    }
  });

  // 檢查並更新成就進度
  checkAchievements = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { gameStats } = req.body; // { answeredCount, itemCount, developedCount, eventCount }
    const updatedAchievements = await playerService.checkAchievements(id, gameStats);
    res.status(200).json({ success: true, data: updatedAchievements });
  });
}

module.exports = new PlayerController();


