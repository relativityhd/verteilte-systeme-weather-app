require('dotenv').config()
const express = require('express')
const app = express()
const v1Router = require('./src/v1/api')

// Set port, if no PORT is set in the environment, set to 30922
const port = process.env.PORT || 30922

// Use the Router for the V1 API
app.use('/api/V1', v1Router)

// For Debuging, returns JSON with specific environment variables
app.get('/env', (req, res) => {
  res.status(200).json({
    apikey: process.env.OPEN_WEATHER_API_KEY ? 'defined' : 'undefined',
    timeout: process.env.TIMEOUT || 'undefined',
    url: process.env.OPEN_WEATHER_API || 'undefined',
    port: process.env.PORT || 'undefined'
  })
})

// All other routes (wdilcard '*') should return a simple example use of the v1 API
app.get('*', (req, res) => {
  res.send('Backend server for the Weather App frontend. Request GET /api/V1/recommend?lat=xxx&lon=xxx')
})

// Start the express server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
