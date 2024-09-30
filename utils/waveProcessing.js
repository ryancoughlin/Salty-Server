// utils/waveProcessing.js
const moment = require('moment-timezone')

const convertMpsToMph = (speedMps) => speedMps * 2.237

const convertMetersToFeet = (heightMeters) => heightMeters * 3.281

const windSpeedToBeaufort = (speedMph) => {
  if (speedMph <= 1) return 0
  if (speedMph <= 3) return 1
  if (speedMph <= 7) return 2
  if (speedMph <= 12) return 3
  if (speedMph <= 18) return 4
  if (speedMph <= 24) return 5
  if (speedMph <= 31) return 6
  if (speedMph <= 38) return 7
  if (speedMph <= 46) return 8
  if (speedMph <= 54) return 9
  if (speedMph <= 63) return 10
  if (speedMph <= 72) return 11
  return 12
}

const toIsoString = (date) => {
  return new Date(date)
}

const formatConditions = (data) => {
  return data.map((row) => {
    const waveHeightFt = convertMetersToFeet(row.Thgt)
    const swellHeightFt = convertMetersToFeet(row.shgt)
    const windSpeedMph = convertMpsToMph(row.whgt)
    const windBeaufort = windSpeedToBeaufort(windSpeedMph)
    
    const latitude = row.location.coordinates[1]
    const longitude = row.location.coordinates[0]

    return {
      time: toIsoString(row.time),
      location: {
        latitude: latitude,
        longitude: longitude
      },
      waveHeight: parseFloat(waveHeightFt.toFixed(2)),
      wavePeriod: row.Tper,
      waveDirection: row.Tdir,
      swellHeight: parseFloat(swellHeightFt.toFixed(2)),
      swellPeriod: row.sper,
      swellDirection: row.sdir
    }
  })
}

module.exports = {
  formatConditions
}
