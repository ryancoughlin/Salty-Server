require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const Station = require("./models/station");
const EnhancedStation = require("./models/enhanced-station");

const MAX_ENHANCED_STATION_DISTANCE = 75000;
const MAX_DISTANCE_NEARBY_STATIONS = 14000;

const client = new MongoClient(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function findStation(latitude, longitude) {
  const db = await client.connect();
  const collection = client.db("salty_prod").collection("stations");
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        $minDistance: 0,
        $maxDistance: 50000,
      },
    },
  };

  const nearbyStations = await collection.find(query).toArray();
  return nearbyStations[0];
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
      return station;
    })
    .catch((error) => {
      return error;
    });
}
