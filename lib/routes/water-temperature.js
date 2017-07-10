import { findEnhancedStation } from '../geo'
import noaa from '../noaa'

const waterTemperatureRoute = {
  method: 'GET',
  path: '/api/water-temperature',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findEnhancedStation(longitude, latitude)
      .then(stationId => {
        return noaa.fetchWaterTemperature(stationId).then(waterTemperatures => {
          reply(waterTemperatures)
        })
      })
      .catch(error => {
        console.log('ERROR:', error)
        reply({})
      })
  }
}

export default waterTemperatureRoute
