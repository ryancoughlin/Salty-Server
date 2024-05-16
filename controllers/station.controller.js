//controllers/station.controller.js
const {
  fetchClosestStation,
  fetchAllStations
} = require('../services/stationService')

const getAllStations = async (req, res) => {
  try {
    const stations = await fetchAllStations()
    res.json(stations)
  } catch (error) {
    console.error(`Error in getAllStations: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getClosestStation = async (req, res) => {
  try {
    const { latitude, longitude } = req.query

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Missing latitude or longitude query parameters' })
    }

    const station = await fetchClosestStation(
      parseFloat(latitude),
      parseFloat(longitude)
    )

    if (!station) {
      return res.status(404).json({ error: 'No nearby stations found' })
    }

    res.json(station)
  } catch (error) {
    console.error(`Error in getClosestStation: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getAllStations, getClosestStation }
