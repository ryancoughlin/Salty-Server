const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { getSevenDayForecast } = require('../services/waveConditionsService');

/**
 * Get wave forecast for provided coordinates
 */
const getWaveForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    logger.info(`Getting wave forecast for lat: ${lat}, lon: ${lon}`);

    // Get the forecast
    const forecast = await getSevenDayForecast(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.status(200).json({
      status: 'success',
      data: forecast
    });
  } catch (error) {
    logger.error('Error in getWaveForecast:', error);
    next(error);
  }
};

module.exports = {
  getWaveForecast
}; 