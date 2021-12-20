// Import Admin SDK
const firebase = require("firebase/app");
const admin = require("firebase-admin");
const geofirestore = require("geofirestore");
const fs = require("fs");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://salty-306220-default-rtdb.firebaseio.com",
});

const db = admin.firestore();
const geoRef = geofirestore.initializeApp(db);
const stationsRef = geoRef.collection("stations");
const stationsJSON = JSON.parse(
  fs.readFileSync("./seed/noaa/data/stations.json")
);

stationsJSON.stations.forEach((station) => {
  const coordinates = new admin.firestore.GeoPoint(
    station.location.latitude,
    station.location.longitude
  );
  stationsRef
    .add({
      name: station.name,
      id: station.id,
      coordinates: coordinates,
    })
    .then(() => {
      console.log("Added station: ", station.name);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
});
