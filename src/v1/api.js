const express = require('express')
const router = express.Router()
const axios = require('axios').default
const { recommend } = require('./logic')

router.get('/recommend', (req, res) => {
  /**
   * Error Codes
   * 400: Lat/Lon has not the correct format
   * 408: Timeout
   * 500: Strange Error
   * *: Return weather API (e.g. 200, 401)
   */
  const lat = req.query.lat
  const lon = req.query.lon

  if (!lat || !lon) {
    return res.status(400).send('Please provide lat and lon parameters!')
  }

  if (isNaN(lat) || isNaN(lon) || lat > 90 || lat < -90 || lon > 180 || lon < -180) {
    return res.status(400).send(`The coordinates ${lat}:${lon} are not valid!`)
  }

  const weatherRequestOptions = {
    params: {
      lat: lat,
      lon: lon,
      appid: process.env.OPEN_WEATHER_API_KEY,
      exclude: 'current,minutely,daily,alerts',
      units: 'metric'
    },
    timeout: process.env.TIMEOUT
  }

  axios
    .get(process.env.OPEN_WEATHER_API, weatherRequestOptions)
    .then((weatherRes) => {
      const recommendation = recommend({
        nextHoursTemp: weatherRes.data.hourly[1].temp,
        nextHoursUV: weatherRes.data.hourly[1].uvi,
        nextHoursPOP: weatherRes.data.hourly[1].pop
      })

      res.status(200).json(recommendation)
    })
    .catch((err) => {
      if (err.code === 'ECONNABORTED') {
        return res.status(408).send(`Weather API didn't respond: ${err.message}`)
      } else if (err.response) {
        const presumptiveError =
          err.response.status === 401 ? 'The presumable cause is a wrong or missing Open Weather API Key.' : ''
        return res
          .status(err.response.status)
          .send(
            `Weather API didn't respond with 200! Status: ${err.response.status}. Message: ${err.response.statusText}. ${presumptiveError}`
          )
      } else {
        return res.status(500).send('Some strange Error occured!')
      }
    })
})

module.exports = router
