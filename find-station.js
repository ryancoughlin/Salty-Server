const { ObjectId } = require('mongodb')

async function findStation(db, latitude, longitude) {
  const collection = db.collection('stations')
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        },
        $minDistance: 0,
        $maxDistance: 50000
      }
    }
  }

  const nearbyStations = await collection.find(query).toArray()
  return nearbyStations[0]
}

module.exports = {
  findStation
}
