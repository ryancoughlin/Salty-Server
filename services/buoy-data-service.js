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

      console.log(conditions.WVHT)

      return {
        waveHeight: parseFloat(conditions.WVHT) ? parseFloat(parseFloat(conditions.WVHT).toFixed(2)) : null,
        dominantWavePeriod: parseFloat(conditions.DPD) ? parseFloat(parseFloat(conditions.DPD).toFixed(2)) : null,
        windSpeed: parseFloat(conditions.WSPD) ? parseFloat(parseFloat(conditions.WSPD).toFixed(2)) : null,
        windDirection: parseFloat(conditions.WDIR) ? parseFloat(parseFloat(conditions.WDIR).toFixed(2)) : null,
        atmosphericPressure: parseFloat(conditions.PRES) ? parseFloat(parseFloat(conditions.PRES).toFixed(2)) : null,
        airTemperature: parseFloat(conditions.ATMP) ? parseFloat(parseFloat(conditions.ATMP).toFixed(2)) : null,
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
