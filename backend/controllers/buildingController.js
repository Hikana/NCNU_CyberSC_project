const buildingService = require('../services/buildingService');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class BuildingController {
  getMap = asyncHandler(async (req, res) => {
    const mapData = await buildingService.getMapState();
    res.status(200).json({ success: true, map: mapData });
  });
  placeBuilding = asyncHandler(async (req, res) => {
    const { buildingId, position } = req.body;
    try {
      const updatedMap = await buildingService.placeBuilding(buildingId, position);
      res.status(200).json({ success: true, map: updatedMap });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
}
module.exports = new BuildingController();