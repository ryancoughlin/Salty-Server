import moment from 'moment'
import _ from 'lodash'
import mongoose from 'mongoose'
import LRU from 'lru-cache'
import request from './request'
import { checkCache, setCache } from './cache-manager'

const Surfline = require('./models/surfline')
const MIN_DISTANCE = 0
const MAX_DISTANCE = 100000

class SwellHeight {
  fetchSwellHeights(latitude, longitude) {
    return this.findSpot(longitude, latitude)
      .catch(error => {
        console.log(error)
      })
  }

  fetchForecast(spotId) {
    return this._fetchRawSwellData(spotId).then(json => {
      return json.data
    })
  }

  _fetchRawSwellData(spotId) {
    const params = `?spot_id=${spotId}`

    return checkCache(spotId).catch(() => {
      return request(`${process.env.SURFLINE_URL}`, params)
        .then(json => {
          console.log(json)
          setCache(spotId, json)
          return json
        })
        .catch(error => {
          console.error(error)
        })
    })
  }

  findSpot(longitude, latitude) {
    return new Promise(function(resolve, reject) {
      Surfline.findOne(
        {
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: MAX_DISTANCE
            }
          }
        },
        function(error, spot) {
          if (error) {
            reject("Mongo error", error)
          }

          if (spot) {
            resolve(spot.spotId)
          } else {
            reject('No spot found within set radius')
          }
        }
      )
    })
  }

  groupByDay(forecast) {
    return _.groupBy(forecast, day => {
      return day.time.format('MM/DD/YYYY')
    })
  }

  filterSwellData(forecast) {
    return new Promise(function(resolve, reject) {
      const reduce = _.reduce(forecast)
    })
  }

  _formatSwellData(forecast) {
    return new Promise((resolve, reject) => {
      resolve(
        _.map(forecast, hour => {
          return {
            time: moment.unix(hour.timestamp),
            height: Math.round(hour.swell.components.primary.height),
            compassDirection: hour.swell.components.primary.compassDirection,
            direction: hour.swell.components.primary.direction,
            period: hour.swell.components.primary.period,
            type: this.formatSwellType(hour.wind.speed)
          }
        })
      )
    })
  }

  formatSwellType(windSpeed) {
    if (windSpeed < 5.75) {
      return 'Smooth Calm'
    } else if (windSpeed >= 5.75 && windSpeed <= 11.51) {
      return 'Light Chop'
    } else if (windSpeed >= 11.52 && windSpeed <= 17.26) {
      return 'Moderate Chop'
    } else if (windSpeed >= 17.27 && windSpeed <= 23.016) {
      return 'Choppy'
    } else if (windSpeed >= 23.017 && windSpeed <= 28.769) {
      return 'Rough'
    } else {
      return 'Very Rough'
    }
  }
}

export default new SwellHeight()
