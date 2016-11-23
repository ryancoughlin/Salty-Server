require('dotenv').config();

import DarkSky from 'dark-sky'

const forecast = new DarkSky(process.env.DARKSKY_KEY);

export function fetchForecast(lat, lng) {
  return forecast
      .latitude(lat)
      .longitude(lng)
      .exclude('minutely, daily')
      .get()
}
