import { fetchForecast } from '../forecast'
import WeatherFormatter from '../weather-formatter'

const weatherRoute = {
  method: 'GET',
  path: '/api/weather',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    fetchForecast(latitude, longitude)
      .then(weatherConditions => {
        const weatherFormatter = new WeatherFormatter(
          latitude,
          longitude,
          weatherConditions
        )
        reply({
          ...weatherFormatter.format()
        })
      })
      .catch(e => console.log(e))
  },
  config: {
    cache: {
      expiresIn: 1800
    }
  }
}

export default weatherRoute
