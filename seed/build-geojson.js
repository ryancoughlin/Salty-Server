const fs = require('fs')
const GeoJSON = require('geojson')

const makeGeoJSON = stations => {
  return GeoJSON.parse(stations, {
    Point: ['location.latitude', 'location.longitude'],
    include: ['name', 'id']
  })
}

const writeFile = data => {
  if (data) {
    fs.writeFile(
      './seed/data/stations.geojson',
      JSON.stringify(data, 0, 4),
      function(err) {
        console.log('Successfully written!')
      }
    )
  } else {
    console.log('No data to write')
  }
}

const json = JSON.parse(fs.readFileSync('./seed/data/stations.json', 'utf8'))
const geojson = makeGeoJSON(json)
writeFile(geojson)
