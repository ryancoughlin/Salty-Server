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

// Add new helper functions for wind impact
const getWindImpact = (windDirection, windSpeed, location) => {
  // Default to East Coast configurations
  // Each coast has different favorable/unfavorable wind directions
  const coastConfigs = {
    EAST_COAST: {
      // Offshore winds (favorable)
      favorable: ['W', 'NW', 'SW'],
      // Onshore winds (unfavorable)
      unfavorable: ['E', 'NE', 'SE'],
      // Cross-shore winds (neutral)
      neutral: ['N', 'S']
    },
    WEST_COAST: {
      favorable: ['E', 'SE', 'NE'],
      unfavorable: ['W', 'SW', 'NW'],
      neutral: ['N', 'S']
    }
  };

  const windDir = getWindDirectionText(windDirection);
  const config = coastConfigs.EAST_COAST; // TODO: Determine coast based on longitude

  if (config.unfavorable.includes(windDir)) {
    if (windSpeed > 15) return 'poor-choppy';
    if (windSpeed > 10) return 'poor';
    return 'fair';
  }
  
  if (config.favorable.includes(windDir)) {
    if (windSpeed > 25) return 'fair-strong';
    if (windSpeed > 15) return 'good-breezy';
    return 'excellent';
  }

  // Neutral directions
  if (windSpeed > 20) return 'poor-choppy';
  if (windSpeed > 15) return 'fair';
  return 'good';
};

// Update the findBestDay function to consider wind direction impact
const findBestDay = (days, location) => {
  return days.reduce((best, current) => {
    const periods = current.periods.map(period => {
      const windImpact = getWindImpact(period.windDirection, period.windSpeed, location);
      const waveScore = parseFloat(period.waveHeight);
      
      // Score calculation factors in:
      // 1. Wave height (2-5ft ideal)
      // 2. Wind direction and speed impact
      // 3. Wind speed (lighter generally better)
      let score = 0;
      
      // Wave height scoring
      if (waveScore >= 2 && waveScore <= 5) {
        score += 50;
      } else if (waveScore > 5) {
        score += 30;
      } else {
        score += 10;
      }

      // Wind impact scoring
      switch (windImpact) {
        case 'excellent': score += 50; break;
        case 'good': score += 40; break;
        case 'good-breezy': score += 30; break;
        case 'fair': score += 20; break;
        case 'fair-strong': score += 10; break;
        case 'poor': score += 5; break;
        case 'poor-choppy': score += 0; break;
      }

      return { period, score };
    });

    // Get the best period score for the day
    const bestPeriodScore = Math.max(...periods.map(p => p.score));
    
    if (!best || bestPeriodScore > best.score) {
      return {
        date: current.date,
        score: bestPeriodScore,
        summary: current.summary,
        periods: current.periods
      };
    }
    return best;
  }, null);
};

// Update generateSummaries to include wind impact
const generateSummaries = (modelData, location) => {
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
        
        const windImpact = getWindImpact(current.windDirection, current.windSpeed, location);
        
        const currentSummary = `${getWaveDescription(current.waveHeight)} ${current.waveHeight}ft waves, ${getWindDescription(current.windSpeed)} ${current.windSpeed}mph ${getWindDirectionText(current.windDirection)} winds (${windImpact} conditions)`;

        // Find peak conditions for the week
        const peakConditions = findPeakConditions(modelData.days);
        if (!peakConditions) {
            throw new Error('Unable to determine peak conditions');
        }
        
        const peakDate = new Date(peakConditions.date);
        const peakDay = days[peakDate.getDay()];
        const weekSummary = `Building to ${peakConditions.waveHeight}ft waves and ${peakConditions.windSpeed}mph winds by ${peakDay}`;

        // Find best day
        const bestDay = findBestDay(modelData.days, location);
        if (!bestDay) {
            throw new Error('Unable to determine best day');
        }
        
        // Update best day summary to include wind impact
        const bestDate = new Date(bestDay.date);
        const bestPeriod = bestDay.periods[0];
        const bestWindImpact = getWindImpact(bestPeriod.windDirection, bestPeriod.windSpeed, location);
        
        const bestDaySummary = `Best on ${days[bestDate.getDay()]}: ${bestDay.summary.waveHeight.avg}ft waves, ${bestDay.summary.windSpeed.avg}mph ${getWindDirectionText(bestPeriod.windDirection)} winds (${bestWindImpact} conditions)`;

        return {
            current: currentSummary,
            week: weekSummary,
            bestDay: bestDaySummary,
            conditions: windImpact
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
        
        // Determine if east or west coast based on longitude
        const location = lon < -100 ? 'WEST_COAST' : 'EAST_COAST';
        
        const modelData = await getPointForecast(lat, lon);
        
        if (!modelData || !modelData.days) {
            throw new Error('Invalid forecast data received');
        }

        const summaries = generateSummaries(modelData, location);

        return {
            ...modelData,
            summaries,
            location
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