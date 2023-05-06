const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MSWSpot = new Schema(
  {
    name: String,
    spotId: {
      type: String,
      index: { unique: true }
    },
    location: { type: { type: String }, coordinates: [Number] }
  },
  {
    collection: 'mswspots'
  }
)

MSWSpot.index({ location: '2dsphere' })
module.exports = mongoose.model('MSWSpot', MSWSpot)
