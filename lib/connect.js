import mongoose from 'mongoose'

module.exports = function connectToMongo() {
  return new Promise(function(resolve, reject) {
    var mongoDB = mongoose.connect(process.env.MONGODB_URI)

    mongoDB
      .then(db => {
        console.log('Mongodb has been connected')
      })
      .catch(err => {
        console.log('Error while trying to connect with mongodb')
        throw err
      })

    // Even though it's a promise, no need to worry about creating models immediately, as mongoose buffers requests until a connection is made

    resolve(mongoDB)
  })
}

process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    process.exit(0)
  })
})
