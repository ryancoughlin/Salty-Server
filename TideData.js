// TideData.js
const axios = require('axios')
const { getApiUrl } = require('./utils')

const fetchTidePredictions = (station) => ({
  fetchData: async () => {
    try {
      const apiUrl = getApiUrl(station)
      const response = await axios.get(apiUrl)
      if (!response.data.predictions) {
        console.error('Unexpected API response:', response.data)
        return []
      }
      return processData(response.data.predictions)
    } catch (error) {
      console.error(`Error fetching tide data: ${error}`)
      return []
    }
  }
})

const processData = (predictions) => {
  return predictions.map((prediction) => {
    const dateTime = new Date(prediction.t)
    const isoDateTime = dateTime.toISOString()
    const date = isoDateTime.split('T')[0]
    const value = parseFloat(prediction.v)

    return { date, time: isoDateTime, height: value, type: prediction.type }
  })
}

module.exports = fetchTidePredictions
