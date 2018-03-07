import { fetchForecast } from '../forecast'
import WeatherFormatter from '../weather-formatter'

const weatherRoute = {
  method: 'GET',
  path: '/api/weather',
  handler: function(request, h) {
    const params = request.params

    fetchForecast(params.latitude, params.longitude)
      .then(weatherConditions => {
        const weatherFormatter = new WeatherFormatter(
          latitude,
          longitude,
          weatherConditions
        )

        return { ...weatherFormatter.format() }
      })
      .catch(e => console.error(error))
  },
  options: {
    cache: {
      expiresIn: 1800
    }
  }
}

export default weatherRoute
