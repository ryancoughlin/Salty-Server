import moment from "moment";
import _ from "lodash";
import mongoose from "mongoose";
import LRU from "lru-cache";

import request from "./request";
import { checkCache, setCache } from "./cache-manager";

export function groupByDay(forecast) {
  return _.groupBy(forecast, (day) => {
    return day.time.format("MM/DD/YYYY");
  });
}

export function filterSwellData(forecast) {
  return new Promise(function (resolve, reject) {
    const reduce = _.reduce(forecast);
  });
}

export function formatSwellData(forecast) {
  return new Promise((resolve, reject) => {
    resolve(
      _.map(forecast, (hour) => {
        return {
          time: moment.unix(hour.timestamp),
          height: Math.round(hour.swell.components.primary.height),
          compassDirection: hour.swell.components.primary.compassDirection,
          direction: hour.swell.components.primary.direction,
          period: hour.swell.components.primary.period,
          type: formatSwellType(hour.wind.speed),
        };
      })
    );
  });
}

function formatSwellType(windSpeed) {
  if (windSpeed < 5.75) {
    return "Smooth Calm";
  } else if (windSpeed >= 5.75 && windSpeed <= 11.51) {
    return "Light Chop";
  } else if (windSpeed >= 11.52 && windSpeed <= 17.26) {
    return "Moderate Chop";
  } else if (windSpeed >= 17.27 && windSpeed <= 23.016) {
    return "Choppy";
  } else if (windSpeed >= 23.017 && windSpeed <= 28.769) {
    return "Rough";
  } else {
    return "Very Rough";
  }
}
