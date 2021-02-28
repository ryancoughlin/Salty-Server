const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();
const port = 3000
require("dotenv").config();

const defaultRoutes = require("./routes")();

mongoose 
  .connect(process.env.MONGO_URL, {
	  useNewUrlParser: true,
	  useUnifiedTopology: true,
  })
  .then(() => {
	console.log("Database connection Success!");
  })
  .catch((err) => {
	console.error("Mongo Connection Error", err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
	credentials: true,
}));

app.use("/api", defaultRoutes);
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));