import axios from 'axios'

const baseURL = 'https://www.ndbc.noaa.gov/data/realtime2/'

const getBuoyData = async (buoyID) => {
  const dataURL = `${baseURL}${buoyID}.txt`
  try {
    const response = await axios.get(dataURL)
    const lines = response.data.split('\n')

    if (lines.length < 3) {
      return null
    }

    const headers = lines[0].trim().split(/\s+/)
    const data = lines.slice(2)

    const allData = data.map((line) => {
      const values = line.trim().split(/\s+/)
      const conditions = {}

      headers.forEach((header, index) => {
        conditions[header] = values[index]
      })

      return {
        waveHeight: parseFloat(conditions.WVHT) || null,
        dominantWavePeriod: parseFloat(conditions.DPD) || null,
        windSpeed: parseFloat(conditions.WSPD) || null,
        windDirection: parseFloat(conditions.WDIR) || null,
        atmosphericPressure: parseFloat(conditions.PRES) || null,
        airTemperature: parseFloat(conditions.ATMP) || null,
        timestamp:
          conditions.YY +
          '-' +
          conditions.MM +
          '-' +
          conditions.DD +
          ' ' +
          conditions.hh +
          ':' +
          conditions.mm +
          ' UTC'
      }
    })

    return allData
  } catch (error) {
    console.error(`Error fetching buoy data: ${error}`)
    return null
  }
}

export { getBuoyData }
