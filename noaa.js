import fetch from 'node-fetch';
import moment from 'moment';
import _ from 'lodash';

const NOAA_URL = 'http://tidesandcurrents.noaa.gov/api/datagetter?date=recent&range=5&product=one_minute_water_level&units=english&time_zone=lst&format=json&datum=mllw&station=';
export function fetchNextTides(stationId) {
  return fetchTides(stationId).then((allStations) => {
    const tidesByDay = _.groupBy(allStations, function(station) {
      const time = moment(station.t, "YYYY-M-D HH:mm")
      return time.format('DD/MM/YYYY')
    });

    const today = moment().add(-1, 'days').format('DD/MM/YYYY');

    return _.mapValues(tidesByDay, function(stations) {
      if(stations.length == 0) {
        return {}
      }

      const low1 = getLowest(stations);
      const low1Time = moment(low1.t, "YYYY-M-D HH:mm")
      const low2 = getLowest(
        _.filter(stations, function(station) {
          const time = moment(station.t, "YYYY-M-D HH:mm")
          return Math.abs(time.hour() - low1Time.hour()) >= 6;
        })
      );

      const high1 = getHighest(stations);
      const high1Time = moment(high1.t, "YYYY-M-D HH:mm")
      const high2 = getHighest(
        _.filter(stations, function(station) {
          const time = moment(station.t, "YYYY-M-D HH:mm")
          return Math.abs(time.hour() - high1Time.hour()) >= 6;
        })
      );

      const tidesToDisplay = [
        prettify(low1, 'low'),
        prettify(low2, 'low'),
        prettify(high1, 'high'),
        prettify(high2, 'high')
      ];

      return _.sortBy(_.omitBy(tidesToDisplay, _.isNull), function(station) {
        return moment(station.time, "YYYY-M-D HH:mm")
      })
    });
  });
}

const prettify = function(station, tide) {
  if(station){
    return {
      time: station.t,
      height: station.v,
      tide: tide
    }
  } else {
    return null;
  }
}

function getLowest(stations) {
  return _.reduce(stations, (firstLow, station) => {
    if (!firstLow) {
      return station;
    } else if (firstLow.v > station.v) {
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
    } else if (firstHigh.v < station.v) {
      return station;
    } else {
      return firstHigh;
    }
  });
}

function fetchTides(stationId) {
  return fetch(NOAA_URL + stationId)
    .then(res => res.json())
    .then(json => json.data)
}
