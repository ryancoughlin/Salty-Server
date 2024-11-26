const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middlewares/validator');
const waveController = require('../controllers/waveController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/waves/forecast:
 *   get:
 *     summary: Get wave forecast
 *     tags: [Waves]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
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

/**
 * @swagger
 * /api/v1/waves/historical:
 *   get:
 *     summary: Get historical wave data
 *     tags: [Waves]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 */
router.get(
  '/historical',
  [
    query('lat').isFloat().withMessage('Latitude must be a valid number'),
    query('lon').isFloat().withMessage('Longitude must be a valid number'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
    validate
  ],
  waveController.getHistoricalWaveData
);

module.exports = router; 