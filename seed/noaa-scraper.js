const fs = require('fs')
const fetch = require('node-fetch')
const _ = require('lodash')

const stateMapping = [
  {
    state: 'maine',
    id: 1401
  },
  {
    state: 'new_hampshire',
    id: 1405
  },
  {
    state: 'massachusetts',
    id: 1403
  }
]

const url =
  'https://tidesandcurrents.noaa.gov/mdapi/latest/webapi/geogroups/1405/children.json'

fetch(url).then(res => {
  if (res.ok) {
    res.json().then(json => {
      const data = json.stationList
      const stations = data
        .filter(station => {
          if (station.stationId) return true
        })
        .map(station => {
          const { geoGroupName, stationId, lat, lon } = station
          return {
            stationId,
            state: 'new_hampshire',
            name: geoGroupName,
            location: {
              coordinates: [lon, lat],
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
  if (data) {
    fs.writeFile(
      './seed/data/states/new_hampshire.json',
      JSON.stringify(data, 0, 4),
      function(err) {
        console.log('Successfully written!')
      }
    )
  } else {
    console.log('No data to write')
  }
}
