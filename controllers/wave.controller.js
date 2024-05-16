const { getNearestWaveData } = require('../services/waveService')

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

    const data = await getNearestWaveData(lat, lon)

    if (data.length) {
      res.json(data)
    } else {
      res.status(404).json({ error: 'No data found for the given location' })
    }
  } catch (error) {
    console.error(`Error in getWaveForecast: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getWaveForecast }
