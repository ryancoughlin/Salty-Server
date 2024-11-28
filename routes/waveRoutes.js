const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middlewares/validator');
const waveController = require('../controllers/waveController');

const router = express.Router();

/**
 * @swagger
 * /api/waves/forecast:
 *   get:
 *     summary: Get wave and wind forecast
 *     tags: [Waves]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude of the location
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude of the location
 *     responses:
 *       200:
 *         description: Forecast including wave height, period, direction, and wind conditions
 */
router.get(
  '/forecast',
  [
    query('lat').isFloat().withMessage('Latitude must be a valid number'),
    query('lon').isFloat().withMessage('Longitude must be a valid number'),
    validate
  ],
  waveController.getWaveForecast
);

module.exports = router; 