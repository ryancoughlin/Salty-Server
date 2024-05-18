//wave.controller.js
const { getNearestWaveData } = require('../services/waveService')
const {
  evaluateConditions,
  generateOneLiner
} = require('../utils/waveProcessing')

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
    console.log('Raw Forecast:', rawForecast) // Debug log

    const evaluatedForecast = evaluateConditions(rawForecast)
    console.log('Evaluated Forecast:', evaluatedForecast) // Debug log

    const oneLiner = generateOneLiner(evaluatedForecast)
    console.log('One Liner:', oneLiner) // Debug log

    res.json({ summary: oneLiner, forecast: evaluatedForecast })
  } catch (error) {
    console.error(`Error in getWaveForecast: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getWaveForecast }
