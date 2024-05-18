const processWaveForecast = (predictions) => {
  return predictions.map((prediction) => {
    const dateTime = new Date(prediction.time)
    const date = dateTime.toISOString().split('T')[0]
    const time = dateTime.toISOString().split('T')[1].split('.')[0]

    return {
      date,
      time,
      waveHeight: parseFloat(prediction.Thgt),
      wavePeriod: parseFloat(prediction.Tper),
      waveDirection: parseInt(prediction.Tdir),
      swellHeight: parseFloat(prediction.shgt),
      swellPeriod: parseFloat(prediction.sper),
      swellDirection: parseInt(prediction.sdir),
      windHeight: parseFloat(prediction.whgt),
      windPeriod: parseFloat(prediction.wper),
      windDirection: parseInt(prediction.wdir)
    }
  })
}

const filterNext24Hours = (forecast) => {
  const now = new Date()
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return forecast.filter((entry) => {
    const entryTime = new Date(`${entry.date}T${entry.time}Z`)
    return entryTime >= now && entryTime <= next24Hours
  })
}

const getBeaufortScale = (windSpeed) => {
  if (windSpeed < 1) return 0
  if (windSpeed <= 5) return 1
  if (windSpeed <= 11) return 2
  if (windSpeed <= 19) return 3
  if (windSpeed <= 28) return 4
  if (windSpeed <= 38) return 5
  if (windSpeed <= 49) return 6
  if (windSpeed <= 61) return 7
  if (windSpeed <= 74) return 8
  if (windSpeed <= 88) return 9
  if (windSpeed <= 102) return 10
  if (windSpeed <= 117) return 11
  if (windSpeed <= 133) return 12
  return 12 // Beyond 133 km/h, treat as Hurricane
}

const getConditionScore = (entry) => {
  const waveHeightScore =
    entry.waveHeight < 1.0 ? 1 : entry.waveHeight < 2.0 ? 2 : 3
  const swellHeightScore =
    entry.swellHeight < 0.5 ? 1 : entry.swellHeight < 1.5 ? 2 : 3
  const swellPeriodScore =
    entry.swellPeriod < 8 ? 1 : entry.swellPeriod < 12 ? 2 : 3
  const windSpeedScore = getBeaufortScale(entry.windHeight * 1.94) // Convert m/s to knots for Beaufort scale
  const windDirectionScore =
    entry.windDirection >= 270 || entry.windDirection <= 90 ? -1 : 1 // West winds favorable, East winds unfavorable

  const totalScore =
    waveHeightScore +
    swellHeightScore +
    swellPeriodScore +
    windSpeedScore +
    windDirectionScore

  return totalScore <= 3 ? 'Good' : totalScore <= 6 ? 'Moderate' : 'Rough'
}

const evaluateConditions = (forecast) => {
  return forecast.map((entry) => ({
    ...entry,
    condition: getConditionScore(entry)
  }))
}

const analyzeTrends = (evaluatedForecast) => {
  const groupByTime = (period) => {
    return evaluatedForecast.filter((e) => {
      const hour = parseInt(e.time.split(':')[0])
      if (period === 'morning') return hour < 12
      if (period === 'afternoon') return hour >= 12 && hour < 18
      if (period === 'evening') return hour >= 18
    })
  }

  const getAverageCondition = (conditions) => {
    if (conditions.length === 0)
      return { avgWaveHeight: 0, avgWindSpeed: 0, avgCondition: 'Rough' }

    const avgWaveHeight =
      conditions.reduce((acc, curr) => acc + curr.waveHeight, 0) /
      conditions.length
    const avgWindSpeed =
      conditions.reduce((acc, curr) => acc + curr.windHeight, 0) /
      conditions.length
    const avgCondition = getConditionScore({
      waveHeight: avgWaveHeight,
      swellHeight:
        conditions.reduce((acc, curr) => acc + curr.swellHeight, 0) /
        conditions.length,
      swellPeriod:
        conditions.reduce((acc, curr) => acc + curr.swellPeriod, 0) /
        conditions.length,
      windHeight: avgWindSpeed,
      windDirection:
        conditions.reduce((acc, curr) => acc + curr.windDirection, 0) /
        conditions.length
    })

    return { avgWaveHeight, avgWindSpeed, avgCondition }
  }

  const morningAvg = getAverageCondition(groupByTime('morning'))
  const afternoonAvg = getAverageCondition(groupByTime('afternoon'))
  const eveningAvg = getAverageCondition(groupByTime('evening'))

  return { morningAvg, afternoonAvg, eveningAvg }
}

const generateOneLiner = (trends) => {
  const { morningAvg, afternoonAvg, eveningAvg } = trends

  const getTrendDescription = (morning, afternoon, evening) => {
    if (
      morning.avgCondition === 'Good' &&
      afternoon.avgCondition === 'Good' &&
      evening.avgCondition === 'Good'
    ) {
      return 'Conditions are good for being on the water all day.'
    } else if (
      morning.avgCondition === 'Rough' &&
      afternoon.avgCondition === 'Rough' &&
      evening.avgCondition === 'Rough'
    ) {
      return 'Conditions are rough all day; exercise extreme caution.'
    } else if (
      morning.avgCondition === 'Good' &&
      (afternoon.avgCondition !== 'Good' || evening.avgCondition !== 'Good')
    ) {
      return 'Great conditions this morning, but watch for increasing waves and wind later today.'
    } else if (
      morning.avgCondition !== 'Good' &&
      afternoon.avgCondition === 'Good'
    ) {
      return 'Conditions improve this afternoon; a good time to be on the water.'
    } else if (
      morning.avgCondition !== 'Good' &&
      evening.avgCondition === 'Good'
    ) {
      return 'Conditions improve this evening; a good time to be on the water.'
    } else {
      return 'Check detailed forecast for varying water conditions today.'
    }
  }

  const trendDescription = getTrendDescription(
    morningAvg,
    afternoonAvg,
    eveningAvg
  )

  return trendDescription
}

module.exports = {
  processWaveForecast,
  filterNext24Hours,
  evaluateConditions,
  analyzeTrends,
  generateOneLiner
}
