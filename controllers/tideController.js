const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { fetchClosestStation, fetchAllStations, fetchStationById } = require('../services/stationService');
const createTideFetcher = require('../TideData');

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

    res.status(200).json({
      status: 'success',
      data: {
        station,
        predictions: filteredPredictions
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