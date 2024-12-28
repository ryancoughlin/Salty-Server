const axios = require('axios');
const { logger } = require('../utils/logger');
const { getOrSet } = require('../utils/cache');

// Simplified configuration
const CONFIG = {
    baseUrl: 'https://nomads.ncep.noaa.gov/dods/wave/gfswave',
    modelName: 'atlocn.0p16',
    grid: {
        lat: { size: 331, start: 0, end: 55, resolution: 0.167 },
        lon: { size: 301, start: 260, end: 310, resolution: 0.167 }
    },
    variables: {
        waveHeight: { key: 'htsgwsfc', unit: 'ft', convert: v => (v * 3.28084).toFixed(1) },
        wavePeriod: { key: 'perpwsfc', unit: 'seconds', convert: v => parseFloat(v.toFixed(1)) },
        waveDirection: { key: 'dirpwsfc', unit: 'degrees', convert: v => Math.round(v) },
        windSpeed: { key: 'windsfc', unit: 'mph', convert: v => (v * 2.237).toFixed(1) },
        windDirection: { key: 'wdirsfc', unit: 'degrees', convert: v => Math.round(v) }
    },
    forecastDays: 7,
    periodsPerDay: 8,
    cacheHours: 6
};

// Pure utility functions
const getModelRun = (now = new Date()) => {
    const hour = now.getUTCHours();
    const runHour = hour >= 18 ? 12 : 
                   hour >= 12 ? 6 : 
                   hour >= 6 ? 0 : 18;
    
    const date = new Date(now);
    if (runHour === 18 && hour < 6) {
        date.setUTCDate(date.getUTCDate() - 1);
    }
    
    return {
        date: date.toISOString().split('T')[0].replace(/-/g, ''),
        hour: runHour.toString().padStart(2, '0')
    };
};

const getGridLocation = (lat, lon) => {
    const normalizedLon = lon < 0 ? lon + 360 : lon;
    const latIdx = Math.round((lat - CONFIG.grid.lat.start) / CONFIG.grid.lat.resolution);
    const lonIdx = Math.round((normalizedLon - CONFIG.grid.lon.start) / CONFIG.grid.lon.resolution);
    
    if (latIdx < 0 || latIdx >= CONFIG.grid.lat.size || 
        lonIdx < 0 || lonIdx >= CONFIG.grid.lon.size) {
        throw new Error(`Location (${lat}, ${lon}) is outside model bounds`);
    }
    
    return { latIdx, lonIdx };
};

const parseModelValue = line => {
    const match = line.match(/\[\d+\]\[\d+\],\s*([-\d.]+)/);
    const value = match ? parseFloat(match[1]) : null;
    return (value !== null && !isNaN(value) && value < 9.9e19) ? value : null;
};

const processModelData = (lines) => {
    const forecast = Array(CONFIG.forecastDays * CONFIG.periodsPerDay).fill().map(() => ({}));
    let currentVar = null;
    let timeIndex = 0;

    lines.forEach(line => {
        const varMatch = Object.values(CONFIG.variables)
            .find(v => line.includes(`${v.key},`));
        
        if (varMatch) {
            currentVar = varMatch;
            timeIndex = 0;
            return;
        }

        if (!currentVar || timeIndex >= forecast.length) return;

        const value = parseModelValue(line);
        if (value !== null) {
            const varName = Object.entries(CONFIG.variables)
                .find(([_, v]) => v === currentVar)[0];
            
            forecast[timeIndex] = {
                ...forecast[timeIndex],
                time: new Date(Date.now() + timeIndex * 3 * 60 * 60 * 1000).toISOString(),
                [varName]: currentVar.convert(value)
            };
            timeIndex++;
        }
    });

    return forecast.filter(f => 
        Object.keys(CONFIG.variables)
            .every(key => f[key] && !isNaN(parseFloat(f[key])))
    );
};

const calculateDailySummary = periods => ({
    waveHeight: {
        min: Math.min(...periods.map(p => parseFloat(p.waveHeight))),
        max: Math.max(...periods.map(p => parseFloat(p.waveHeight))),
        avg: parseFloat((periods.reduce((sum, p) => sum + parseFloat(p.waveHeight), 0) / periods.length).toFixed(1))
    },
    wavePeriod: {
        min: Math.min(...periods.map(p => parseFloat(p.wavePeriod))),
        max: Math.max(...periods.map(p => parseFloat(p.wavePeriod))),
        avg: parseFloat((periods.reduce((sum, p) => sum + parseFloat(p.wavePeriod), 0) / periods.length).toFixed(1))
    },
    windSpeed: {
        min: Math.min(...periods.map(p => parseFloat(p.windSpeed))),
        max: Math.max(...periods.map(p => parseFloat(p.windSpeed))),
        avg: parseFloat((periods.reduce((sum, p) => sum + parseFloat(p.windSpeed), 0) / periods.length).toFixed(1))
    }
});

// Main forecast function
async function getPointForecast(lat, lon) {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid latitude or longitude');
    }

    const cacheKey = `ww3_forecast_${lat}_${lon}`;
    
    try {
        const { data: forecast } = await getOrSet(
            cacheKey,
            async () => {
                const { latIdx, lonIdx } = getGridLocation(lat, lon);
                const modelRun = getModelRun();
                
                const url = `${CONFIG.baseUrl}/${modelRun.date}/gfswave.${CONFIG.modelName}_${modelRun.hour}z.ascii?` +
                    Object.values(CONFIG.variables)
                        .map(v => `${v.key}[0:7][${latIdx}][${lonIdx}]`)
                        .join(',');

                logger.info(`Requesting forecast from: ${url}`);
                const response = await axios.get(url);
                
                if (!response.data || response.data.includes('</html>')) {
                    throw new Error(`Model data not available for ${modelRun.date}_${modelRun.hour}z`);
                }

                const validForecast = processModelData(response.data.trim().split('\n'));
                
                if (!validForecast.length) {
                    throw new Error('No valid forecast data found');
                }

                // Group by days
                const groupedForecast = validForecast.reduce((acc, period) => {
                    const date = period.time.split('T')[0];
                    if (!acc[date]) acc[date] = { date, periods: [] };
                    acc[date].periods.push(period);
                    return acc;
                }, {});

                return {
                    location: { latitude: lat, longitude: lon },
                    generated: new Date().toISOString(),
                    modelRun: `${modelRun.date}${modelRun.hour}z`,
                    units: Object.fromEntries(
                        Object.entries(CONFIG.variables)
                            .map(([name, config]) => [name, config.unit])
                    ),
                    days: Object.values(groupedForecast).map(day => ({
                        date: day.date,
                        summary: calculateDailySummary(day.periods),
                        periods: day.periods
                    }))
                };
            },
            CONFIG.cacheHours * 60 * 60
        );

        return forecast;

    } catch (error) {
        logger.error(`Forecast error for ${lat}N ${lon}W: ${error.message}`);
        throw new Error(`Unable to get wave forecast: ${error.message}`);
    }
}

module.exports = {
    getPointForecast,
    CONFIG
}; 