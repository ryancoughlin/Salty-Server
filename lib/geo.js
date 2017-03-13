import mongoose from 'mongoose'
const Station = require('./station')

export function findStation(longitude, latitude) {
  const maxDistance = 10 / 6371

  return new Promise(function(resolve, reject) {
    Station.findOne({
      location: {
        $nearSphere: [longitude, latitude],
        $maxDistance: maxDistance
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
