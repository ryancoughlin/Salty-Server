const Station = require('./models/station')
const EnhancedStation = require('./models/enhanced-station')

const MIN_DISTANCE = 0
const MAX_DISTANCE = 50000
const MAX_ENHANCED_STATION_DISTANCE = 75000
const MAX_DISTANCE_NEARBY_STATIONS = 14000

export function findStation(location) {
  return Station.findOne({
	location: {
	  $nearSphere: {
		$geometry: {
		  type: 'Point',
		  coordinates: [location.longitude, location.latitude]
		},
		$maxDistance: MAX_DISTANCE
	  }
	}
  })
	.then(stations => {
		console.log("Stations near me: ", stations)
		return stations
	})
	.catch(error => {
		console.error(error)
	  return error
	})
}

const findEnhancedStation = (longitude, latitude) => {
  return EnhancedStation.findOne({
	location: {
	  $nearSphere: {
		$geometry: {
		  type: 'Point',
		  coordinates: [longitude, latitude]
		},
		$maxDistance: MAX_ENHANCED_STATION_DISTANCE
	  }
	}
  })
	.then(station => {
	  return station
	})
	.catch(error => {
	  return error
	})
}