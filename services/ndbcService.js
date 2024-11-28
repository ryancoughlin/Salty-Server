const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { getCache, setCache } = require('../utils/cache');

const NDBC_BASE_URL = 'https://www.ndbc.noaa.gov/data/realtime2';

// Conversion helpers
const metersToFeet = meters => meters * 3.28084;
const knotsToMph = knots => knots * 1.15078;

class NDBCService {
    constructor() {
        this.stations = this.loadStations();
    }

    loadStations() {
        try {
            const stationsPath = path.join(__dirname, '../data/ndbc-stations.json');
            return JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
        } catch (error) {
            logger.error('Error loading stations:', error.message);
            return [];
        }
    }

    async getStationById(stationId) {
        return this.stations.find(s => s.id === stationId);
    }

    parseValue(value, type) {
        if (!value || value === 'MM') return null;
        const num = parseFloat(value);
        if (isNaN(num)) return null;
        
        switch(type) {
            case 'WVHT': return parseFloat((metersToFeet(num)).toFixed(1));  // meters to feet
            case 'WSPD': return parseFloat((knotsToMph(num)).toFixed(1));    // m/s to mph
            case 'DPD':
            case 'MWD':
            case 'WDIR': return Math.round(num);  // round directions and periods
            case 'WTMP': return parseFloat(num.toFixed(1));  // water temp
            default: return num;
        }
    }

    async fetchBuoyData(buoyId) {
        try {
            const cacheKey = `buoy_data_${buoyId}`;
            const cached = await getCache(cacheKey);
            if (cached) return cached;

            const url = `${NDBC_BASE_URL}/${buoyId}.txt`;
            logger.info(`Fetching buoy data from: ${url}`);
            
            const response = await axios.get(url);
            const lines = response.data.trim().split('\n');
            
            // Need at least headers and one data line
            if (lines.length < 3) {
                logger.error('Response too short');
                return null;
            }

            // Skip header lines starting with #
            const dataLines = lines.filter(line => !line.startsWith('#'));
            if (dataLines.length === 0) {
                logger.error('No data lines found');
                return null;
            }

            // Get the most recent data line
            const values = dataLines[0].trim().split(/\s+/);
            logger.info(`Processing data line: ${values.join(',')}`);

            // Create data object with only the fields we need
            const data = {
                time: new Date(Date.UTC(
                    parseInt(values[0]),  // year
                    parseInt(values[1]) - 1,  // month (0-based)
                    parseInt(values[2]),  // day
                    parseInt(values[3]),  // hour
                    parseInt(values[4])   // minute
                )).toISOString(),
                waveHeight: this.parseValue(values[8], 'WVHT'),
                dominantWavePeriod: this.parseValue(values[9], 'DPD'),
                meanWaveDirection: this.parseValue(values[11], 'MWD'),
                windSpeed: this.parseValue(values[6], 'WSPD'),
                windDirection: this.parseValue(values[5], 'WDIR'),
                waterTemp: this.parseValue(values[14], 'WTMP')
            };

            logger.info(`Parsed buoy data: ${JSON.stringify(data)}`);

            // Only cache and return if we have at least wave or wind data
            if (data.waveHeight || data.windSpeed) {
                await setCache(cacheKey, data, 30 * 60);  // Cache for 30 minutes
                return data;
            }

            logger.error('No valid wave or wind data found');
            return null;
        } catch (error) {
            logger.error(`Error fetching buoy ${buoyId}: ${error.message}`);
            return null;
        }
    }

    async findClosestStation(lat, lon) {
        const station = this.stations.find(s => s.id === '44098');  // Jeffreys Ledge
        return { station, distance: 0 };
    }
}

module.exports = new NDBCService();
// ... existing code ... 