import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import {nearbyStations} from './controllers/station.js';
import {db} from './config/firebase.js';

const app = express();
app.use(cors({origin: true}));
app.get('/nearby-stations', nearbyStations);
app.get('/', (req, res) => res.status(200).send('Hey there!'));

export const api = functions.https.onRequest(app);

