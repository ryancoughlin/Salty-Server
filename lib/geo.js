import mongoose from 'mongoose'

const Station = require('./models/station')
const EnhancedStation = require('./models/enhanced-station')

const MIN_DISTANCE = 0
const MAX_DISTANCE = 20000
const MAX_ENHANCED_STATION_DISTANCE = 75000
const MAX_DISTANCE_NEARBY_STATIONS = 14000

export function findStation(longitude, latitude) {
  return Station.findOne({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: MAX_DISTANCE
      }
    }
  })
    .then(stations => {
      return stations
    })
    .catch(error => {
      return error
    })
}

export function findEnhancedStation(longitude, latitude) {
  return EnhancedStation.findOne({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: MAX_DISTANCE
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

export function findNearbyStations(longitude, latitude) {
  return new Promise(function(resolve, reject) {
    Station.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: MAX_DISTANCE_NEARBY_STATIONS
        }
      }
    })
      .limit(6)
      .then(stations => {
        resolve(stations)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export function findAllStations() {
  return new Promise(function(resolve, reject) {
    Station.find({}, function(error, stations) {
      if (error) {
        reject(error)
      }

      resolve(stations)
    })
  })
}
