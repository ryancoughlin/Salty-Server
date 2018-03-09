import Hapi from 'hapi'
import routes from './routes'

const server = new Hapi.Server({
  port: process.env.PORT || 5000,
  routes: {
    cors: {
      origin: ['http://localhost:3000', 'https://saltyswells.com']
    }
  }
})
server.route(routes)

server
  .start()
  .then(() => {
    console.log('Server running at:', server.info.uri)
  })
  .catch(err => {
    console.log(err)
  })
