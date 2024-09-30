const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  type: { type: String, enum: ["Point"], required: true },
  coordinates: { type: [Number], required: true },
});

const SpotSchema = new Schema(
  {
    type: { type: String, enum: ["station", "buoy", "spot"], required: true },
    state: String,
    name: String,
    id: {
      type: String,
      index: { unique: true },
    },
    location: { type: LocationSchema, required: true },
    station_type: {
      type: String,
      enum: ["harmonic", "subordinate", null],
      default: null,
    },
    referenceId: { type: String, default: null },
  },
  {
    collection: "spots",
  }
);

SpotSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Spot", SpotSchema);
