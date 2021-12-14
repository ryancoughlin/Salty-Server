const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

admin.initializeApp();
const db = admin.firestore();
const geo = require("geofirex").init(admin);

app.use(cors({origin: true}));

app.post("/nearby-stations", (req, res) => {
  (async () => {
    try {
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
