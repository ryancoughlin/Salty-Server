//database.js
const mongoose = require('mongoose')
const { logger } = require('./utils/logger')

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    logger.info('Using cached database connection');
    return cachedConnection;
  }

  try {
    const mongoUrl = process.env.MONGO_URL
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is not defined')
    }

    const conn = await mongoose.connect(mongoUrl, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
    
    // Cache the connection
    cachedConnection = conn;
    return conn
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    throw error
  }
}

module.exports = connectDB
