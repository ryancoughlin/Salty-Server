import { findStation } from '../geo'
import noaa from '../noaa'

const tideTableRoute = {
  method: 'GET',
  path: '/api/tides',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return findStation(longitude, latitude)
      .then(station => {
        return noaa.fetchPredictions(station.stationId).then(tide => {
          return tide
        })
      })
      .catch(error => {
        console.error(error)
        return {}
      })
  },
  config: {
    cache: {
      expiresIn: 172800
    }
  }
}

export default tideTableRoute
