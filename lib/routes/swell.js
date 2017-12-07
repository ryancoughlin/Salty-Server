import swellHeight from '../swell-height'

const swellRoute = {
  method: 'GET',
  path: '/api/swell',
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    return swellHeight
      .fetchSwellHeights(latitude, longitude)
      .then(heights => {
        console.log(heights)
        reply(heights)
      })
      .catch(error => {
        console.log('ERROR:', error)
        reply({})
      })
  }
}

export default swellRoute
