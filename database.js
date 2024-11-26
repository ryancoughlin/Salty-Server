//database.js
const mongoose = require('mongoose')
const { logger } = require('./utils/logger')

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is not defined')
    }

    const conn = await mongoose.connect(mongoUrl, {
      // These options are no longer needed in Mongoose 8
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    throw error
  }
}

module.exports = connectDB
