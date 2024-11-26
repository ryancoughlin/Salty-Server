const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { fetchClosestStation, fetchAllStations, fetchStationById } = require('../services/stationService');

/**
 * Get all tide stations
 */
const getAllStations = async (req, res, next) => {
  try {
    const stations = await fetchAllStations();
    res.status(200).json({
      status: 'success',
      data: {
        stations
      }
    });
  } catch (error) {
    logger.error('Error in getAllStations:', error);
    next(new AppError(500, 'Error fetching tide stations'));
  }
};

/**
 * Get closest tide station to provided coordinates
 */
const getClosestStation = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    const station = await fetchClosestStation(parseFloat(lat), parseFloat(lon));
    
    if (!station) {
      throw new AppError(404, 'No station found near this location');
    }

    res.status(200).json({
      status: 'success',
      data: {
        station
      }
    });
  } catch (error) {
    logger.error('Error in getClosestStation:', error);
    next(error);
  }
};

/**
 * Get tide predictions for a specific station
 */
const getStationPredictions = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { startDate, endDate } = req.query;
    
    const station = await fetchStationById(stationId);
    if (!station) {
      throw new AppError(404, 'Station not found');
    }

    // TODO: Implement tide prediction logic using NOAA API
    const predictions = []; // This should be replaced with actual tide prediction data

    res.status(200).json({
      status: 'success',
      data: {
        station,
        predictions
      }
    });
  } catch (error) {
    logger.error('Error in getStationPredictions:', error);
    next(error);
  }
};

module.exports = {
  getAllStations,
  getClosestStation,
  getStationPredictions
}; 