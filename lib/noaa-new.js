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
      "&product=predictions&datum=mllw&units=metric&time_zone=gmt&application=web_services&format=json";

    return request(params).then(json => {
      return this.normalizePredictions(json.predictions).then(tidesByDay => {
        return this.groupPredictionsByTides(tidesByDay).then(tides => {
          return tides;
        });
      });
    });
  }

  normalizePredictions(predictions) {
    return new Promise(function(resolve, reject) {
      const cleanPredictions = _.map(predictions, prediction => {
        return {
          time: moment(prediction.t),
          height: Math.round(prediction.v * 10) / 10
        };
      });

      const organizeTidesByDay = _.groupBy(cleanPredictions, prediction =>
        prediction.time.format(API_DATE_FORMAT)
      );

      resolve(organizeTidesByDay);
    });
  }

  groupPredictionsByTides(predictionsByDay) {
    console.log(predictionsByDay);

    return new Promise((resolve, reject) => {
      return _.mapValues(predictionsByDay, day => {
        console.log("ONE DAY IS: ", day);
        const firstLowTide = this.getLowest(day);
        const secondLowTide = this.getLowest(
          _.filter(day, function(prediction) {
            return (
              Math.abs(prediction.time.hour() - firstLowTide.time.hour()) >= 6
            );
          })
        );

        const firstHighTide = this.getHighest(day);
        const secondHighTide = this.getHighest(
          _.filter(day, function(prediction) {
            return (
              Math.abs(prediction.time.hour() - firstHighTide.time.hour()) >= 6
            );
          })
        );

        const tidesToDisplay = [
          this.prettify(firstLowTide, "low"),
          this.prettify(secondLowTide, "low"),
          this.prettify(firstHighTide, "high"),
          this.prettify(secondHighTide, "high")
        ];

        const sorted = _.sortBy(_.omitBy(tidesToDisplay, _.isNull), function(
          tide
        ) {
          return moment(tide.time);
        });

        resolve(sorted);
      });
    });
  }

  getLowest(day) {
    return _.reduce(day, (firstLow, prediction) => {
      if (!firstLow) {
        return prediction;
      } else if (firstLow.height > prediction.height) {
        return prediction;
      } else {
        return firstLow;
      }
    });
  }

  getHighest(day) {
    return _.reduce(day, (firstHigh, prediction) => {
      if (!firstHigh) {
        return prediction;
      } else if (firstHigh.height < prediction.height) {
        return prediction;
      } else {
        return firstHigh;
      }
    });
  }

  prettify(tide, tideType) {
    return {
      ...tide,
      tide: tideType
    };
  }
}
