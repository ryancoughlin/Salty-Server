import { findStation } from '../geo'
import noaa from '../noaa'

const tideTableRoute = {
  method: 'GET',
  path: '/api/tides',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return findStation(longitude, latitude)
      .then(stationId => {
        return noaa.fetchPredictions(stationId).then(tides => {
          return tides
        })
      })
      .catch(error => {
        console.log('ERROR FROM STATION PROMISE: ', error)
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
