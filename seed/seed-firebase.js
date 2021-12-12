// Import Admin SDK
const admin = require("firebase-admin");
const geofire = require("geofire-common");

const fs = require("fs");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://salty-306220-default-rtdb.firebaseio.com",
});

const db = admin.firestore();
const batch = db.batch();
const ref = db.collection("stations");

const stations = JSON.parse(fs.readFileSync("./seed/noaa/data/stations.json"));

stations.stations.forEach((station) => {
  const hash = geofire.geohashForLocation([
    station.location.latitude,
    station.location.longitude,
  ]);

  ref
    .doc(station.id)
    .set({
      id: station.id,
      name: station.name,
      location: new admin.firestore.GeoPoint(
        station.location.latitude,
        station.location.longitude
      ),
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      geohash: hash,
    })
    .then(() => {
      console.log("Station added.");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
});
