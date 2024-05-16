const { getClosestStation } = require('../services/stationService')
const createTideFetcher = require('../TideData')

const getStation = async (req, res) => {
  try {
    const { latitude, longitude } = req.query

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Missing latitude or longitude query parameters' })
    }

    const station = await getClosestStation(
      parseFloat(latitude),
      parseFloat(longitude)
    )

    if (!station) {
      return res.status(404).json({ error: 'No nearby stations found' })
    }

    const tideData = createTideFetcher(station)
    const data = await tideData.fetchData()
    console.log({ ...data })

    res.json(data)
  } catch (error) {
    console.error(`Error in getStation: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getStation }
