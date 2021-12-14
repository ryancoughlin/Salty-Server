import {db, admin} from '../config/firebase.js';
import geofirex from 'geofirex'; 
import geofirestore from 'geofirestore';
import geofire from 'geofire-common';

// const geo = geofirex.init(admin);
// const Geo = geofirestore.initializeApp(admin);

const nearbyStations = async (req, res) => {
  try {

  const center = [43.3567, -70.7361];
  const radiusInM = 50 * 1000;


  // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
  // a separate query for each pair. There can be up to 9 pairs of bounds
  // depending on overlap, but in most cases there are 4.
  const bounds = geofire.geohashQueryBounds(center, radiusInM);
  const promises = [];
  for (const b of bounds) {
    const q = db.collection('stations')
      .orderBy('geohash')
      .startAt(b[0])
      .endAt(b[1]);
  
    promises.push(q.get());
  }
  
  // Collect all the query results together into a single list
  Promise.all(promises).then((snapshots) => {
    const matchingDocs = [];
  
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const lat = doc.get('latitude');
        const lng = doc.get('longitude');
  
        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const distanceInKm = geofire.distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      }
    }
  
    return matchingDocs;
  }).then((matchingDocs) => {
    return res.status(200).json(matchingDocs);
    console.log(matchingDocs)
  });
  
  
  const stationsSnapshot = await db.collection('stations').get()
  const stations = stationsSnapshot.docs.map(doc => doc.data());

   
  return res.status(200).json("test");
  } catch (error) {
  console.log("Error: ", error.message)
  return res.status(500).json(error.message);
  }
};

export {nearbyStations};