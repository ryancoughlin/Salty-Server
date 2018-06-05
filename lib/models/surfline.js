const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Surfline = new Schema({
  name: String,
  spotId: {
    type: String,
    index: { unique: true }
  },
  location: { type: { type: String }, coordinates: [Number] }
});

Surfline.index({ "location.coordinates": "2dsphere" });
module.exports = mongoose.model("Surfline", Surfline);
