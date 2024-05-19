//wave.controller.js
const { getNearestWaveData } = require('../services/waveService')
const { formatConditions } = require('../utils/waveProcessing')

const getWaveForecast = async (req, res) => {
  try {
    const { latitude, longitude } = req.query
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Missing latitude or longitude query parameters' })
    }

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    const rawForecast = await getNearestWaveData(lat, lon)
    const formattedConditions = formatConditions(rawForecast)

    res.json(formattedConditions)
  } catch (error) {
    console.error(`Error in getWaveForecast: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getWaveForecast }
