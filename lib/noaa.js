import moment from 'moment'
import _ from 'lodash'
import LRU from 'lru-cache'

import request from './request'
import { checkCache, setCache } from './cache-manager'

const API_DATE_FORMAT = 'MM/DD/YYYY'

class NOAA {
  fetchPredictions(stationId) {
    return this._fetchRawPredictionTides(stationId)
      .then(json => {
        return this.formatTides(json.predictions).then(this.groupByDay)
      })
      .then(tides => {
        return {
          tides,
          todaysTides: this.todaysTides(tides)
        }
      })
  }

  _fetchRawPredictionTides(stationId) {
    const yesterday = moment().add(-1, 'days').format(API_DATE_FORMAT)
    const future = moment(yesterday, API_DATE_FORMAT)
      .add(7, 'days')
      .format(API_DATE_FORMAT)

    const params =
      '?begin_date=' +
      yesterday +
      '&end_date=' +
      future +
      '&station=' +
      stationId +
      '&interval=hilo&product=predictions&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json'

    return checkCache(stationId).catch(() => {
      return request(`${process.env.NOAA_URL}`, params).then(json => {
        setCache(stationId, json)
        return json
      })
    })
  }

  fetchWaterTemperature(stationId) {
    const params =
      '?station=' +
      stationId +
      '&start_date=today&range=24&product=water_temperature&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json'

    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.formatWaterTemperature(json.data)
    })
  }

  fetchHourlyPredictions(stationId) {
    const params =
      '?station=' +
      stationId +
      '&date=today&range=24&product=predictions&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json'
    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.normalizePredictions(json.predictions)
    })
  }

  formatWaterTemperature(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(predictions, prediction => {
          return {
            time: moment(prediction.t),
            temperature: Math.round(prediction.v * 10) / 10
          }
        })
      )
    })
  }

  normalizePredictions(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(predictions, prediction => {
          return {
            time: moment(prediction.t),
            height: Math.round(prediction.v * 10) / 10
          }
        })
      )
    })
  }

  formatTides(tides) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(tides, tide => {
          return {
            time: moment(tide.t),
            height: Math.round(tide.v * 10) / 10,
            type: tide.type == 'H' ? 'high' : 'low'
          }
        })
      )
    })
  }

  groupByDay(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.groupBy(predictions, prediction =>
          prediction.time.format(API_DATE_FORMAT)
        )
      )
    })
  }

  todaysTides(tides) {
    const todaysKey = moment().format(API_DATE_FORMAT)
    return tides[todaysKey]
  }
}

export default new NOAA()
