import _ from 'lodash'
import moment from 'moment'
import Solar from 'suncalc'

export default class {
  constructor(latitude, longitude, weather) {
    this.weather = weather
    this.latitude = latitude
    this.longitude = longitude
  }

  format() {
    return {
      currentWeather: this.currentWeatherString(),
      currentWind: this.currentWindString(),
      icon: this.weather.currently.icon,
      wind: this.hourlyWind(),
      humidity: this.weather.currently.humidity,
      uvIndex: this.weather.currently.uvIndex,
      pressure: this.weather.currently.pressure,
      visibility: Math.round(this.weather.currently.visibility * 10) / 10,
      summary: this.summary(),
      ...this.solar()
    }
  }

  hourlyWind() {
    const weather = this.weather.daily.data

    return weather
      .filter((hour) => {
        const time = moment.utc(hour.time).local()
        return moment().diff(time) >= 0
      })
      .map((v) => {
        return {
          time: moment.unix(v.time),
          windSpeed: this.roundNumber(v.windSpeed),
          direction: v.windBearing
        }
      })
  }

  currentWeatherString() {
    const roundedTemperature = this.roundNumber(
      this.weather.currently.temperature
    )
    return `${this.weather.currently.summary} and ${roundedTemperature}°`
  }

  currentWindString() {
    const formattedWindBearing = this.formatWindBearing(
      this.weather.currently.windBearing
    )
    const roundedWindSpeed = this.roundNumber(this.weather.currently.windSpeed)
    return `${roundedWindSpeed}mph from the ${formattedWindBearing}`
  }

  roundNumber(number) {
    return Math.round(number)
  }

  summary() {
    const now = moment()
    const dailyForecast = this.weather.daily.data

    const today = _.findIndex(dailyForecast, (day) => {
      const formattedDate = moment(day.time)
      const time = moment.unix(day.time).local()
      return now.diff(time) <= 0
    })

    const todayForecast = dailyForecast[today]

    return todayForecast.summary
  }

  solar() {
    const now = new Date()
    const sun = Solar.getTimes(now, this.weather.latitude, this.longitude)
    const moon = Solar.getMoonIllumination(now)

    if (sun && moon) {
      return {
        moon: {
          phase: this.convertMoonLuminosity(moon.phase),
          percent: moon.phase
        },
        sunrise: sun.sunrise,
        sunset: sun.sunset
      }
    } else {
      return null
    }
  }

  convertMoonLuminosity(percent) {
    if (percent === 0) {
      return 'New Moon'
    } else if (percent > 0 && percent >= 0.125) {
      return 'Waxing Crescent'
    } else if (percent >= 0.125 && percent < 0.25) {
      return 'First Quarter'
    } else if (percent >= 0.5 && degrees < 0.625) {
      return 'Full Moon'
    } else if (percent >= 0.625 && degrees < 0.75) {
      return 'Warning Gibbous'
    } else if (percent >= 0.75 && percent < 0.875) {
      return 'Last Qurter'
    } else {
      return 'Waning Crescent'
    }
  }

  formatWindBearing(degrees) {
    if (degrees >= 0 && degrees < 22.5) {
      return 'N'
    } else if (degrees >= 22.5 && degrees < 45) {
      return 'NNE'
    } else if (degrees >= 45 && degrees < 67.5) {
      return 'NE'
    } else if (degrees >= 67.5 && degrees < 90) {
      return 'ENE'
    } else if (degrees >= 90 && degrees < 112.5) {
      return 'E'
    } else if (degrees >= 112.5 && degrees < 135) {
      return 'ESE'
    } else if (degrees >= 135 && degrees < 157.5) {
      return 'SE'
    } else if (degrees >= 157.5 && degrees < 180) {
      return 'SSE'
    } else if (degrees >= 180 && degrees < 202.5) {
      return 'S'
    } else if (degrees >= 202.5 && degrees < 225) {
      return 'SSW'
    } else if (degrees >= 225 && degrees < 247.5) {
      return 'SW'
    } else if (degrees >= 247.5 && degrees < 270) {
      return 'WSW'
    } else if (degrees >= 270 && degrees < 292.5) {
      return 'W'
    } else if (degrees >= 292.5 && degrees < 315) {
      return 'WNW'
    } else if (degrees >= 315 && degrees < 337.5) {
      return 'NW'
    } else {
      return 'NNW'
    }
  }
}
