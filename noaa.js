import moment from "moment";
import _ from "lodash";
// import LRU from 'lru-cache'
import request from "./request";
// import { checkCache, setCache } from './cache-manager'
import axios from "axios";

const API_DATE_FORMAT = "MM/DD/YYYY";
const beginDate = moment().add(-1, "days").format(API_DATE_FORMAT);
const endDate = moment(beginDate, API_DATE_FORMAT)
  .add(10, "days")
  .format(API_DATE_FORMAT);

class NOAA {
  fetchPredictions(stationId) {
    return this.fetchHighLowTides(stationId).then((json) => {
      return this.formatTides(json).then((predictions) => {
        return this.groupByDay(predictions);
      });
    });
  }

  async fetchHighLowTides(stationId) {
    const params = {
      station: stationId,
      begin_date: beginDate,
      end_date: endDate,
      product: "predictions",
      interval: "hilo",
      datum: "mllw",
      format: "json",
      datum: "mllw",
      time_zone: "lst_ldt",
      units: "english",
    };

    try {
      const response = await axios.get(process.env.NOAA_URL, { params });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  fetchWaterTemperature(stationId) {
    const params =
      "?station=" +
      stationId +
      "&start_date=today&range=3&product=water_temperature&interval=h&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json";

    const url = new URL(
      "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter" + params
    );

    return request(url)
      .then((json) => {
        return this.formatWaterTemperature(json.data);
      })
      .catch((error) => {
        console.log("Error requesting high/low tides", error.message);
      });
  }

  fetchHourlyPredictions(stationId) {
    const params =
      "?station=" +
      stationId +
      "&begin_date=" +
      beginDate +
      "&end_date=" +
      endDate +
      "&product=predictions&interval=hilo&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json";

    const url = new URL(
      "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter" + params
    );

    return request(url)
      .then((json) => this.normalizePredictions(json.predictions))
      .then((predictions) => {
        return this.groupByDay(predictions);
      })
      .catch((error) => {
        console.log("Error requesting high/low tides", error.message);
      });
  }

  normalizePredictions(predictions) {
    console.log(predictions);
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

  formatTides(tides) {
    return new Promise(function (resolve, reject) {
      resolve(
        _.map(tides.predictions, (tide) => {
          return {
            time: tide.t,
            height: Math.round(tide.v * 10) / 10,
            type: tide.type == "H" ? "high" : "low",
          };
        })
      );
    });
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

  groupByDay(predictions) {
    return _.groupBy(predictions, (prediction) => {
      return moment(prediction.time, "YYYY-MM-DD hh:mm").format(
        API_DATE_FORMAT
      );
    });
  }
}
export default new NOAA();
