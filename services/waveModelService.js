const axios = require('axios');
const { logger } = require('../utils/logger');
const { getCache, setCache } = require('../utils/cache');

// WAVEWATCH III Model Configuration
const CONFIG = {
    baseUrl: 'https://nomads.ncep.noaa.gov/dods/wave/gfswave',
    modelRuns: [0, 6, 12, 18],
    grid: {
        lat: { size: 331, start: 0, end: 55, resolution: 0.167 },
        lon: { size: 301, start: 260, end: 310, resolution: 0.167 }
    },
    modelName: 'atlocn.0p16',
    variables: ['htsgwsfc', 'perpwsfc', 'dirpwsfc', 'windsfc', 'wdirsfc'],
    variableNames: {
        htsgwsfc: 'waveHeight',
        perpwsfc: 'wavePeriod',
        dirpwsfc: 'waveDirection',
        windsfc: 'windSpeed',
        wdirsfc: 'windDirection'
    },
    forecastDays: 7,
    periodsPerDay: 8,  // 3-hour intervals
    cacheHours: 6
};

// Pure function to get latest available model run
const getModelRun = (now = new Date()) => {
    const hour = now.getUTCHours();
    const adjustedHour = hour - 5; // Account for ~5 hour processing delay
    
    const runHour = adjustedHour < 0
        ? { hour: 18, dayOffset: -1 }
        : {
            hour: CONFIG.modelRuns.reduce((acc, run) => adjustedHour >= run ? run : acc),
            dayOffset: 0
          };
    
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + runHour.dayOffset);
    
    return {
        date: date.toISOString().split('T')[0].replace(/-/g, ''),
        hour: runHour.hour.toString().padStart(2, '0')
    };
};

// Pure functions for coordinate calculations
const normalizeLongitude = lon => lon < 0 ? lon + 360 : lon;

const getGridIndex = (value, start, resolution) => 
    Math.round((value - start) / resolution);

const validateGridIndex = (idx, size, dimension, value) => {
    if (idx < 0 || idx >= size) {
        throw new Error(`${dimension} ${value} is outside model bounds`);
    }
    return idx;
};

const getGridIndices = (lat, lon) => {
    const normalizedLon = normalizeLongitude(lon);
    const latIdx = getGridIndex(lat, CONFIG.grid.lat.start, CONFIG.grid.lat.resolution);
    const lonIdx = getGridIndex(normalizedLon, CONFIG.grid.lon.start, CONFIG.grid.lon.resolution);
    
    return {
        latIdx: validateGridIndex(latIdx, CONFIG.grid.lat.size, 'Latitude', lat),
        lonIdx: validateGridIndex(lonIdx, CONFIG.grid.lon.size, 'Longitude', normalizedLon)
    };
};

// Pure function for parsing values
const parseValue = line => {
    if (!line || typeof line !== 'string') return null;
    const match = line.match(/\[\d+\]\[\d+\],\s*([-\d.]+)/);
    const value = match ? parseFloat(match[1]) : null;
    return (value !== null && !isNaN(value) && value < 9.9e19) ? value : null;
};

// Pure function for converting values
const convertValue = (value, type) => {
    if (value === null || isNaN(value)) return null;
    const conversions = {
        htsgwsfc: v => (v * 3.28084).toFixed(1),  // m to ft
        windsfc: v => (v * 2.237).toFixed(1),      // m/s to mph
        dirpwsfc: v => Math.round(v),              // wave direction to nearest degree
        wdirsfc: v => Math.round(v),               // wind direction to nearest degree
        perpwsfc: v => parseFloat(v.toFixed(1))    // wave period to 1 decimal
    };
    return (conversions[type] || (v => v.toFixed(1)))(value);
};

// Main forecast function
async function getPointForecast(lat, lon) {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid latitude or longitude');
    }

    const cacheKey = `ww3_forecast_${lat}_${lon}`;
    try {
        const cached = await getCache(cacheKey);
        if (cached) return cached;

        const { latIdx, lonIdx } = getGridIndices(lat, lon);
        const modelRun = getModelRun();
        
        // Construct URL
        const url = `${CONFIG.baseUrl}/${modelRun.date}/gfswave.${CONFIG.modelName}_${modelRun.hour}z.ascii?` +
            CONFIG.variables.map(v => `${v}[0:7][${latIdx}][${lonIdx}]`).join(',');

        logger.info(`Requesting forecast from: ${url}`);
        const response = await axios.get(url);
        
        if (!response.data || response.data.includes('</html>')) {
            throw new Error(`Model data not available for ${modelRun.date}_${modelRun.hour}z`);
        }

        // Parse forecast data
        const lines = response.data.split('\n');
        if (lines.length < 10) {
            throw new Error('Invalid response format from wave model');
        }

        const forecast = Array(CONFIG.forecastDays * CONFIG.periodsPerDay).fill().map(() => ({}));
        let currentVar = null;
        let timeIndex = 0;
        let foundData = false;

        lines.forEach(line => {
            const varMatch = CONFIG.variables.find(v => line.includes(`${v},`));
            if (varMatch) {
                currentVar = varMatch;
                timeIndex = 0;
                return;
            }

            if (!currentVar) return;

            const value = parseValue(line);
            if (value !== null && timeIndex < forecast.length) {
                foundData = true;
                const time = new Date(Date.now() + timeIndex * 3 * 60 * 60 * 1000);
                forecast[timeIndex] = {
                    ...forecast[timeIndex],
                    time: time.toISOString(),
                    [CONFIG.variableNames[currentVar]]: convertValue(value, currentVar)
                };
                timeIndex++;
            }
        });

        if (!foundData) {
            throw new Error('No data found in wave model response');
        }

        const validForecast = forecast.filter(f => 
            CONFIG.variables.every(v => {
                const key = CONFIG.variableNames[v];
                return f[key] && !isNaN(parseFloat(f[key]));
            })
        );

        if (!validForecast.length) {
            throw new Error('No valid forecast periods found in response');
        }

        // Group forecast by days
        const groupedForecast = validForecast.reduce((acc, period) => {
            const date = period.time.split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    date,
                    periods: []
                };
            }
            acc[date].periods.push({
                time: period.time,
                waveHeight: period.waveHeight,
                wavePeriod: period.wavePeriod,
                waveDirection: period.waveDirection,
                windSpeed: period.windSpeed,
                windDirection: period.windDirection
            });
            return acc;
        }, {});

        // Calculate daily summaries
        const days = Object.values(groupedForecast).map(day => {
            const periods = day.periods;
            const summary = {
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
            };

            return {
                date: day.date,
                summary,
                periods: periods
            };
        });

        // Add units to the response
        const result = {
            location: { latitude: lat, longitude: lon },
            generated: new Date().toISOString(),
            modelRun: `${modelRun.date}${modelRun.hour}z`,
            units: {
                waveHeight: 'ft',
                wavePeriod: 'seconds',
                waveDirection: 'degrees',
                windSpeed: 'mph',
                windDirection: 'degrees'
            },
            days: days
        };

        await setCache(cacheKey, result, CONFIG.cacheHours * 60 * 60);
        return result;

    } catch (error) {
        logger.error(`Forecast error for ${lat}N ${lon}W: ${error.message}`);
        if (error.response) {
            logger.error(`Response status: ${error.response.status}`);
        }
        throw new Error(`Unable to get wave forecast: ${error.message}`);
    }
}

module.exports = { getPointForecast }; 