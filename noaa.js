import tidesandcurrents from "tidesandcurrents";
import moment from "moment";
import _ from "lodash";
// import LRU from 'lru-cache'
import noaaService from "./noaa-service";
import request from "./request";
// import { checkCache, setCache } from './cache-manager'

const API_DATE_FORMAT = "MM/DD/YYYY";
const beginDate = moment().add(-1, "days").format(API_DATE_FORMAT);
const endDate = moment(beginDate, API_DATE_FORMAT)
  .add(10, "days")
  .format(API_DATE_FORMAT);

class NOAA {
  fetchPredictions(stationId) {
    const stationData = {
      station: stationId,
      date: "today",
      product: "water_level",
      datum: "mllw",
      format: "json",
      time_zone: "lst_ldt",
      units: "english",
    };

    const highLowParams = {
      station: stationId,
      begin_date: beginDate,
      end_date: endDate,
      product: "predictions",
      interval: "hilo",
      datum: "mllw",
      format: "json",
      time_zone: "lst_ldt",
      units: "english",
    };

    const predictionsParam = {
      station: stationId,
      range: "24",
      date: "today",
      product: "predictions",
      interval: "h",
      datum: "mllw",
      format: "json",
      time_zone: "lst_ldt",
      units: "english",
    };

    const stationDataPromise = noaaService(stationData).then((json) => {
      if (json.hasOwnProperty("metadata")) {
        const { state, name, id, lat, lon } = json.metadata;
        return { state, id, name, latitude: lat, longitude: lon };
      } else {
        return "No station data found";
      }
    });

    const dailyTidePromise = noaaService(highLowParams).then((json) => {
      return { ...this.formatTides(json), ...this.findNextTide(json) };
    });

    const predictionPromise = noaaService(predictionsParam).then((json) => {
      return json;
    });

    return Promise.all([
      stationDataPromise,
      dailyTidePromise,
      predictionPromise,
    ]).then((data) => {
      return { ...data[0], ...data[1], ...data[2] };
    });
  }

  normalizePredictions(predictions) {
    return new Promise(function (resolve, reject) {
      resolve(
        _.map(predictions, (prediction) => {
          return {
            time: prediction.t,
            height: Math.round(prediction.v * 10) / 10,
          };
        })
      );
    });
  }

  formatTides(data) {
    const predictions = data.predictions;
    const formatted = _.map(predictions, (tide) => {
      return {
        time: tide.t,
        height: Number(Math.round(tide.v * 10) / 10),
        type: tide.type == "H" ? "high" : "low",
      };
    });

    const grouped = _.groupBy(formatted, (prediction) => {
      return moment(prediction.time, "YYYY-MM-DD hh:mm").format(
        API_DATE_FORMAT
      );
    });

    return { tides: grouped };
  }

  findNextTide(data) {
    const tideArray = Object.values(data.predictions);
    const flattenedTides = tideArray.flat();
    const nextTideIndex = flattenedTides.findIndex((tide) => {
      const tideTime = moment(tide.time);
      return moment().diff(tideTime) <= 0;
    });

    if (nextTideIndex === -1) return {};

    const nextTide = {
      time: flattenedTides[nextTideIndex].t,
      type: flattenedTides[nextTideIndex].type == "H" ? "high" : "low",
      height: Number(flattenedTides[nextTideIndex].v),
    };

    return { nextTide: nextTide };
  }

  formatWaterTemperature(temperatures) {
    return new Promise(function (resolve, reject) {
      const latest = _.last(temperatures);
      resolve({
        time: latest.time,
        temperature: Math.round(latest.v * 10) / 10,
      });
    });
  }
}
export default new NOAA();
