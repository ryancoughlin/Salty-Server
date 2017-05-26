import _ from "lodash";

export default class {
  constructor(stations) {
    this.stations = stations;
  }

  parseStationData() {
    return _.map(this.stations, function(station) {
      return {
        id: station.stationId,
        name: station.name,
        location: {
          latitude: station.location.coordinates[1],
          longitude: station.location.coordinates[0]
        }
      };
    });
  }
}
