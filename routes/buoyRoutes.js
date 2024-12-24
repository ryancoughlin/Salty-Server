const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middlewares/validator');
const buoyController = require('../controllers/buoyController');

const router = express.Router();

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
    param('buoyId')
      .isString()
      .trim()
      .matches(/^[34]\d{4}$/)
      .withMessage('Invalid buoy ID format'),
    validate
  ],
  buoyController.getBuoyDetails
);

module.exports = router; 