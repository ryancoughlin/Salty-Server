import {db, admin} from '../config/firebase.js';
import geofirex from 'geofirex'; 
import geofirestore from 'geofirestore';

const geo = geofirex.init(admin);
const Geo = geofirestore.initializeApp(admin);

const nearbyStations = async (req, res) => {
  try {

  const stationsSnapshot = await db.collection('stations').get()
  const stations = stationsSnapshot.docs.map(doc => doc.data());

  const center = geo.point(43.0881, -70.7361);
  const radius = 100;
  const field = 'location';
  
  // const query = geo.query(foo).within(center, radius, field);
  // query.subscribe(console.log);
  // 
  // const stations = Geo.collection('stations');
  // const stations = Geo.collection('stations');
  
  // const query = snapshot.near({ center: new firebase.firestore.GeoPoint(43.0881, -70.7361), radius: 200 });
  // console.log("QUERY----------------", query)
  // // 
  // query.get().then((value) => {
  //   // All GeoDocument returned by GeoQuery, like the GeoDocument added above
  //   console.log(value.docs);
  // });
  
   
  return res.status(200).json("test");
  } catch (error) {
  console.log("Error: ", error.message)
  return res.status(500).json(error.message);
  }
};

export {nearbyStations};