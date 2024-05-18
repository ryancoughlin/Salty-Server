//database.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

let dbInstance = null

/**
 * Connects to the MongoDB database using Mongoose.
 */
const connectDB = async () => {
  mongoose.set('strictQuery', true)

  if (dbInstance) {
    return dbInstance
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to MongoDB')
    dbInstance = mongoose.connection.db
    return dbInstance
  } catch (err) {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  }
}

module.exports = connectDB
