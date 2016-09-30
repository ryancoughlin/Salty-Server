import Hapi from 'hapi';
import { fetchForecast } from './forecast'
import { getStation } from './geo'
import { fetchNextTides } from './noaa'
import WeatherFormatter from './weather-formatter'
import TideFormatter from './tide-formatter'

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.route({
    method: 'GET',
    path:'/api/get-data',
    handler: function ({ query: { lat: lat, lng: lng } }, reply) {
      const stationsPromise = getStation(lat, lng).then(function(stationId) {
        return fetchNextTides(stationId);
      });

      const weatherPromise = fetchForecast(lat, lng);

      Promise.all([stationsPromise, weatherPromise]).then(([nextTides, weather]) => {
        const formatter = new WeatherFormatter(weather);
        const tideFormatter = new TideFormatter(nextTides);

        reply({
          currentTidePhrase: tideFormatter.findCurrentTide(),
          tides: nextTides,
          weather: formatter.format(),
        })

      }).catch(e => console.log(e));;
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
