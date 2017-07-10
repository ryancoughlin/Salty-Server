import { findStation } from '../geo'
import noaa from '../noaa'

const tideTableRoute = {
  method: 'GET',
  path: '/api/tides',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findStation(longitude, latitude)
      .then(stationId => {
        return noaa.fetchPredictions(stationId).then(tides => {
          reply(tides)
        })
      })
      .catch(error => {
        console.log('ERROR FROM STATION PROMISE: ', error)
        reply({})
      })
  }
}

export default tideTableRoute
