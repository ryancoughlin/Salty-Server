import { findAllStations } from '../geo'
import StationParser from '../station-list-parser'

module.exports = {
  method: 'GET',
  path: '/api/stations',
  handler: (request, h) => {
    return findAllStations()
      .then(function(stations) {
        const stationParser = new StationParser(stations)
        const allStations = stationParser.parseStationData()

        return allStations
      })
      .catch(error => console.error(error))
  }
}
