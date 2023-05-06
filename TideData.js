const axios = require('axios')

class TideData {
  constructor(stationId) {
    const today = new Date()
    const weekAway = new Date(today)
    weekAway.setDate(weekAway.getDate() + 6)
    const formatDate = (date) =>
      `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    this.apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationId}&begin_date=${formatDate(
      today
    )}&end_date=${formatDate(
      weekAway
    )}&product=predictions&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
    console.log(this.apiUrl)
  }

  async fetchData() {
    try {
      console.log(this.apiUrl)
      const response = await axios.get(this.apiUrl)
      return this.processData(response.data.predictions)
    } catch (error) {
      console.error(`Error fetching tide data: ${error}`)
      return []
    }
  }

  processData(predictions) {
    const dailyTides = predictions.reduce((accumulator, prediction, index) => {
      if (index === 0 || index === predictions.length - 1) {
        return accumulator
      }

      const prevValue = parseFloat(predictions[index - 1].v)
      const value = parseFloat(prediction.v)
      const nextValue = parseFloat(predictions[index + 1].v)

      const dateTime = new Date(prediction.t)
      const isoDateTime = dateTime.toISOString()
      const date = isoDateTime.split('T')[0]

      if (value > prevValue && value > nextValue) {
        // High tide
        const tide = { type: 'high', height: value, timestamp: isoDateTime }
        if (!accumulator[date]) {
          accumulator[date] = { tides: [tide] }
        } else {
          accumulator[date].tides.push(tide)
        }
      } else if (value < prevValue && value < nextValue) {
        // Low tide
        const tide = { type: 'low', height: value, timestamp: isoDateTime }
        if (!accumulator[date]) {
          accumulator[date] = { tides: [tide] }
        } else {
          accumulator[date].tides.push(tide)
        }
      }

      return accumulator
    }, {})

    return Object.entries(dailyTides).map(([date, tideInfo]) => ({
      date,
      tides: tideInfo.tides
    }))
  }
}

module.exports = TideData
