const express = require("express");
const connectDB = require("./database");
const dotenv = require("dotenv");
const routes = require("./routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB(() => {
  // Middleware
  app.use(express.json());
  app.use("/api", routes());

  // Routes
  app.get("/", (req, res) => {
    res.send("Welcome to the Express server!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
