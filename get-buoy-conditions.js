const axios = require('axios')

const baseURL = 'https://www.ndbc.noaa.gov/data/realtime2/'

async function getBuoyDataForLineChart(buoyID) {
  const dataURL = `${baseURL}${buoyID}.txt`

  try {
    const response = await axios.get(dataURL)
    const lines = response.data.split('\n')

    if (lines.length < 3) {
      console.log('No data available for this buoy.')
      return
    }

    const headers = lines[0].trim().split(/\s+/)
    const data = lines.slice(2).reverse() // Reverse the data to have it in chronological order

    const chartData = data.map((line) => {
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

    console.log(chartData)
  } catch (error) {
    console.error(`Error fetching data: ${error}`)
  }
}

// Replace '44025' with the buoy ID you want to look up
getBuoyDataForLineChart('44030')
