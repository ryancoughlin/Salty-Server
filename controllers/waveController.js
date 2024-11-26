const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { getProcessedNoaaData } = require('../services/noaaService');
const { getNearestWaveData } = require('../services/waveService');

/**
 * Get wave forecast for provided coordinates
 */
const getWaveForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    
    const forecastData = await getProcessedNoaaData(parseFloat(lat), parseFloat(lon));
    
    if (!forecastData) {
      throw new AppError(404, 'No forecast data available for this location');
    }

    res.status(200).json({
      status: 'success',
      data: forecastData
    });
  } catch (error) {
    logger.error('Error in getWaveForecast:', error);
    next(error);
  }
};

/**
 * Get historical wave data for provided coordinates
 */
const getHistoricalWaveData = async (req, res, next) => {
  try {
    const { lat, lon, startDate, endDate } = req.query;
    
    const historicalData = await getNearestWaveData(
      parseFloat(lat), 
      parseFloat(lon)
    );

    if (!historicalData || historicalData.length === 0) {
      throw new AppError(404, 'No historical data available for this location');
    }

    res.status(200).json({
      status: 'success',
      data: {
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        },
        timeRange: {
          start: startDate,
          end: endDate
        },
        measurements: historicalData
      }
    });
  } catch (error) {
    logger.error('Error in getHistoricalWaveData:', error);
    next(error);
  }
};

module.exports = {
  getWaveForecast,
  getHistoricalWaveData
}; 