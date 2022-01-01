require("dotenv").config();
const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const Station = require("../models/station");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection Success!");

    const data = JSON.parse(
      fs.readFileSync("./seed/data/enhancedStation.json")
    );

    async.each(data, (s, callback) => {
      const station = new Station({
        state: s.state,
        name: s.name,
        stationId: s.stationId,
        location: {
          coordinates: s.location.coordinates,
          type: s.location.type,
        },
      });

      station.save(function (error) {
        if (error) {
          console.log(error);
        }

        console.log("Station is saved");

        callback();
      });
    }),
      (err) => {
        if (error) {
          console.log("Asyn error: ", error);
        }
      };
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });
