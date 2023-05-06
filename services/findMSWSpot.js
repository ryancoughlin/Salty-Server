// find-msw-spot.js
const MSWSpot = require('../models/mswspot.model')

export const findMSWSpot = async (latitude, longitude) => {
  try {
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          }
        }
      }
    }
    const spot = await MSWSpot.findOne(query)

    if (!spot) {
      throw new Error('No nearby spots found')
    }

    console.log(spot)
    return spot
  } catch (error) {
    console.error('Error finding MSW spot:', error)
    throw error
  }
}
