// controllers/station.controller.js
const {
  fetchClosestStation,
  fetchAllStations
} = require('../services/stationService')
const createTideFetcher = require('../TideData')
const { formatStation, handleError } = require('../utils')

const getAllStations = async (req, res) => {
  try {
    const stations = await fetchAllStations()
    const formattedStations = stations.map(formatStation)
    res.json(formattedStations)
  } catch (error) {
    handleError(error, res, 'Error fetching all stations')
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

    const tideDataFetcher = createTideFetcher(station)
    const tideData = await tideDataFetcher.fetchData()

    const response = {
      ...formatStation(station),
      tides: tideData.tides
    }

    res.json(response)
  } catch (error) {
    handleError(error, res, 'Error fetching closest station')
  }
}

module.exports = { getAllStations, getClosestStation }
