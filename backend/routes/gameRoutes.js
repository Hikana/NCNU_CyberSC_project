router.get('/ping', (req, res) => {
  res.json({ msg: 'pong' })
})