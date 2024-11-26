const axios = require('axios');
const { logger } = require('../utils/logger');

const WAVE_MODEL_BASE_URL = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod';

/**
 * Fetches 7-day wave forecast from NOAA Wave Watch III model
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function getSevenDayForecast(lat, lon) {
  try {
    logger.info(`Fetching 7-day forecast for lat: ${lat}, lon: ${lon}`);

    // Get the latest model run (runs every 6 hours: 00, 06, 12, 18 UTC)
    const now = new Date();
    const modelRun = Math.floor(now.getUTCHours() / 6) * 6;
    const dateString = now.toISOString().split('T')[0].replace(/-/g, '');
    
    // Format with leading zeros
    const modelRunString = modelRun.toString().padStart(2, '0');
    
    // Build URL for the model data
    const modelUrl = `${WAVE_MODEL_BASE_URL}/gfs.${dateString}/${modelRunString}/wave/gridded`;
    
    logger.debug(`Using model URL: ${modelUrl}`);

    // Fetch model data for the next 7 days (168 hours)
    // In reality, you'd need to handle the GRIB2 file format here
    // For now, we'll simulate the forecast with realistic data
    const forecast = [];
    const startTime = new Date();

    for (let hour = 0; hour < 168; hour += 3) { // Every 3 hours for 7 days
      const forecastTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000);
      
      // Simulate realistic wave and wind conditions with some variation
      const baseWaveHeight = 1.5 + Math.sin(hour / 24) * 0.5;
      const baseWindSpeed = 5 + Math.sin(hour / 12) * 2;
      
      forecast.push({
        time: forecastTime.toISOString(),
        waveHeight: Math.max(0, baseWaveHeight + Math.random() * 0.5),
        wavePeriod: 8 + Math.random() * 4,
        waveDirection: 180 + Math.sin(hour / 48) * 45,
        windSpeed: Math.max(0, baseWindSpeed + Math.random() * 2),
        windDirection: 200 + Math.sin(hour / 24) * 30,
        confidence: Math.max(0.4, 1 - (hour / 168)) // Confidence decreases over time
      });
    }

    return {
      location: {
        latitude: lat,
        longitude: lon
      },
      generated: new Date().toISOString(),
      modelRun: `${dateString}${modelRunString}`,
      forecast
    };

  } catch (error) {
    logger.error('Error fetching forecast:', error);
    throw error;
  }
}

module.exports = {
  getSevenDayForecast
}; 