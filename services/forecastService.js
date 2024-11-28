const { logger } = require('../utils/logger');
const { getPointForecast } = require('./waveModelService');

// Helper functions for condition descriptions
const getWaveDescription = (heightInFeet) => {
  if (heightInFeet < 1.0) return 'flat';
  if (heightInFeet < 2.0) return 'small';
  if (heightInFeet < 3.0) return 'mild';
  if (heightInFeet < 4.0) return 'moderate';
  if (heightInFeet < 6.0) return 'considerable';
  if (heightInFeet < 8.0) return 'large';
  return 'huge';
};

const getWindDescription = (speed) => {
  if (speed < 5) return 'light';
  if (speed < 10) return 'gentle';
  if (speed < 15) return 'moderate';
  if (speed < 20) return 'fresh';
  if (speed < 25) return 'strong';
  return 'very strong';
};

const getWindDirectionText = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees + 22.5) % 360) / 45);
  return directions[index % 8];
};

const findPeakConditions = (days) => {
  let peak = null;
  days.forEach(day => {
    const maxWaveHeight = day.summary.waveHeight.max;
    const maxWindSpeed = day.summary.windSpeed.max;
    if (!peak || maxWaveHeight > peak.waveHeight || maxWindSpeed > peak.windSpeed) {
      peak = {
        date: day.date,
        waveHeight: maxWaveHeight,
        windSpeed: maxWindSpeed,
        // Use first period of the day for direction
        windDirection: day.periods[0].windDirection
      };
    }
  });
  return peak;
};

const findBestDay = (days) => {
  for (const day of days) {
    // Check if any period during the day has good conditions
    const hasGoodConditions = day.periods.some(period => {
      const isGoodWaves = parseFloat(period.waveHeight) >= 2.0 && parseFloat(period.waveHeight) <= 5.0;
      const isGoodWind = parseFloat(period.windSpeed) < 15;
      return isGoodWaves && isGoodWind;
    });

    if (hasGoodConditions) {
      // Use the daily summary for the best day
      return {
        date: day.date,
        waveHeight: day.summary.waveHeight.avg,
        windSpeed: day.summary.windSpeed.avg,
        windDirection: day.periods[0].windDirection  // Use morning direction
      };
    }
  }

  // If no "good" days found, find the most manageable day
  return days.reduce((best, current) => {
    const currentScore = (current.summary.waveHeight.avg * 2) + (current.summary.windSpeed.avg / 5);
    const bestScore = (best.summary.waveHeight.avg * 2) + (best.summary.windSpeed.avg / 5);
    return currentScore < bestScore ? current : best;
  });
};

const generateSummaries = (modelData) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Validate modelData structure
    if (!modelData || !modelData.days || !modelData.days.length || !modelData.days[0].periods || !modelData.days[0].periods.length) {
        logger.error('Invalid model data structure:', modelData);
        throw new Error('Invalid forecast data structure');
    }

    try {
        // Current conditions from first period of first day
        const current = modelData.days[0].periods[0];
        if (!current || !current.waveHeight || !current.windSpeed || !current.windDirection) {
            throw new Error('Missing current conditions data');
        }
        
        const currentSummary = `${getWaveDescription(current.waveHeight)} ${current.waveHeight}ft waves, ${getWindDescription(current.windSpeed)} ${current.windSpeed}mph ${getWindDirectionText(current.windDirection)} winds`;

        // Find peak conditions for the week
        const peakConditions = findPeakConditions(modelData.days);
        if (!peakConditions) {
            throw new Error('Unable to determine peak conditions');
        }
        
        const peakDate = new Date(peakConditions.date);
        const peakDay = days[peakDate.getDay()];
        const weekSummary = `Building to ${peakConditions.waveHeight}ft waves and ${peakConditions.windSpeed}mph winds by ${peakDay}`;

        // Find best day
        const bestDay = findBestDay(modelData.days);
        if (!bestDay) {
            throw new Error('Unable to determine best day');
        }
        
        const bestDate = new Date(bestDay.date);
        let bestDaySummary;
        
        if (bestDay.periods && bestDay.summary) {
            bestDaySummary = `Best on ${days[bestDate.getDay()]}: ${bestDay.summary.waveHeight.avg}ft waves, ${bestDay.summary.windSpeed.avg}mph ${getWindDirectionText(bestDay.periods[0].windDirection)} winds`;
        } else {
            bestDaySummary = 'Unable to determine best conditions';
        }

        return {
            current: currentSummary,
            week: weekSummary,
            bestDay: bestDaySummary
        };
    } catch (error) {
        logger.error('Error generating summaries:', error);
        return {
            current: 'Forecast data unavailable',
            week: 'Unable to generate week summary',
            bestDay: 'Unable to determine best conditions'
        };
    }
};

/**
 * Fetches wave forecast from NOAA WaveWatch III model
 */
async function getSevenDayForecast(lat, lon) {
    try {
        logger.info(`Fetching forecast for lat: ${lat}, lon: ${lon}`);
        
        // Get forecast from wave model
        const modelData = await getPointForecast(lat, lon);
        
        // Validate model data
        if (!modelData || !modelData.days) {
            throw new Error('Invalid forecast data received');
        }

        // Generate summaries
        const summaries = generateSummaries(modelData);

        return {
            ...modelData,
            summaries
        };
    } catch (error) {
        logger.error('Error fetching forecast:', error);
        throw error;
    }
}

module.exports = {
  getSevenDayForecast,
  generateSummaries
}; 