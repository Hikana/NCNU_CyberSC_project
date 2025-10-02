// backend/services/playerService.js
const playerData = require('../models/playerData');

class PlayerService {
  async getInventory(userId) {
    return playerData.getInventory(userId);
  }
  async setInventory(userId, items) {
    return playerData.setInventory(userId, items);
  }
  async getPlayer(userId){
    return playerData.getPlayer(userId);
  }
}

module.exports = new PlayerService();


