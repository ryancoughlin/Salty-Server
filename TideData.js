const axios = require('axios')

class TideData {
  constructor(station) {
    this.station = station // store the station object as an instance variable
    const today = new Date()
    const weekAway = new Date(today)
    weekAway.setDate(weekAway.getDate() + 6)
    const formatDate = (date) =>
      `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    this.apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${
      station.stationId
    }&begin_date=${formatDate(today)}&end_date=${formatDate(
      weekAway
    )}&product=predictions&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
  }

  async fetchData() {
    try {
      const response = await axios.get(this.apiUrl)
      return this.processData(response.data.predictions)
    } catch (error) {
      console.error(`Error fetching tide data: ${error}`)
      return []
    }
  }

  processData(predictions) {
    const dailyTides = {}

    for (const prediction of predictions) {
      const dateTime = new Date(prediction.t)
      const isoDateTime = dateTime.toISOString()
      const date = isoDateTime.split('T')[0]
      const value = parseFloat(prediction.v)

      if (!dailyTides[date]) {
        dailyTides[date] = {
          date,
          tides: []
        }
      }

      if (value) {
        dailyTides[date].tides.push({ height: value, time: isoDateTime })
      }
    }

    for (const date in dailyTides) {
      dailyTides[date].tides.sort((a, b) => new Date(a.time) - new Date(b.time))

      const maxTides = 4
      const highLowTides = []

      for (let i = 0; i < maxTides; i++) {
        highLowTides.push(
          i % 2 === 0
            ? dailyTides[date].tides.reduce((minTide, tide) =>
                tide.height < minTide.height ? tide : minTide
              )
            : dailyTides[date].tides.reduce((maxTide, tide) =>
                tide.height > maxTide.height ? tide : maxTide
              )
        )

        dailyTides[date].tides = dailyTides[date].tides.filter(
          (tide) => tide !== highLowTides[highLowTides.length - 1]
        )
      }

      dailyTides[date].tides = highLowTides
    }

    const tides = Object.values(dailyTides).flatMap(({ date, tides }) =>
      tides.map(({ height, time }, idx) => ({
        date,
        type: idx % 2 === 0 ? 'low' : 'high',
        height,
        time
      }))
    )

    return {
      name: this.station.name,
      id: this.station.stationId,
      latitude: this.station.location.coordinates[1],
      longitude: this.station.location.coordinates[0],
      tides
    }
  }
}
module.exports = TideData
