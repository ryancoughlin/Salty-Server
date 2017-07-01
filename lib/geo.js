import mongoose from "mongoose";

const Station = require("./models/station");
const EnhancedStation = require("./models/enhanced-station");

const MIN_DISTANCE = 0;
const MAX_DISTANCE = 20000;
const MAX_ENHANCED_STATION_DISTANCE = 75000;

export function findStation(longitude, latitude) {
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
          reject("No station found within set radius");
        }
      }
    );
  });
}

export function findEnhancedStation(longitude, latitude) {
  return new Promise(function(resolve, reject) {
    EnhancedStation.findOne(
      {
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $minDistance: MIN_DISTANCE,
            $maxDistance: MAX_ENHANCED_STATION_DISTANCE
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
          reject("No enhanced station found");
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
