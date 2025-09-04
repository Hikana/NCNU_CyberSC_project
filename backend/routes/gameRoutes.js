const express = require('express')
const router = express.Router()

// 測試端點
router.get('/ping', (req, res) => {
  res.json({ msg: 'pong' })
})

// 遊戲狀態端點
router.get('/game/status', (req, res) => {
  res.json({ status: 'running', message: '遊戲服務器正在運行' })
})

// 導出路由
module.exports = router