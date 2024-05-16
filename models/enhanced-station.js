const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EnhancedStation = new Schema({
  name: String,
  stationId: {
    type: String,
    index: { unique: true }
  },
  location: { type: { type: String }, coordinates: [Number] }
})

EnhancedStation.index({ location: '2dsphere' })
module.exports = mongoose.model('EnhancedStation', EnhancedStation)
