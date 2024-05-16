const mongoose = require('mongoose')

const waveForecastSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  depth: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  Tdir: { type: Number, required: true },
  Tper: { type: Number, required: true },
  Thgt: { type: Number, required: true },
  sdir: { type: Number, required: true },
  sper: { type: Number, required: true },
  shgt: { type: Number, required: true },
  wdir: { type: Number, required: true },
  wper: { type: Number, required: true },
  whgt: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
})

// Create the geospatial index
waveForecastSchema.index({ location: '2dsphere' })

const WaveForecast = mongoose.model('WaveForecast', waveForecastSchema)

module.exports = WaveForecast
