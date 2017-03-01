import _ from 'lodash';
import moment from 'moment';

export default class {
  constructor(weather) {
    this.weather = weather
  }

  format() {
    return {
      currentWeather: this.currentWeatherString(),
      currentWind: this.currentWindString(),
      icon: this.weather.currently.icon,
      wind: this.hourlyWind(),
    }
  }

  hourlyWind() {
    return _.map(this.weather.hourly.data, v => {
      return {
        time: moment.unix(v.time),
        windSpeed: this.roundNumber(v.windSpeed),
        windBearing: v.windBearing
      }
    });

  }

  currentWeatherString() {
    const roundedTemperature = this.roundNumber(this.weather.currently.temperature)
    return `${this.weather.currently.summary} and ${roundedTemperature}°`
  }

  currentWindString() {
    const formattedWindBearing = this.formatWindBearing(this.weather.currently.windBearing)
    const roundedWindSpeed = this.roundNumber(this.weather.currently.windSpeed)
    return `${roundedWindSpeed}mph from the ${formattedWindBearing}`
  }

  roundNumber(number) {
    return Math.round(number)
  }

  formatWindBearing(degrees) {
    if(degrees >= 0 && degrees < 22.5) {
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
