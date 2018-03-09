import { findStation } from '../geo'
import noaa from '../noaa'

const tideChartRoute = {
  method: 'GET',
  path: '/api/tide-chart',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return findStation(longitude, latitude).then(station => {
      return noaa
        .fetchHourlyPredictions(station.stationId)
        .then(hourlyPredictions => {
          return [...hourlyPredictions]
        })
    })
  }
}

export default tideChartRoute
