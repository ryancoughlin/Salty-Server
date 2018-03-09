import swellHeight from '../swell-height'

const swellRoute = {
  method: 'GET',
  path: '/api/swell',
  handler: (request, h) => {
    const { latitude, longitude } = request.query

    return swellHeight
      .fetchSwellHeights(latitude, longitude)
      .then(heights => {
        return heights
      })
      .catch(error => {
        console.error(error)
        return {}
      })
  }
}

export default swellRoute
