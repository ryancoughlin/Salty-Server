const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { getActiveBuoys } = require('../services/ndbcService');
const WaveForecast = require('../models/waveForecast.model');

/**
 * Get closest buoy to provided coordinates
 */
const getClosestBuoy = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    logger.info(`Finding closest buoy to lat: ${lat}, lon: ${lon}`);

    // Get the latest wave data for this location
    const latestData = await WaveForecast.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)]
          },
          $maxDistance: 100000 // 100km
        }
      }
    }).sort({ time: -1 });

    if (!latestData) {
      throw new AppError(404, 'No buoy data found near this location');
    }

    // Find the actual buoy this data came from
    const buoys = await getActiveBuoys();
    const nearestBuoy = buoys.find(buoy => 
      Math.abs(buoy.lat - latestData.location.coordinates[1]) < 0.01 &&
      Math.abs(buoy.lon - latestData.location.coordinates[0]) < 0.01
    );

    res.status(200).json({
      status: 'success',
      data: {
        buoy: nearestBuoy,
        currentConditions: {
          time: latestData.time,
          waveHeight: latestData.waveHeight,
          wavePeriod: latestData.wavePeriod,
          waveDirection: latestData.waveDirection,
          windSpeed: latestData.windSpeed,
          windDirection: latestData.windDirection
        }
      }
    });
  } catch (error) {
    logger.error('Error in getClosestBuoy:', error);
    next(error);
  }
};

/**
 * Get historical data for a specific buoy
 */
const getBuoyData = async (req, res, next) => {
  try {
    const { buoyId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Find the buoy
    const buoys = await getActiveBuoys();
    const buoy = buoys.find(b => b.id === buoyId);
    
    if (!buoy) {
      throw new AppError(404, 'Buoy not found');
    }

    // Query conditions
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [buoy.lon, buoy.lat]
          },
          $maxDistance: 1000 // 1km - very close to the buoy location
        }
      }
    };

    // Add date range if provided
    if (startDate || endDate) {
      query.time = {};
      if (startDate) query.time.$gte = new Date(startDate);
      if (endDate) query.time.$lte = new Date(endDate);
    }

    const data = await WaveForecast.find(query)
      .sort({ time: -1 })
      .limit(24); // Last 24 readings

    res.status(200).json({
      status: 'success',
      data: {
        buoy,
        measurements: data
      }
    });
  } catch (error) {
    logger.error('Error in getBuoyData:', error);
    next(error);
  }
};

module.exports = {
  getClosestBuoy,
  getBuoyData
}; 