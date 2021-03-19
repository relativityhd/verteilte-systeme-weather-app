require('dotenv').config()
const express = require('express')
const app = express()
const v1Router = require('./src/v1/api')

const port = process.env.PORT || 3000

app.use('/api/V1', v1Router)

app.get('*', (req, res) => {
  res.send('Backend server for the Weather App frontend. Request GET /api/V1/recommend?lat=xxx&lon=xxx')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
