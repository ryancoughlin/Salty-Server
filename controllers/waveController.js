const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { getNearestWaveData } = require('../services/waveService');
const { getSevenDayForecast } = require('../services/forecastService');

/**
 * Get 7-day wave forecast for provided coordinates
 */
const getWaveForecast = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    logger.info(`Getting wave forecast for lat: ${lat}, lon: ${lon}`);

    // Get the 7-day forecast
    const forecast = await getSevenDayForecast(
      parseFloat(lat),
      parseFloat(lon)
    );

    // Get current conditions from nearest buoy for validation
    const currentConditions = await getNearestWaveData(
      parseFloat(lat),
      parseFloat(lon)
    );

    // If we have current buoy data, use it to adjust the first forecast point
    if (currentConditions && currentConditions.length > 0) {
      const latestBuoyData = currentConditions[0];
      forecast.forecast[0] = {
        ...forecast.forecast[0],
        waveHeight: latestBuoyData.waveHeight,
        wavePeriod: latestBuoyData.wavePeriod,
        waveDirection: latestBuoyData.waveDirection,
        windSpeed: latestBuoyData.windSpeed,
        windDirection: latestBuoyData.windDirection,
        source: 'NDBC'
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...forecast,
        currentConditions: currentConditions?.[0] || null
      }
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