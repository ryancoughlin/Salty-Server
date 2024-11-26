const express = require('express');
const { query, param } = require('express-validator');
const { validate } = require('../middlewares/validator');
const buoyController = require('../controllers/buoyController');

const router = express.Router();

/**
 * @swagger
 * /api/buoys/closest:
 *   get:
 *     summary: Get closest buoy data
 *     tags: [Buoys]
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
  '/closest',
  [
    query('lat').isFloat().withMessage('Latitude must be a valid number'),
    query('lon').isFloat().withMessage('Longitude must be a valid number'),
    validate
  ],
  buoyController.getClosestBuoy
);

/**
 * @swagger
 * /api/buoys/{buoyId}:
 *   get:
 *     summary: Get buoy details, current conditions, and forecast
 *     tags: [Buoys]
 *     parameters:
 *       - in: path
 *         name: buoyId
 *         required: true
 *         schema:
 *           type: string
 *         description: NDBC buoy ID (e.g., 44098)
 */
router.get(
  '/:buoyId',
  [
    param('buoyId').isString().withMessage('Buoy ID is required'),
    validate
  ],
  buoyController.getBuoyDetails
);

/**
 * @swagger
 * /api/buoys/{buoyId}/data:
 *   get:
 *     summary: Get historical data for a specific buoy
 *     tags: [Buoys]
 *     parameters:
 *       - in: path
 *         name: buoyId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:buoyId/data',
  [
    param('buoyId').isString().withMessage('Buoy ID is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
    validate
  ],
  buoyController.getBuoyData
);

module.exports = router; 