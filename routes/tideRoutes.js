const express = require('express');
const { param, query } = require('express-validator');
const { validate } = require('../middlewares/validator');
const tideController = require('../controllers/tideController');

const router = express.Router();

/**
 * @swagger
 * /api/tides/stations:
 *   get:
 *     summary: Get all tide stations
 *     tags: [Tides]
 *     responses:
 *       200:
 *         description: List of tide stations
 */
router.get('/stations', tideController.getAllStations);

/**
 * @swagger
 * /api/tides/stations/closest:
 *   get:
 *     summary: Get closest tide station
 *     tags: [Tides]
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
  '/stations/closest',
  [
    query('lat').isFloat().withMessage('Latitude must be a valid number'),
    query('lon').isFloat().withMessage('Longitude must be a valid number'),
    validate
  ],
  tideController.getClosestStation
);

/**
 * @swagger
 * /api/tides/stations/{stationId}/predictions:
 *   get:
 *     summary: Get tide predictions for a station
 *     tags: [Tides]
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/stations/:stationId/predictions',
  [
    param('stationId').isString().withMessage('Station ID is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
    validate
  ],
  tideController.getStationPredictions
);

module.exports = router; 