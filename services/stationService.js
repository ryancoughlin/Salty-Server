//services/stationService.js
const connectDB = require('../database')
const Station = require('../models/station.model')

const getClosestStation = async (lat, lon) => {
  const db = await connectDB()
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lon), parseFloat(lat)]
        }
      }
    }
  }

  return await Station.findOne(query)
}

module.exports = { getClosestStation }
