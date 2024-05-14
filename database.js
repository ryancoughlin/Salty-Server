const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


/**
 * Connects to the MongoDB database using Mongoose.
 */
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

module.exports = connectDB;
