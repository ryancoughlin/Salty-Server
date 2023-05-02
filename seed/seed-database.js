require("dotenv").config();
const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const NDBCBuoy = require("../models/ndbc-buoy.model.js");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection Success!");

    const data = JSON.parse(fs.readFileSync("./seed/data/NDBCBuoyData.json"));

    async.each(data, (s, callback) => {
      const station = new NDBCBuoy({
        name: s.name,
        id: s.id,
        location: {
          coordinates: [s.lon, s.lat],
          type: "Point",
        },
      });

      station.save(function (error) {
        if (error) {
          console.log(error);
        }

        console.log("NDBCBuoy is saved");

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
