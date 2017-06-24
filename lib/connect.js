import mongoose from 'mongoose'

module.exports = function connectToMongo() {
  return new Promise(function(resolve, reject) {
    mongoose.connect(process.env.MONGODB_URI)
    mongoose.connection.on('connected', function() {
        resolve()
    })

    mongoose.connection.on('error', function (err) {
      reject(err)
    })
  })
}

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    process.exit(0)
  })
})
