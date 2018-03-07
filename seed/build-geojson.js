const fs = require('fs')
const GeoJSON = require('geojson')

const makeGeoJSON = stations => {
  return GeoJSON.parse(stations, {
    Point: ['location.coordinates[1]', 'location.coordinates[0]'],
    include: ['name', 'id']
  })
}

const writeFile = data => {
  if (data) {
    fs.writeFile(
      './seed/stations.geojson',
      JSON.stringify(data, 0, 4),
      function(err) {
        console.log('Successfully written!')
      }
    )
  } else {
    console.log('No data to write')
  }
}

const json = JSON.parse(fs.readFileSync('./seed/stations.json', 'utf8'))
const geojson = makeGeoJSON(json)
writeFile(geojson)
