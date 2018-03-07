import { findEnhancedStation } from '../geo'
import noaa from '../noaa'

const waterTemperatureRoute = {
  method: 'GET',
  path: '/api/water-temperature',
  handler: function(request, h) {
    const params = request.params

    findEnhancedStation(longitude, latitude)
      .then(stationId => {
        return noaa.fetchWaterTemperature(stationId).then(waterTemperature => {
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
