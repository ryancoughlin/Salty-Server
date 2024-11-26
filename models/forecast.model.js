const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  timestamp: Date,
  latitude: Number,
  longitude: Number,
  waveHeight: Number,
  wavePeriod: Number,
  waveDirection: Number,
  windSpeed: Number,
  windDirection: Number,
});

module.exports = mongoose.model('Forecast', forecastSchema);