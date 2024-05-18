const { getNearestWaveData } = require('../services/waveService')
const {
  processWaveForecast,
  filterNext24Hours,
  evaluateConditions,
  analyzeTrends,
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
    const processedForecast = processWaveForecast(rawForecast)
    console.log('Processed Forecast:', processedForecast) // Debug log
    const next24HoursForecast = filterNext24Hours(processedForecast)
    console.log('Next 24 Hours Forecast:', next24HoursForecast) // Debug log
    const evaluatedForecast = evaluateConditions(next24HoursForecast)
    console.log('Evaluated Forecast:', evaluatedForecast) // Debug log
    const trends = analyzeTrends(evaluatedForecast)
    console.log('Trends:', trends) // Debug log
    const oneLiner = generateOneLiner(trends)
    console.log('One Liner:', oneLiner) // Debug log

    res.json({ summary: oneLiner, forecast: evaluatedForecast })
  } catch (error) {
    console.error(`Error in getWaveForecast: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getWaveForecast }
