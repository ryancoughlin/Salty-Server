import fetch from 'node-fetch';
import moment from 'moment';
import _ from 'lodash';

const NOAA_DATE_FORMAT = 'YYYY-M-D HH:mm'
const API_DATE_FORMAT = 'MM/DD/YYYY'

export function groupTides(stationId) {
  return fetchTides(stationId, false).then((tides) => {
    const tidesByDay = _.groupBy(tides, function(station) {
      return moment(station.time).format(API_DATE_FORMAT)
    });

    return _.mapValues(tidesByDay, function(stations) {
      if(stations.length == 0) {
        return {}
      }

      const low1 = getLowest(stations);
      const low1Time = moment(low1.time)
      const low2 = getLowest(
        _.filter(stations, function(station) {
          const time = moment(station.time)
          return Math.abs(time.hour() - low1Time.hour()) >= 6;
        })
      );

      const high1 = getHighest(stations);
      const high1Time = moment(high1.time)
      const high2 = getHighest(
        _.filter(stations, function(station) {
          const time = moment(station.time)
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
        return moment(station.time)
      })
    });
  });
}

export function fetchTides(stationId, isForCharts) {
  var tideUrl = tidePredictionsQueryParameters(stationId);
  if (isForCharts) {
    tideUrl = urlForTideChartQuery(stationId);
  } else {
    tideUrl = urlForTideQuery(stationId);
  }

  return fetch(tideUrl)
    .then(res => res.json())
    .then(json => {
      return _.map(json.predictions, function(prediction) {
        return {
          time: prediction.t,
          height: Math.round(prediction.v * 10) / 10
        }
      });
    })
    .catch(e => console.log(e));
}

const prettify = function(station, tide) {
  if(station) {
    return {
      time: station.time,
      height: station.height,
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

function tidePredictionsQueryParameters(stationId, startDate, endDate) {
  return {
    'station': stationId,
    'begin_date': startDate,
    'end_date': endDate,
    'product': 'predictions',
    'units': 'english',
    'time_zone': 'lst',
    'datum': 'mllw',
    'format': 'json',
  }
}

function tideChartQueryParameters(stationId, startDate, endDate) {
  return {
    'station': stationId,
    'begin_date': startDate,
    'end_date': endDate,
    'interval': 'h',
    'product': 'predictions',
    'units': 'english',
    'time_zone': 'lst',
    'datum': 'mllw',
    'format': 'json',
  }
}

function urlForTideChartQuery(stationId) {
  const yesterday = moment().add(-1, 'days').format(API_DATE_FORMAT)
  const future = moment(yesterday, API_DATE_FORMAT).add(1, 'days').format(API_DATE_FORMAT)
  const queryParameters = tideChartQueryParameters(stationId, yesterday, future)
  const encodedData = encodeData(queryParameters);

  return `http://tidesandcurrents.noaa.gov/api/datagetter?${encodedData}`
}

function urlForTideQuery(stationId) {
  const yesterday = moment().add(-1, 'days').format(API_DATE_FORMAT)
  const future = moment(yesterday, API_DATE_FORMAT).add(7, 'days').format(API_DATE_FORMAT)
  const queryParameters = tidePredictionsQueryParameters(stationId, yesterday, future)
  const encodedData = encodeData(queryParameters);

  return `http://tidesandcurrents.noaa.gov/api/datagetter?${encodedData}`
}

function encodeData(data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}
