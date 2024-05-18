// services/stationService.js
const connectDB = require('../database')
const Spot = require('../models/spot.model')
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
    },
    type: 'station'
  }

  return await Spot.findOne(query)
}

const fetchAllStations = async () => {
  const db = await connectDB()
  const stations = await Spot.find({})
  return stations
}

const fetchStationById = async (stationId) => {
  const db = await connectDB()
  const query = { id: sanitize(stationId) }
  console.log('Executing fetchStationById query:', query)
  return await Spot.findOne(query)
}

module.exports = { fetchClosestStation, fetchAllStations, fetchStationById }
