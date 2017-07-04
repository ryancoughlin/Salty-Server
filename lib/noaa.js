import moment from "moment";
import _ from "lodash";

import request from "./request";

const API_DATE_FORMAT = "MM/DD/YYYY";

export default class NOAA {
  constructor(stationId) {
    this.stationId = stationId;
  }

  fetchPredictions() {
    const yesterday = moment().add(-1, "days").format(API_DATE_FORMAT);
    const future = moment(yesterday, API_DATE_FORMAT)
      .add(7, "days")
      .format(API_DATE_FORMAT);

    const params =
      "?begin_date=" +
      yesterday +
      "&end_date=" +
      future +
      "&station=" +
      this.stationId +
      "&interval=hilo&product=predictions&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json";

    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.formatHighLow(json.predictions).then(predictions => {
        return this.groupPredictionsByDay(predictions).then(tides => {
          return tides;
        });
      });
    });
  }

  fetchWaterTemperature() {
    const params =
      "?station=" +
      this.stationId +
      "&start_date=today&range=24&product=water_temperature&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json";

    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.formatWaterTemperature(json.data).then(waterTemperatures => {
        return waterTemperatures;
      });
    });
  }

  fetchHourlyPredictions() {
    const params =
      "?station=" +
      this.stationId +
      "&date=today&range=24&product=predictions&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json";
    return request(`${process.env.NOAA_URL}`, params).then(json => {
      return this.normalizePredictions(json.predictions).then(predictions => {
        return predictions;
      });
    });
  }

  formatWaterTemperature(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(predictions, prediction => {
          return {
            time: moment(prediction.t),
            temperature: Math.round(prediction.v * 10) / 10
          };
        })
      );
    });
  }

  normalizePredictions(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(predictions, prediction => {
          return {
            time: moment(prediction.t),
            height: Math.round(prediction.v * 10) / 10
          };
        })
      );
    });
  }

  formatHighLow(tides) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.map(tides, tide => {
          const tideType = tide.type == "H" ? "high" : "low";

          return {
            time: moment(tide.t),
            height: Math.round(tide.v * 10) / 10,
            type: tideType
          };
        })
      );
    });
  }

  groupPredictionsByDay(predictions) {
    return new Promise(function(resolve, reject) {
      resolve(
        _.groupBy(predictions, prediction =>
          prediction.time.format(API_DATE_FORMAT)
        )
      );
    });
  }

  todaysTides(tides) {
    const now = moment();
    const todaysKey = now.format("MM/DD/YYYY");
    return tides[todaysKey];
  }
}
