// Add this line at the beginning of your file
const { ObjectId } = require("mongodb");

async function findStation(db, latitude, longitude) {
  console.log("In findStation function"); // Add this line

  const collection = db.collection("stations");
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

  console.log("Query:", query); // Add this line

  const nearbyStations = await collection.find(query).toArray();
  return nearbyStations[0];
}

module.exports = {
  findStation,
};
