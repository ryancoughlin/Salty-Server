import DarkSky from 'dark-sky'

const forecast = new DarkSky(process.env.DARKSKY_KEY)

export function fetchForecast(latitude, longitude) {
  return new Promise(function (resolve, reject) {
    forecast
      .latitude(latitude)
      .longitude(longitude)
      .exclude('minutely, hourly, flags')
      .get()
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
