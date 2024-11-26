const axios = require('axios');
const { logger } = require('../utils/logger');
const WaveForecast = require('../models/waveForecast.model');

const NDBC_BASE_URL = 'https://www.ndbc.noaa.gov/data/realtime2';

/**
 * Validates and parses a numeric value from NDBC data
 * @param {string} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number|null}
 */
function parseNumericValue(value, defaultValue = null) {
  if (!value || value === 'MM') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Fetches the latest data from an NDBC buoy
 * @param {string} buoyId - The NDBC buoy ID (e.g., '44017')
 */
async function fetchBuoyData(buoyId) {
  try {
    logger.info(`Fetching data for buoy: ${buoyId}`);
    
    // Fetch standard meteorological data
    const meteoUrl = `${NDBC_BASE_URL}/${buoyId}.txt`;
    const response = await axios.get(meteoUrl);
    
    if (!response.data) {
      throw new Error(`No data available for buoy ${buoyId}`);
    }

    // Split into lines and remove empty lines
    const lines = response.data.split('\n').filter(line => line.trim());
    
    // First line contains headers, second line contains units, third line contains data
    const headers = lines[0].split(/\s+/).filter(Boolean); // Remove empty strings
    const data = lines[2].split(/\s+/).filter(Boolean);

    logger.debug('Headers:', headers);
    logger.debug('Data:', data);

    // Create measurement time (first 5 fields are YY MM DD hh mm)
    const year = parseInt(data[0]);
    const month = parseInt(data[1]) - 1; // JS months are 0-based
    const day = parseInt(data[2]);
    const hour = parseInt(data[3]);
    const minute = parseInt(data[4]);

    const measurementTime = new Date(Date.UTC(year, month, day, hour, minute));
    
    if (isNaN(measurementTime.getTime())) {
      throw new Error('Invalid measurement time from data: ' + data.slice(0, 5).join(' '));
    }

    // Find indices for the measurements we want
    const wvhtIndex = headers.indexOf('WVHT');
    const dpdIndex = headers.indexOf('DPD');
    const mwdIndex = headers.indexOf('MWD');
    const wspdIndex = headers.indexOf('WSPD');
    const wdirIndex = headers.indexOf('WDIR');

    // Parse measurements with fallbacks
    const measurements = {
      time: measurementTime,
      waveHeight: parseNumericValue(data[wvhtIndex], 0),
      wavePeriod: parseNumericValue(data[dpdIndex], 0),
      waveDirection: parseNumericValue(data[mwdIndex], 0),
      windSpeed: parseNumericValue(data[wspdIndex], 0),
      windDirection: parseNumericValue(data[wdirIndex], 0),
      source: 'NDBC'
    };

    logger.debug('Processed measurements:', measurements);
    return measurements;

  } catch (error) {
    logger.error(`Error fetching buoy data for ${buoyId}:`, error);
    throw error;
  }
}

/**
 * Stores buoy data in the database
 */
async function storeBuoyData(buoyId, lat, lon, data) {
  try {
    logger.debug(`Storing data for buoy ${buoyId}:`, data);

    // Validate required fields
    if (!data.time || isNaN(data.time.getTime())) {
      throw new Error('Invalid measurement time');
    }

    const waveForecast = new WaveForecast({
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      time: data.time,
      waveHeight: data.waveHeight,
      wavePeriod: data.wavePeriod,
      waveDirection: data.waveDirection,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      source: data.source
    });

    await waveForecast.save();
    logger.info(`Stored buoy data for ${buoyId}`);
    return waveForecast;
  } catch (error) {
    logger.error(`Error storing buoy data for ${buoyId}:`, error);
    throw error;
  }
}

/**
 * Returns a list of active NDBC buoys in a region
 */
async function getActiveBuoys(region = 'NE') {
  // You could expand this to fetch from NDBC's active station list
  // For now, returning a static list of common NE buoys
  return [
    { id: '44017', name: 'Montauk Point', lat: 40.694, lon: -72.048 },
    { id: '44013', name: 'Boston', lat: 42.346, lon: -70.651 },
    { id: '44027', name: 'Jonesport', lat: 44.285, lon: -67.307 },
    { id: '44098', name: 'Jeffrey\'s Ledge', lat: 42.798, lon: -70.168 }
  ];
}

/**
 * Updates data for all active buoys
 */
async function updateAllBuoys() {
  try {
    const buoys = await getActiveBuoys();
    logger.info(`Updating data for ${buoys.length} buoys`);

    const results = [];
    for (const buoy of buoys) {
      try {
        const data = await fetchBuoyData(buoy.id);
        const savedData = await storeBuoyData(buoy.id, buoy.lat, buoy.lon, data);
        results.push({
          buoyId: buoy.id,
          status: 'success',
          data: savedData
        });
      } catch (error) {
        logger.error(`Failed to update buoy ${buoy.id}:`, error);
        results.push({
          buoyId: buoy.id,
          status: 'error',
          error: error.message
        });
        // Continue with other buoys even if one fails
        continue;
      }
    }

    return results;
  } catch (error) {
    logger.error('Error updating buoys:', error);
    throw error;
  }
}

module.exports = {
  fetchBuoyData,
  storeBuoyData,
  getActiveBuoys,
  updateAllBuoys
}; 