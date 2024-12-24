const { logger } = require('../utils/logger');
const waveModelService = require('./waveModelService');

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

const getWindImpact = (windDirection, windSpeed, location) => {
    const coastConfigs = {
        EAST_COAST: {
            favorable: ['W', 'NW', 'SW'],
            unfavorable: ['E', 'NE', 'SE'],
            neutral: ['N', 'S']
        },
        WEST_COAST: {
            favorable: ['E', 'SE', 'NE'],
            unfavorable: ['W', 'SW', 'NW'],
            neutral: ['N', 'S']
        }
    };

    const windDir = getWindDirectionText(windDirection);
    const config = location.longitude < -100 ? coastConfigs.WEST_COAST : coastConfigs.EAST_COAST;

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

    if (windSpeed > 20) return 'poor-choppy';
    if (windSpeed > 15) return 'fair';
    return 'good';
};

const generateSummaries = (modelData, location) => {
    if (!modelData?.days?.[0]?.periods?.length) {
        throw new Error('Invalid model data structure');
    }

    try {
        // Current conditions from first period
        const current = modelData.days[0].periods[0];
        const windImpact = getWindImpact(current.windDirection, current.windSpeed, location);
        
        const currentSummary = `${getWaveDescription(current.waveHeight)} ${current.waveHeight}ft waves, ${getWindDescription(current.windSpeed)} ${current.windSpeed}mph ${getWindDirectionText(current.windDirection)} winds (${windImpact} conditions)`;

        // Find peak conditions
        const peakConditions = modelData.days.reduce((peak, day) => {
            const maxWaveHeight = day.summary.waveHeight.max;
            const maxWindSpeed = day.summary.windSpeed.max;
            if (!peak || maxWaveHeight > peak.waveHeight || maxWindSpeed > peak.windSpeed) {
                return {
                    date: day.date,
                    waveHeight: maxWaveHeight,
                    windSpeed: maxWindSpeed,
                    windDirection: day.periods[0].windDirection
                };
            }
            return peak;
        }, null);

        const peakDate = new Date(peakConditions.date);
        const weekSummary = `Building to ${peakConditions.waveHeight}ft waves and ${peakConditions.windSpeed}mph winds by ${peakDate.toLocaleDateString('en-US', { weekday: 'long' })}`;

        // Find best day for conditions
        const bestDay = modelData.days.reduce((best, current) => {
            const score = current.periods.reduce((maxScore, period) => {
                const windImpact = getWindImpact(period.windDirection, period.windSpeed, location);
                let score = 0;
                
                // Wave height scoring (2-5ft ideal)
                if (period.waveHeight >= 2 && period.waveHeight <= 5) {
                    score += 50;
                } else if (period.waveHeight > 5) {
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

                return Math.max(maxScore, score);
            }, 0);

            if (!best || score > best.score) {
                return { date: current.date, score, summary: current.summary };
            }
            return best;
        }, null);

        const bestDate = new Date(bestDay.date);
        const bestDaySummary = `Best on ${bestDate.toLocaleDateString('en-US', { weekday: 'long' })}: ${bestDay.summary.waveHeight.avg}ft waves, ${bestDay.summary.windSpeed.avg}mph winds`;

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

async function getProcessedMarineConditions(lat, lon) {
    try {
        logger.info(`Processing marine conditions for lat: ${lat}, lon: ${lon}`);
        
        const modelData = await waveModelService.getPointForecast(lat, lon);
        if (!modelData) {
            throw new Error('No model data available');
        }

        const location = { latitude: lat, longitude: lon };
        const summaries = generateSummaries(modelData, location);

        return {
            ...modelData,
            summaries,
            location
        };
    } catch (error) {
        logger.error('Error processing marine conditions:', error);
        throw error;
    }
}

module.exports = {
    getProcessedMarineConditions,
    generateSummaries
}; 