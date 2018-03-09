import { findNearbyStations } from '../geo'

const nearbyStationsRoute = {
  method: 'GET',
  path: '/api/nearby-stations',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return findNearbyStations(longitude, latitude)
      .then(stations => {
        return stations
      })
      .catch(error => {
        console.error(error)
        return []
      })
  }
}

export default nearbyStationsRoute
