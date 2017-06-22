import mongoose from "mongoose";
const Station = require("./models/station");
const EnhancedStation = require("./models/enhanced-station");

const MIN_DISTANCE = 0;
const MAX_DISTANCE = 200000;

export function findStation(longitude, latitude) {
  longitude = Number(longitude).toFixed(4);
  latitude = Number(latitude).toFixed(4);

  return new Promise(function(resolve, reject) {
    Station.findOne(
      {
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: MAX_DISTANCE
          }
        }
      },
      function(error, station) {
        if (error) {
          reject(error);
        }

        if (station) {
          resolve(station.stationId);
        } else {
          reject("No station found");
        }
      }
    );
  });
}

export function findEnhancedStation(longitude, latitude) {
  longitude = Number(longitude).toFixed(4);
  latitude = Number(latitude).toFixed(4);

  console.log(longitude, latitude);

  return new Promise(function(resolve, reject) {
    EnhancedStation.find(
      {
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $minDistance: MIN_DISTANCE,
            $maxDistance: MAX_DISTANCE
          }
        }
      },
      function(error, station) {
        console.log(station);
        if (error) {
          reject(error);
        }

        if (station) {
          resolve(station.stationId);
        } else {
          reject("No station found");
        }
      }
    );
  });
}

export function findAllStations() {
  return new Promise(function(resolve, reject) {
    Station.find({}, function(error, stations) {
      if (error) {
        reject(error);
      }

      resolve(stations);
    });
  });
}
