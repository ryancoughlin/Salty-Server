import _ from 'lodash';

export default class {
  constructor(stations) {
    this.stations = stations
  }

  parseStationData() {
    return _.map(this.stations, function(station) {
      return {
        id: station.g,
        location: station.l
      }
    });
  }
}
