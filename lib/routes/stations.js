import { findAllStations } from "../geo";
import StationParser from "../station-list-parser";

module.exports = {
  method: "GET",
  path: "/api/stations",
  handler: function(request, reply) {
    findAllStations()
      .then(function(stations) {
        const stationParser = new StationParser(stations);
        const allStations = stationParser.parseStationData();

        reply({
          stations: allStations
        });
      })
      .catch(e => console.log(e));
  }
};
