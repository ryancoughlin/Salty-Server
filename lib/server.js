import Hapi from 'hapi';
import { fetchForecast } from './forecast'
import { findStation, findAllStations } from './geo'
import { groupTides, fetchTides } from './noaa'
import WeatherFormatter from './weather-formatter'
import StationParser from './station-list-parser'
import TideFormatter from './tide-formatter'

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000 });
server.route({
  method: 'GET',
  path:'/api/get-data',
  handler: function ({
    query: {
      latitude: latitude,
      longitude: longitude,
    }
  }, reply) {
    const findStationPromise = findStation(longitude, latitude).then(id => {
      return groupTides(id);
    });

    const tidePromise = findStation(longitude, latitude).then(id => {
      return fetchTides(id, true);
    });

    const weatherPromise = fetchForecast(latitude, longitude);

    Promise.all([findStationPromise, weatherPromise, tidePromise]).then(([groupedTides, weather, tides]) => {
      const tideFormatter = new TideFormatter(groupedTides);
      const weatherFormatter = new WeatherFormatter(weather);

      reply({
        tides: {
          formatted: groupedTides,
          hourly: tides,
          todaysTides: tideFormatter.todaysTides(),
        },
        weather: weatherFormatter.format(),
      })

    }).catch(e => console.log(e));
  },
});

server.route({
  method: 'GET',
  path: '/api/get-stations',
  handler: function (request, reply) {
    findAllStations().then(function(stations) {
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
