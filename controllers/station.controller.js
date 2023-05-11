const Station = require('../models/station.model')
const TideData = require('../TideData')

const getClosestStation = async (req, res) => {
  console.log('request!!!!!')
  try {
    const { latitude, longitude } = req.query

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Missing latitude or longitude query parameters' })
    }
    // hwll
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

    const station = await Station.findOne(query)

    if (!station) {
      return res.status(404).json({ error: 'No nearby stations found' })
    }

    const tideData = new TideData(station)
    const data = await tideData.fetchData()
    console.log({ ...data })

    res.json(data)
  } catch (error) {
    console.error(`Error in getClosestStation: ${error}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getClosestStation = getClosestStation
