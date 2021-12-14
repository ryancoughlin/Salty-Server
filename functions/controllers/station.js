import {db} from '../config/firebase.js';

// const geo = require("geofirex").init(admin);

const nearbyStations = async (req, res) => {
  try {
    const stations = await db.collection('stations').get();
    return res.status(200).json(stations.docs);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export {nearbyStations};
