import { findStation } from '../geo'
import noaa from '../noaa'

const tideChartRoute = {
  method: 'GET',
  path: '/api/tide-chart',
  handler: function(request, h) {
    const params = request.params

    findStation(params.longitude, params.latitude).then(stationId => {
      return noaa.fetchHourlyPredictions(stationId).then(hourlyPredictions => {
        return [...hourlyPredictions]
      })
    })
  }
}

export default tideChartRoute
