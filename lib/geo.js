import firebase from 'firebase';
import geofire from 'geofire';

firebase.initializeApp({
  databaseURL: 'https://salty-19e5e.firebaseio.com',
  serviceAccount: 'Salty-65b8c27aaef5.json'
});

const firebaseRef = firebase.database().ref('stations')
const geoFire = new geofire(firebaseRef);

export function getStation(lat, lng) {
  const geoQuery = geoFire.query({
    center: [parseFloat(lat), parseFloat(lng)],
    radius: 30
  });

  return new Promise(function(resolve, reject) {
    geoQuery.on('key_entered', function(id, location) {
      resolve(id);
    });
  });
}

export function allStations() {
  return new Promise(function(resolve, reject) {
    firebaseRef.on('value', function(snapshot) {
      resolve(snapshot.val())
    })
  });
}
