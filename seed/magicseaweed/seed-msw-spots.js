require("dotenv").config();
const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const MSWSpot = require("../../models/msw-spot");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) throw err;

  const data = JSON.parse(
    fs.readFileSync("./seed/magicseaweed/json/msw-ne-spots.json")
  );

  async.each(data, (s, callback) => {
    const station = new MSWSpot({
      name: s.name,
      spotId: s.spotId,
      location: {
        coordinates: s.location.coordinates,
        type: s.location.type,
      },
    });

    station.save(function (error) {
      if (error) {
        console.log(error);
      }

      console.log("Spot saved");

      callback();
    });
  }),
    (err) => {
      if (error) {
        console.log("Asyn error: ", error);
      }
    };
});
