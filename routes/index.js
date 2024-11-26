// routes/index.js
const express = require('express');
const { validate } = require('../middlewares/validator');
const tideRoutes = require('./tideRoutes');
const buoyRoutes = require('./buoyRoutes');
const waveRoutes = require('./waveRoutes');

const router = express.Router();

// API Routes
router.use('/tides', tideRoutes);
router.use('/buoys', buoyRoutes);
router.use('/waves', waveRoutes);

// Catch all 404 errors
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

module.exports = router;
