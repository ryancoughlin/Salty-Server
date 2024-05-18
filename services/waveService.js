// services/waveServices.js
const mongoose = require('mongoose')
const WaveForecast = require('../models/waveForecast.model')

const queryWaveForecast = async (lat, lon, distanceInMeters = 321869 / 2) => {
  const today = new Date().toISOString().substr(0, 10) // Get today's date in YYYY-MM-DD format

  const relevantPoints = await WaveForecast.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lon, lat] },
        distanceField: 'dist.calculated',
        maxDistance: distanceInMeters, // Use distance in meters
        spherical: true
      }
    },
    {
      $match: {
        time: {
          $gte: new Date(today),
          $lt: new Date(today + 'T23:59:59Z')
        }
      }
    },
    {
      $sort: { 'dist.calculated': 1, time: -1 } // Sort by distance and time
    }
  ])

  console.log('Relevant Point for today:', relevantPoints)

  if (relevantPoints.length === 0) {
    console.log('No relevant points found for today.')
    return []
  }
  return relevantPoints
}

const getNearestWaveData = async (lat, lon) => {
  try {
    return await queryWaveForecast(lat, lon)
  } catch (error) {
    console.error(`Error in getNearestWaveData: ${error}`)
    throw error
  }
}

module.exports = {
  getNearestWaveData
}
