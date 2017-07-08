import { findStation } from '../geo'
import noaa from '../noaa'

const tideChartRoute = {
  method: 'GET',
  path: '/api/tide-chart',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findStation(longitude, latitude).then(stationId => {
      return noaa.fetchHourlyPredictions(stationId).then(hourlyPredictions => {
        reply([...hourlyPredictions])
      })
    })
  }
}

export default tideChartRoute
