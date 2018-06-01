import request from 'request'
const csv = require('csvtojson')

const waveHeightRoute = {
  method: 'GET',
  path: '/api/wave-height',
  handler: (request, h) => {
    csv()
      .fromStream(
        request.get('http://www.ndbc.noaa.gov/data/realtime2/44013.spec')
      )
      .on('csv', csvRow => {
        // csvRow is an array
        console.log(csvRow)
      })
      .on('done', error => {})
  }
}

export default waveHeightRoute
