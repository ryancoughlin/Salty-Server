const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  state: String,
  type: {
    type: String,
    enum: ['tide', 'current'],
    required: true
  },
  timezone: String,
  datumMHHW: Number,
  datumMSL: Number,
  datumMLLW: Number
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
spotSchema.index({ location: '2dsphere' });

const Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
