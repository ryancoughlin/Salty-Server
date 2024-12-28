const { logger } = require('../utils/logger');
const waveModelService = require('./waveModelService');

// Constants for condition classifications
const CONDITIONS = {
    WAVE_HEIGHT: {
        FLAT: { max: 1.0, description: 'flat' },
        SMALL: { max: 2.0, description: 'small' },
        MILD: { max: 3.0, description: 'mild' },
        MODERATE: { max: 4.0, description: 'moderate' },
        CONSIDERABLE: { max: 6.0, description: 'considerable' },
        LARGE: { max: 8.0, description: 'large' },
        HUGE: { max: Infinity, description: 'huge' }
    },
    WIND: {
        LIGHT: { max: 5, description: 'light' },
        GENTLE: { max: 10, description: 'gentle' },
        MODERATE: { max: 15, description: 'moderate' },
        FRESH: { max: 20, description: 'fresh' },
        STRONG: { max: 25, description: 'strong' },
        VERY_STRONG: { max: Infinity, description: 'very strong' }
    },
    COAST: {
        EAST: {
            favorable: ['W', 'NW', 'SW'],
            unfavorable: ['E', 'NE', 'SE'],
            neutral: ['N', 'S']
        },
        WEST: {
            favorable: ['E', 'SE', 'NE'],
            unfavorable: ['W', 'SW', 'NW'],
            neutral: ['N', 'S']
        }
    }
};

/**
 * Get wave height description based on height in feet
 */
const getWaveDescription = (heightInFeet) => {
    const category = Object.values(CONDITIONS.WAVE_HEIGHT)
        .find(cat => heightInFeet <= cat.max);
    return category.description;
};

/**
 * Get wind description based on speed in mph
 */
const getWindDescription = (speed) => {
    const category = Object.values(CONDITIONS.WIND)
        .find(cat => speed <= cat.max);
    return category.description;
};

/**
 * Convert degrees to cardinal direction
 */
const getWindDirectionText = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees + 22.5) % 360) / 45);
    return directions[index % 8];
};

/**
 * Calculate wave steepness and quality
 */
const analyzeWaveQuality = (height, period) => {
    if (!height || !period) return null;
    
    const steepness = height / (period * period);
    let quality;

    if (steepness < 0.004) quality = 'clean';
    else if (steepness < 0.007) quality = 'fair';
    else if (steepness < 0.01) quality = 'choppy';
    else quality = 'rough';

    return { steepness, quality };
};

/**
 * Analyze wind impact based on direction and coast
 */
const getWindImpact = (windDirection, windSpeed, location) => {
    const windDir = getWindDirectionText(windDirection);
    const config = location.longitude < -100 ? CONDITIONS.COAST.WEST : CONDITIONS.COAST.EAST;

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

/**
 * Score conditions for activity suitability
 */
const scoreConditions = (period) => {
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
    const windImpact = getWindImpact(period.windDirection, period.windSpeed, period.location);
    const impactScores = {
        'excellent': 50,
        'good': 40,
        'good-breezy': 30,
        'fair': 20,
        'fair-strong': 10,
        'poor': 5,
        'poor-choppy': 0
    };

    score += impactScores[windImpact] || 0;

    return score;
};

/**
 * Generate human-readable summaries for conditions
 */
const generateSummaries = (modelData, location) => {
    if (!modelData?.days?.[0]?.periods?.length) {
        throw new Error('Invalid model data structure');
    }

    try {
        const current = modelData.days[0].periods[0];
        const next12Hours = modelData.days[0].periods.slice(0, 4);
        
        // Build summary parts based on available data
        const summaryParts = [];
        
        // Wave summary if available
        if (current.waveHeight) {
            const maxWaveHeight = Math.max(...next12Hours.map(p => p.waveHeight));
            const waveChange = maxWaveHeight - current.waveHeight;
            const trend = Math.abs(waveChange) >= 0.5 ? 
                (waveChange > 0 ? 'increasing' : 'decreasing') : 
                'steady';
            
            summaryParts.push(`${current.waveHeight}ft waves${current.wavePeriod ? ` at ${current.wavePeriod}s` : ''}, ${trend}`);
        }

        // Wind summary if available
        if (current.windSpeed) {
            summaryParts.push(`${getWindDescription(current.windSpeed)}mph ${getWindDirectionText(current.windDirection)}`);
        }

        const currentSummary = summaryParts.join(', ');

        // Week summary based on available data
        const peakDay = modelData.days.reduce((peak, day) => {
            if (!day.summary.waveHeight?.max) return peak;
            return (!peak || day.summary.waveHeight.max > peak.waveHeight) ? 
                { 
                    date: day.date, 
                    waveHeight: day.summary.waveHeight.max,
                    windSpeed: day.summary.windSpeed?.avg 
                } : 
                peak;
        }, null);

        let weekSummary = '';
        if (peakDay) {
            const peakDate = new Date(peakDay.date);
            weekSummary = `Peaks ${peakDate.toLocaleDateString('en-US', { weekday: 'long' })} at ${peakDay.waveHeight}ft` + 
                (peakDay.windSpeed ? ` with ${getWindDescription(peakDay.windSpeed)}mph winds` : '');
        }

        return {
            current: currentSummary || 'No current observations available',
            week: weekSummary || 'No forecast available',
            conditions: current.waveHeight && current.wavePeriod ? 
                analyzeWaveQuality(current.waveHeight, current.wavePeriod)?.quality : 
                'unknown'
        };
    } catch (error) {
        logger.error('Error generating summaries:', error);
        return {
            current: 'Forecast unavailable',
            week: 'Forecast unavailable',
            conditions: 'unknown'
        };
    }
};

/**
 * Get processed marine conditions including forecast and summaries
 */
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
    generateSummaries,
    getWindImpact,
    getWaveDescription,
    getWindDescription,
    getWindDirectionText,
    analyzeWaveQuality,
    CONDITIONS
}; 