import { fetchForecast } from '../forecast'
import WeatherFormatter from '../weather-formatter'

const weatherRoute = {
  method: 'GET',
  path: '/api/weather',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return fetchForecast(latitude, longitude)
      .then(weatherConditions => {
        const weatherFormatter = new WeatherFormatter(
          latitude,
          longitude,
          weatherConditions
        )

        return { ...weatherFormatter.format() }
      })
      .catch(e => console.error(e))
  },
  options: {
    cache: {
      expiresIn: 1800
    }
  }
}

export default weatherRoute
