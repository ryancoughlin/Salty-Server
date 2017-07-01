require("dotenv").config();
const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const EnhancedStation = require("./models/enhanced-station");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, err => {
  if (err) throw err;

  const data = JSON.parse(fs.readFileSync("./enhancedStation.json"));

  async.each(data, (s, callback) => {
    const station = new EnhancedStation({
      name: s.name,
      stationId: s.stationId,
      location: {
        coordinates: s.location.coordinates,
        type: s.location.type
      }
    });

    station.save(function(error) {
      if (error) {
        console.log(error);
      }

      console.log("Station is saved");

      callback();
    });
  }), err => {
    if (error) {
      console.log("Asyn error: ", error);
    }
  };
});
