const mongoose = require('mongoose')

const waveForecastSchema = new mongoose.Schema(
  {
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
    time: {
      type: Date,
      required: true,
      index: true
    },
    waveHeight: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    wavePeriod: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    waveDirection: {
      type: Number,
      required: true,
      min: 0,
      max: 360,
      default: 0
    },
    windSpeed: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    windDirection: {
      type: Number,
      required: true,
      min: 0,
      max: 360,
      default: 0
    },
    source: {
      type: String,
      required: true,
      enum: ['NOAA', 'NDBC']
    }
  },
  {
    timestamps: true
  }
)

// Create compound index for location and time
waveForecastSchema.index({ location: '2dsphere' })
waveForecastSchema.index({ time: 1 })
waveForecastSchema.index({ location: '2dsphere', time: 1 })

// Add method to format data for API response
waveForecastSchema.methods.toAPI = function() {
  return {
    id: this._id,
    time: this.time,
    location: {
      type: this.location.type,
      coordinates: this.location.coordinates
    },
    measurements: {
      waveHeight: this.waveHeight,
      wavePeriod: this.wavePeriod,
      waveDirection: this.waveDirection,
      windSpeed: this.windSpeed,
      windDirection: this.windDirection
    },
    source: this.source,
    updatedAt: this.updatedAt
  };
};

const WaveForecast = mongoose.model('WaveForecast', waveForecastSchema)

module.exports = WaveForecast
