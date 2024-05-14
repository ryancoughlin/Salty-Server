// app.js
const express = require('express');
const connectDB = require('./database');
const dotenv = require('dotenv');
const routes = require('./routes');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(express.json());

connectDB().then(() => {
  app.use('/api', routes());

  app.get('/', (req, res) => {
    res.send('Ahoy, salty tides served up');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => console.error("Database connection failed", err));
