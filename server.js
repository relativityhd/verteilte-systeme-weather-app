const express = require('express')
const app = express()
const apiRouter = require('./src/api')

const port = process.env.port || 3000

app.use('/api/V1', apiRouter)

app.get('*', (req, res) => {
  res.send('Backend server for the Weather App frontend. Request GET /api/V1/recommend?lat=xxx&lon=xxx')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
