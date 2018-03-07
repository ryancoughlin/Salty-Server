const fs = require('fs')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const _ = require('lodash')

const url =
  'https://tidesandcurrents.noaa.gov/mdapi/latest/webapi/geogroups/1403/children.json'

fetch(url).then(res => {
  if (res.ok) {
    res.json().then(json => {
      const data = json.stationList
      const stations = data
        .filter(station => {
          station.stationId != ''
        })
        .map(station => {
          const { geoGroupName, stationId, lat, lon } = station
          return {
            stationId,
            state: 'massachusetts',
            name: geoGroupName,
            location: {
              coordinates: { lon, lat },
              type: 'Point'
            }
          }
        })

      writeFile(stations)
    })
  } else {
    console.error('Bad response')
  }
})

const writeFile = data => {
  console.log('Data is: ', data)

  if (data) {
    fs.writeFile('stations.json', JSON.stringify(data), function(err) {
      console.log('Successfully written!')
    })
  } else {
    console.log('No data to write')
  }
}
