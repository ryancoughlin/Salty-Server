const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();

admin.initializeApp();
const geo = require('geofirex').init(admin);

app.use(cors({ origin: true }));

app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

app.post('/api/nearby-stations', (req, res) => {
	(async () => {
		try {
			const stations = firestore().collection('stations');
			const center = geo.point(43.088127, -70.736137);
			const radius = 100;
			const field = 'stations';
			const query = geo.query(stations).within(center, radius, field);
			console.log(query);
			const stationQuery = await db.collection("stations").get();
			const nearbyStations = [];
			const {
			  latitude,
			  longitude
			} = req.query;
			const station = await findStation(latitude, longitude);
			stationQuery.forEach(doc => {
			  nearbyStations.push({
				id: doc.id,
				data: doc.data()
			  });
			});

			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	  })();
  });

exports.app = functions.https.onRequest(app);