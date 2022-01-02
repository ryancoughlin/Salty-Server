const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const defaultRoutes = require("./routes")();

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const allowedOrigins = ["http://localhost:5000"];
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use("/api", defaultRoutes);
app.get("/", (req, res) =>
  res.send("Salty server – get tide information from NOAA")
);
app.listen(port, () => console.log("Server is running on port", port));
