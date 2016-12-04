import Hapi from 'hapi';
import { fetchForecast } from './forecast'
import { getStation, allStations } from './geo'
import { groupTides, fetchTides } from './noaa'
import WeatherFormatter from './weather-formatter'
import StationParser from './station-list-parser'
import TideFormatter from './tide-formatter'

const server = new Hapi.Server();

server.connection({ port: process.env.PORT || 5000 });

server.route({
  method: 'GET',
  path:'/api/get-data',
  handler: function ({ query: { lat: lat, lng: lng } }, reply) {
    const findStationPromise = getStation(lat, lng).then(stationId => {
      return groupTides(stationId);
    });

    const tidePromise = getStation(lat, lng).then(stationId => {
      return fetchTides(stationId, true);
    });

    const weatherPromise = fetchForecast(lat, lng);

    Promise.all([findStationPromise, weatherPromise, tidePromise]).then(([groupedTides, weather, tides]) => {
      const tideFormatter = new TideFormatter(groupedTides);
      const weatherFormatter = new WeatherFormatter(weather);

      reply({
        currentTidePhrase: tideFormatter.findCurrentTide(),
        tides: {
          formatted: groupedTides,
          hourly: tides,
        },
        nextTides: tideFormatter.findNextTides(),
        weather: weatherFormatter.format(),
      })

    }).catch(e => console.log(e));
  },
});

server.route({
  method: 'GET',
  path: '/api/get-stations',
  handler: function (request, reply) {
    allStations().then(function(stations) {
      const stationParser = new StationParser(stations)
      const formattedStations = stationParser.parseStationData()

      reply({
        formattedStations
      })

    }).catch(e => console.log(e));
  }
})

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
