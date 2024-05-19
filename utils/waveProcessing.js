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
    let overallCondition = 'Good'

    if (waveHeightFt > 4.92 || swellHeightFt > 3.28) {
      overallCondition = 'Poor'
    } else if (waveHeightFt > 1.64 || swellHeightFt > 1.64) {
      overallCondition = 'Fair'
    }

    if (windBeaufort >= 6) {
      overallCondition = 'Poor'
    } else if (windBeaufort >= 4) {
      overallCondition = 'Fair'
    }

    if (row.wdir >= 45 && row.wdir <= 135 && windSpeedMph > 15) {
      overallCondition = 'Poor'
    } else if (row.wdir >= 225 && row.wdir <= 315) {
      if (overallCondition !== 'Poor') {
        overallCondition = 'Good'
      }
    }

    if (row.Tper < 5) {
      overallCondition = 'Poor'
    } else if (row.Tper < 8) {
      if (overallCondition === 'Good') {
        overallCondition = 'Fair'
      }
    }

    return {
      time: toIsoString(row.time),
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      waveHeight: parseFloat(waveHeightFt.toFixed(2)),
      swellHeight: parseFloat(swellHeightFt.toFixed(2)),
      windSpeed: parseFloat(windSpeedMph.toFixed(2)),
      windDirection: row.wdir,
      wavePeriod: row.Tper,
      swellPeriod: row.sper,
      windBeaufort,
      overallCondition
    }
  })
}

const generateOneLiner = (data) => {
  const goodCount = data.filter((d) => d.overallCondition === 'Good').length
  const fairCount = data.filter((d) => d.overallCondition === 'Fair').length
  const poorCount = data.filter((d) => d.overallCondition === 'Poor').length

  if (goodCount > fairCount && goodCount > poorCount) {
    return "It's a good day to go out on the water."
  } else if (fairCount > goodCount && fairCount > poorCount) {
    return 'Conditions are fair. Exercise caution.'
  } else {
    return "It's not a good day to go out on the water."
  }
}

module.exports = {
  formatConditions
}
