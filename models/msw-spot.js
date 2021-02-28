const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MSWSpot = new Schema({
  name: String,
  spotId: {
    type: String,
    index: { unique: true }
  },
  location: { type: { type: String }, coordinates: [Number] }
});

MSWSpot.index({ "location.coordinates": "2dsphere" });
module.exports = mongoose.model("MSWSpot", MSWSpot);
