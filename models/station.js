const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Station = new Schema({
  state: String,
  name: String,
  stationId: {
    type: String,
    index: { unique: true },
  },
  location: { type: { type: String }, coordinates: [Number] },
});

Station.index({ location: "2dsphere" });
module.exports = mongoose.model("Station", Station);
