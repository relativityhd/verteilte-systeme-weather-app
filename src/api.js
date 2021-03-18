const express = require('express')
const router = express.Router()

router.get('/recommend', (req, res) => {
  const lat = req.query.lat
  const lon = req.query.lon
  res.send(`lat=${lat}\nlon=${lon}`)
})

module.exports = router
