import swellHeight from '../swell-height'

const swellRoute = {
  method: 'GET',
  path: '/api/swell',
  handler: function(request, h) {
    const pararms = request.params

    return swellHeight
      .fetchSwellHeights(params.latitude, params.longitude)
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
