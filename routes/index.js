// routes/index.js
const express = require('express');
const { query } = require('express-validator');
const stationController = require('../controllers/stationController');
const buoyController = require('../controllers/buoyController');

const router = express.Router();

// Station routes
router.get('/stations', stationController.getAllStations);

router.get('/stations/nearest', [
    query('lat').isFloat().withMessage('Latitude must be a valid number'),
    query('lon').isFloat().withMessage('Longitude must be a valid number')
], stationController.getClosestStation);

router.get('/stations/:stationId', [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
], stationController.getStationDetails);

// Buoy routes
router.get('/buoys/:buoyId', buoyController.getBuoyData);

// Catch all 404 errors
router.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    });
});

module.exports = router;
