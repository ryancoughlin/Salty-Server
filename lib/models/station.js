const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StationSchema = new Schema({
  state: String,
  name: String,
  stationId: {
    type: String,
    index: { unique: true }
  },
  location: { type: { type: String }, coordinates: [Number] }
});

StationSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Station", StationSchema);
