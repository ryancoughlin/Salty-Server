const WaveForecast = require('../models/waveForecast.model')

const getNearestWaveData = async (lat, lon, radius = 50000) => {
  return await WaveForecast.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lon, lat] },
        distanceField: 'dist.calculated',
        maxDistance: radius,
        spherical: true
      }
    },
    {
      $sort: { time: 1 } // Sort by time in ascending order
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the output
        time: 1,
        depth: 1,
        latitude: 1,
        longitude: 1,
        Tdir: 1,
        Tper: 1,
        Thgt: 1,
        sdir: 1,
        sper: 1,
        shgt: 1,
        wdir: 1,
        wper: 1,
        whgt: 1,
        location: 1
      }
    }
  ])
}

module.exports = { getNearestWaveData }
