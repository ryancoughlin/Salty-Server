import fetch from "node-fetch";
import moment from "moment";
import _ from "lodash";
import request from "./request";
import queryString from "query-string";

const NOAA_DATE_FORMAT = "YYYY-M-D HH:mm";
const API_DATE_FORMAT = "MM/DD/YYYY";

export function sortTides(tides) {
  const tidesByDay = _.groupBy(tides, function(station) {
    return moment(station.time).format(API_DATE_FORMAT);
  });

  return _.mapValues(tidesByDay, function(stations) {
    if (stations.length == 0) {
      return {};
    }

    const low1 = getLowest(stations);
    const low1Time = moment(low1.time);
    const low2 = getLowest(
      _.filter(stations, function(station) {
        const time = moment(station.time);
        return Math.abs(time.hour() - low1Time.hour()) >= 6;
      })
    );

    const high1 = getHighest(stations);
    const high1Time = moment(high1.time);
    const high2 = getHighest(
      _.filter(stations, function(station) {
        const time = moment(station.time);
        return Math.abs(time.hour() - high1Time.hour()) >= 6;
      })
    );

    const tidesToDisplay = [
      prettify(low1, "low"),
      prettify(low2, "low"),
      prettify(high1, "high"),
      prettify(high2, "high")
    ];

    return _.sortBy(_.omitBy(tidesToDisplay, _.isNull), function(station) {
      return moment(station.time);
    });
  });
}

const prettify = function(station, tide) {
  if (station) {
    return {
      time: station.time,
      height: station.height,
      tide: tide
    };
  } else {
    return null;
  }
};

function getLowest(stations) {
  return _.reduce(stations, (firstLow, station) => {
    if (!firstLow) {
      return station;
    } else if (firstLow.height > station.height) {
      return station;
    } else {
      return firstLow;
    }
  });
}

function getHighest(stations) {
  return _.reduce(stations, (firstHigh, station) => {
    if (!firstHigh) {
      return station;
    } else if (firstHigh.height < station.height) {
      return station;
    } else {
      return firstHigh;
    }
  });
}
