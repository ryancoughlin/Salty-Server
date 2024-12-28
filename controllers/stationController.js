const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { fetchClosestStation, fetchAllStations, fetchStationById } = require('../services/stationService');
const createTideFetcher = require('../TideData');
const { validationResult } = require('express-validator');

/**
 * Get all tide stations
 */
const getAllStations = async (req, res, next) => {
    try {
        const stations = await fetchAllStations();
        res.status(200).json({
            status: 'success',
            data: { stations }
        });
    } catch (error) {
        logger.error('Error fetching all stations:', error);
        next(new AppError(500, 'Unable to fetch tide stations'));
    }
};

/**
 * Get closest tide station to provided coordinates
 */
const getClosestStation = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(400, 'Invalid coordinates provided');
        }

        const { lat, lon } = req.query;
        const station = await fetchClosestStation(parseFloat(lat), parseFloat(lon));
        
        if (!station) {
            throw new AppError(404, 'No station found near this location');
        }

        res.status(200).json({
            status: 'success',
            data: { station }
        });
    } catch (error) {
        logger.error('Error finding closest station:', error);
        next(error);
    }
};

/**
 * Get station details and tide predictions
 */
const getStationDetails = async (req, res, next) => {
    try {
        const { stationId } = req.params;
        const { startDate, endDate } = req.query;
        
        const station = await fetchStationById(stationId);
        if (!station) {
            throw new AppError(404, 'Station not found');
        }

        // Fetch tide predictions
        const tideFetcher = createTideFetcher(stationId);
        const predictions = await tideFetcher.fetchData();

        // Filter predictions by date range if provided
        let filteredPredictions = predictions;
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date(8640000000000000);
            
            filteredPredictions = predictions.filter(pred => {
                const predDate = new Date(pred.time);
                return predDate >= start && predDate <= end;
            });
        }

        // Handle subordinate stations
        let referenceData = null;
        if (station.station_type === 'subordinate' && station.referenceId) {
            const referenceStation = await fetchStationById(station.referenceId);
            if (referenceStation) {
                const referenceTideFetcher = createTideFetcher(station.referenceId);
                referenceData = await referenceTideFetcher.fetchData();
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                station,
                predictions: filteredPredictions,
                reference: referenceData ? {
                    stationId: station.referenceId,
                    predictions: referenceData
                } : null
            }
        });
    } catch (error) {
        logger.error('Error fetching station details:', error);
        next(error);
    }
};

module.exports = {
    getAllStations,
    getClosestStation,
    getStationDetails
}; 