const axios = require('axios');
const { logger } = require('../utils/logger');

// Constants
const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 seconds
const MAX_DAYS_BACK = 7;

class NoaaApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NoaaApiError';
        this.statusCode = statusCode;
    }
}

async function findLatestData(baseUrl, maxAttempts = MAX_DAYS_BACK) {
    const dates = Array.from({ length: maxAttempts }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0].replace(/-/g, '');
    });

    for (const dateString of dates) {
        const url = `${baseUrl}${dateString}/`;
        try {
            const response = await axios.get(url, { timeout: TIMEOUT });
            if (response.status === 200) {
                logger.info(`Latest data found for date: ${dateString}`);
                return dateString;
            }
        } catch (error) {
            if (error.response?.status === 404) {
                continue; // Try next date
            }
            throw new NoaaApiError(`Error checking date ${dateString}: ${error.message}`, error.response?.status);
        }
    }
    throw new NoaaApiError('No recent data available', 404);
}

async function fetchNoaaData(lat, lon, retries = MAX_RETRIES) {
    logger.info(`Fetching NOAA data for lat: ${lat}, lon: ${lon}`);

    const waveBaseUrl = 'https://nomads.ncep.noaa.gov/dods/wave/gwes/';
    const windBaseUrl = 'https://nomads.ncep.noaa.gov/dods/gfs_0p25_1hr/gfs';

    try {
        const [latestWaveDate, latestWindDate] = await Promise.all([
            findLatestData(waveBaseUrl),
            findLatestData(windBaseUrl)
        ]);

        const waveUrl = `${waveBaseUrl}${latestWaveDate}/gwes_00z.ascii?htsgwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}],perpwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}],dirpwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}]`;
        const windUrl = `${windBaseUrl}${latestWindDate}/gfs_0p25_1hr_00z.ascii?ugrd10m[0][${Math.floor(lat)}][${Math.floor(lon)}],vgrd10m[0][${Math.floor(lat)}][${Math.floor(lon)}]`;

        const [waveResponse, windResponse] = await Promise.all([
            axios.get(waveUrl, { timeout: TIMEOUT }),
            axios.get(windUrl, { timeout: TIMEOUT })
        ]);

        if (waveResponse.status !== 200 || windResponse.status !== 200) {
            throw new NoaaApiError('Failed to fetch data from NOAA', waveResponse.status);
        }

        return {
            waveData: waveResponse.data,
            windData: windResponse.data,
            waveDate: latestWaveDate,
            windDate: latestWindDate
        };
    } catch (error) {
        if (retries > 0 && error.code === 'ECONNABORTED') {
            logger.warn(`Retry attempt ${MAX_RETRIES - retries + 1} for ${lat},${lon}`);
            return fetchNoaaData(lat, lon, retries - 1);
        }
        throw error;
    }
}

function parseNoaaData(data) {
  try {
    const lines = data.split('\n');
    const values = lines
      .filter(line => line.includes('='))
      .map(line => {
        const [, value] = line.split('=');
        return parseFloat(value.trim());
      })
      .filter(value => !isNaN(value));
    
    logger.debug('Parsed values:', values);
    return values;
  } catch (error) {
    logger.error('Error in parseNoaaData:', error);
    throw error;
  }
}

async function getProcessedNoaaData(lat, lon) {
  logger.info('Getting processed NOAA data');
  try {
    const { waveData, windData, waveDate, windDate } = await fetchNoaaData(lat, lon);
    
    const waveValues = parseNoaaData(waveData);
    const windValues = parseNoaaData(windData);

    if (waveValues.length < 3 || windValues.length < 2) {
      throw new Error('Insufficient data received from NOAA');
    }

    const [waveHeight, wavePeriod, waveDirection] = waveValues;
    const [uWind, vWind] = windValues;

    const windSpeed = Math.sqrt(Math.pow(uWind, 2) + Math.pow(vWind, 2));
    const windDirection = (Math.atan2(-uWind, -vWind) * 180 / Math.PI + 360) % 360;

    const result = {
      waveHeight,
      wavePeriod,
      waveDirection,
      windSpeed,
      windDirection,
      waveDataDate: waveDate,
      windDataDate: windDate
    };

    logger.debug('Processed NOAA data:', result);
    return result;
  } catch (error) {
    logger.error('Error in getProcessedNoaaData:', error);
    throw error;
  }
}

module.exports = { getProcessedNoaaData };