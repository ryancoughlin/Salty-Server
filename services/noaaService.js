const axios = require('axios');
const { logger } = require('../utils/logger');

async function findLatestData(baseUrl, maxAttempts = 7) {
  const today = new Date();
  for (let i = 0; i < maxAttempts; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
    const url = `${baseUrl}${dateString}/`;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        logger.info(`Latest data found for date: ${dateString}`);
        return dateString;
      }
    } catch (error) {
      logger.error(`Error checking date ${dateString}:`, error.message);
    }
  }
  throw new Error('Could not find recent data within the last 7 days');
}

async function fetchNoaaData(lat, lon) {
  logger.info(`Fetching NOAA data for lat: ${lat}, lon: ${lon}`);

  try {
    const waveBaseUrl = 'https://nomads.ncep.noaa.gov/dods/wave/gwes/';
    const windBaseUrl = 'https://nomads.ncep.noaa.gov/dods/gfs_0p25_1hr/gfs';

    const latestWaveDate = await findLatestData(waveBaseUrl);
    const latestWindDate = await findLatestData(windBaseUrl);

    const waveUrl = `${waveBaseUrl}${latestWaveDate}/gwes_00z.ascii?htsgwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}],perpwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}],dirpwsfc[0][${Math.floor(lat)}][${Math.floor(lon)}]`;
    const windUrl = `${windBaseUrl}${latestWindDate}/gfs_0p25_1hr_00z.ascii?ugrd10m[0][${Math.floor(lat)}][${Math.floor(lon)}],vgrd10m[0][${Math.floor(lat)}][${Math.floor(lon)}]`;

    logger.debug('Wave data URL:', waveUrl);
    logger.debug('Wind data URL:', windUrl);

    const [waveResponse, windResponse] = await Promise.all([
      axios.get(waveUrl),
      axios.get(windUrl)
    ]);

    logger.debug('Wave Response status:', waveResponse.status);
    logger.debug('Wind Response status:', windResponse.status);

    if (waveResponse.status !== 200 || windResponse.status !== 200) {
      throw new Error('Failed to fetch data from NOAA');
    }

    return {
      waveData: waveResponse.data,
      windData: windResponse.data,
      waveDate: latestWaveDate,
      windDate: latestWindDate
    };
  } catch (error) {
    logger.error('Error in fetchNoaaData:', error);
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