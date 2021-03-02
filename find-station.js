const Station = require("./models/station");
const EnhancedStation = require("./models/enhanced-station");

const MIN_DISTANCE = 0;
const MAX_DISTANCE = 50000;
const MAX_ENHANCED_STATION_DISTANCE = 75000;
const MAX_DISTANCE_NEARBY_STATIONS = 14000;

export function findStation(latitude, longitude) {
  return Station.findOne({
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: MAX_DISTANCE,
      },
    },
  })
    .then((stations) => {
      console.log("Stations near me: ", stations);
      return stations;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
}

// Stations that support water temperature
export function findEnhancedStation(latitude, longitude) {
  return EnhancedStation.findOne({
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: MAX_ENHANCED_STATION_DISTANCE,
      },
    },
  })
    .then((station) => {
      console.log(station);
      return station;
    })
    .catch((error) => {
      return error;
    });
}
