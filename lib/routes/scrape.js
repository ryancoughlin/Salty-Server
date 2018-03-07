const fs = require('fs')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const _ = require('lodash')

const scrapeRoute = {
  method: 'GET',
  path: '/api/scrape',
  handler: function(request, h) {
    const url =
      'https://tidesandcurrents.noaa.gov/mdapi/latest/webapi/geogroups/1403/children.json'

    fetch(url)
      .then(res => {
        if (res.ok) {
          res.json().then(json => {
            const stations = json.stationList
            const formatted = stations.map(station => {
              const { geoGroupName, stationId, lat, lon } = station
              if (stationId) {
                return {
                  stationId,
                  state: s.state,
                  name: geoGroupName,
                  location: {
                    coordinates: { lon, lat },
                    type: 'Point'
                  }
                }
              }
            })

            fs.writeFile(
              'stations.json',
              JSON.stringify(formatted, null, 4),
              function(err) {
                console.log(
                  'File successfully written! - Check your project directory for the output.json file'
                )
              }
            )

            return formatted
          })
        } else {
          console.error('Bad response')
        }
      })
      .catch(error => {
        return error
        console.error(error)
      })
  }
}

export default scrapeRoute
