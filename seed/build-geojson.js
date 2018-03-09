const fs = require('fs')
const GeoJSON = require('geojson')

const SOURCE_FILE = './seed/data/all-stations.json'
const OUTPUT_FILE = './seed/data/stations.geojson'

const makeGeoJSON = json => {
  return GeoJSON.parse(json.stations, {
    Point: ['location.latitude', 'location.longitude'],
    include: ['name', 'id']
  })
}

const writeFile = data => {
  if (data) {
    fs.writeFile(OUTPUT_FILE, JSON.stringify(data, 0, 4), function(err) {
      console.log('Successfully written!')
    })
  } else {
    console.log('No data to write')
  }
}

const json = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'))
const geojson = makeGeoJSON(json)
writeFile(geojson)
