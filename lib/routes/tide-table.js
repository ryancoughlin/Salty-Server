import { findStation } from '../geo'
import NOAA from '../noaa'

const noaa = new NOAA()

const tideTableRoute = {
  method: 'GET',
  path: '/api/tides',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findStation(longitude, latitude)
      .then(stationId => {
        noaa.stationId = stationId
        return noaa.fetchPredictions().then(tides => {
          reply({
            ...tides,
            todaysTides: noaa.todaysTides(tides)
          })
        })
      })
      .catch(error => {
        console.log('ERROR FROM STATION PROMISE: ', error)
        reply({})
      })
  }
}

export default tideTableRoute
