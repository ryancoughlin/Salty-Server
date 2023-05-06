//swell-forecast.js
import axios from 'axios'
import { findMSWSpot } from './findMSWSpot'

const SwellType = Object.freeze({
  SMOOTH_CALM: 'Smooth Calm',
  LIGHT_CHOP: 'Light Chop',
  MODERATE_CHOP: 'Moderate Chop',
  CHOPPY: 'Choppy',
  ROUGH: 'Rough',
  VERY_ROUGH: 'Very Rough'
})

function groupByDay(forecast) {
  return forecast.reduce((result, hour) => {
    const date = new Date(hour.timestamp * 1000)
    const day = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    result[day] = result[day] || []
    result[day].push(hour)
    return result
  }, {})
}

function formatSwellDataByHour(hour) {
  const date = new Date(hour.timestamp * 1000)
  const isoTimeString = date.toISOString()

  const type = (() => {
    const { speed } = hour.wind
    if (speed < 5.75) return SwellType.SMOOTH_CALM
    if (speed <= 11.51) return SwellType.LIGHT_CHOP
    if (speed <= 17.26) return SwellType.MODERATE_CHOP
    if (speed <= 23.016) return SwellType.CHOPPY
    if (speed <= 28.769) return SwellType.ROUGH
    return SwellType.VERY_ROUGH
  })()

  return {
    ...hour.swell.components.primary,
    time: isoTimeString,
    type
  }
}

function formatSwellData(forecast) {
  return forecast.map(formatSwellDataByHour)
}

const getSwellForecast = async (latitude, longitude) => {
  try {
    const spot = await findMSWSpot(latitude, longitude)

    if (!spot) {
      throw new Error('No spot found for the given coordinates')
    }

    const url = `https://magicseaweed.com/api/${process.env.MSW_KEY}/forecast?spot_id=${spot.spotId}&fields=timestamp,swell.*,wind.*`
    const response = await axios.get(url)
    const forecast = formatSwellData(response.data)
    return forecast
  } catch (error) {
    console.error(error)
    throw error
  }
}

export { getSwellForecast }
