import moment from 'moment'
import _ from 'lodash'
import LRU from 'lru-cache'

import request from './request'
import { checkCache, setCache } from './cache-manager'

const API_DATE_FORMAT = 'MM/DD/YYYY'

class NOAA {
  fetchPredictions(stationId) {
    return this._fetchRawPredictionTides(stationId).then(json => {
      return this.formatTides(json.predictions).then(this.groupByDay)
    })
  }

  _fetchRawPredictionTides(stationId) {
    const beginDate = moment().format(API_DATE_FORMAT)
    const endDate = moment(beginDate, API_DATE_FORMAT)
      .add(10, 'days')
      .format(API_DATE_FORMAT)

    const params =
      '?begin_date=' +
      beginDate +
      '&end_date=' +
      endDate +
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
      '&start_date=today&range=3&product=water_temperature&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json'

    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.formatWaterTemperature(json.data)
    })
  }

  fetchHourlyPredictions(stationId) {
    const params =
      '?station=' +
      stationId +
      '&start_date=today&range=24&product=predictions&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json'
    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.normalizePredictions(json.predictions)
    })
  }

  formatWaterTemperature(temperatures) {
    return new Promise(function(resolve, reject) {
      const latest = _.last(temperatures)
      resolve({
        time: moment(latest.t),
        temperature: Math.round(latest.v * 10) / 10
      })
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
}

export default new NOAA()
