const MSWSpot = require("./models/msw-spot");

const MAX_DISTANCE = 50000;

export function findMSWSpot(latitude, longitude) {
  return MSWSpot.findOne({
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
    .then((spot) => {
      return spot;
    })
    .catch((error) => {
      return error;
    });
}
