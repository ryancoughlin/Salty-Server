import moment from 'moment'
import _ from 'lodash'
import mongoose from 'mongoose'
import LRU from 'lru-cache'
import request from './request'
import WeatherFormatter from './weather-formatter'
import { checkCache, setCache } from './cache-manager'

const Surfline = require('./models/surfline')
const MIN_DISTANCE = 0
const MAX_DISTANCE = 100000

class SwellHeight {
  fetchSwellHeights(latitude, longitude) {
    return this.findSpot(longitude, latitude)
      .then(spotId => this._fetchRawSwellData(spotId))
      .then(forecast => this._formatSwellData(forecast))
      .then(formattedSwellData => {
        return this.groupByDay(formattedSwellData)
      })
      .catch(error => {
        console.log(error)
      })
  }

  fetchForecast(spotId) {
    return this._fetchRawSwellData(spotId).then(json => {
      return json.data
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
            reject('Mongo error', error)
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

  _fetchRawSwellData(spotId) {
    const params = `?days=2&intervalHours=3&spotId=${spotId}`

    return checkCache(spotId).catch(() => {
      return request(`${process.env.SURFLINE_URL}`, params)
        .then(json => {
          const swells = json.data.wave
          setCache(spotId, swells)
          return swells
        })
        .catch(error => {
          console.error(error)
        })
    })
  }

  _formatSwellData(forecast) {
    const weatherFormatter = new WeatherFormatter()
    return new Promise((resolve, reject) => {
      resolve(
        _.flatten(forecast)
          .filter(hour => {
            const time = moment.utc(hour.time).local()
            return moment().diff(time) >= 0
          })
          .map(hour => {
            return {
              time: moment.unix(hour.timestamp),
              height: Math.round(hour.swells[0].height * 10) / 10,
              direction: hour.swells[0].direction,
              compassDirection: weatherFormatter.formatWindBearing(
                hour.swells[0].direction
              ),
              period: hour.swells[0].period
            }
          })
      )
    })
  }
}

export default new SwellHeight()
