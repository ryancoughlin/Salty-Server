const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Buoy = new Schema(
  {
    name: String,
    id: {
      type: String,
      index: { unique: true },
    },
    location: { type: { type: String }, coordinates: [Number] },
  },
  {
    collection: "ndbcbuoys",
  }
);

Buoy.index({ location: "2dsphere" });

module.exports = mongoose.model("Buoy", Buoy);
