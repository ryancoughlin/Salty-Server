import { findEnhancedStation } from '../geo'
import noaa from '../noaa'

const waterTemperatureRoute = {
  method: 'GET',
  path: '/api/water-temperature',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return findEnhancedStation(longitude, latitude)
      .then(station => {
        return noaa
          .fetchWaterTemperature(station.stationId)
          .then(waterTemperature => {
            return waterTemperature
          })
      })
      .catch(error => {
        console.error(error)
        return {}
      })
  }
}

export default waterTemperatureRoute
