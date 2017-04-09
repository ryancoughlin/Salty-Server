import mongoose from 'mongoose'
const Station = require('./station')

const MIN_DISTANCE = 0
const MAX_DISTANCE = 2500

export function findStation(longitude, latitude) {
  longitude = Number(longitude).toFixed(4)
  latitude = Number(latitude).toFixed(4)

  return new Promise(function(resolve, reject) {
    Station.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates:  [longitude, latitude],
          },
          $minDistance: MIN_DISTANCE,
          $maxDistance: MAX_DISTANCE,
        },
      }
    }, function(error, station) {
      if(error) {
        console.log(error)
      }
      resolve(station.stationId)
    })
  })
}

export function findAllStations() {
  return new Promise(function(resolve, reject) {
    Station.find({}, function(error, stations) {
      if(error) {
        console.log(error)
      }

      resolve(stations)
    })
  })
}
