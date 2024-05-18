// services/stationService.js
const connectDB = require('../database')
const Station = require('../models/station.model')
const sanitize = require('mongo-sanitize')

const fetchClosestStation = async (lat, lon) => {
  const db = await connectDB()
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [sanitize(lon), sanitize(lat)]
        }
      }
    }
  }

  return await Station.findOne(query)
}

const fetchAllStations = async () => {
  const db = await connectDB()
  const stations = await Station.find({})
  return stations
}

const fetchStationById = async (stationId) => {
  const db = await connectDB()
  const query = { stationId: sanitize(stationId) }
  console.log('Executing fetchStationById query:', query)
  return await Station.findOne(query)
}

module.exports = { fetchClosestStation, fetchAllStations, fetchStationById }
