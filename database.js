// db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = (callback) => {
  // Set strictQuery option
  mongoose.set("strictQuery", true);

  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });

  db.once("open", () => {
    console.log("Connected to MongoDB");
    callback();
  });
};

module.exports = connectDB;
