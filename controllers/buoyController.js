const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const ndbcService = require('../services/ndbcService');
const { getSevenDayForecast, generateSummaries } = require('../services/forecastService');

/**
 * Get closest buoy to provided coordinates
 */
const getClosestBuoy = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        logger.info(`Finding closest buoy to lat: ${lat}, lon: ${lon}`);

        // Find closest buoy using haversine distance
        const { station: nearestBuoy, distance } = await ndbcService.findClosestStation(
            parseFloat(lat), 
            parseFloat(lon)
        );

        if (!nearestBuoy) {
            throw new AppError(404, 'No buoy found near this location');
        }

        // Get current conditions
        const currentConditions = await ndbcService.fetchBuoyData(nearestBuoy.id);

        // Get forecast
        const forecast = await getSevenDayForecast(lat, lon);

        // Generate summaries using the same format as forecast service
        const summaries = generateSummaries(forecast);

        res.status(200).json({
            status: 'success',
            data: {
                buoy: nearestBuoy,
                currentConditions,
                forecast: forecast.forecast,
                summaries,
                distance: Math.round(distance) // distance in km
            }
        });
    } catch (error) {
        logger.error('Error in getClosestBuoy:', error);
        next(error);
    }
};

/**
 * Get detailed buoy information including current conditions and forecast
 */
const getBuoyDetails = async (req, res, next) => {
    try {
        const { buoyId } = req.params;
        logger.info(`Getting details for buoy: ${buoyId}`);

        // Get buoy metadata
        const station = await ndbcService.getStationById(buoyId);
        
        if (!station) {
            throw new AppError(404, 'Buoy not found');
        }

        // Get current conditions
        const currentConditions = await ndbcService.fetchBuoyData(buoyId);
        logger.info(`Current conditions: ${JSON.stringify(currentConditions)}`);

        // Get 7-day forecast for buoy location
        const [lon, lat] = station.location.coordinates;
        logger.info(`Fetching forecast for lat: ${lat}, lon: ${lon}`);
        const forecast = await getSevenDayForecast(lat, lon);

        // Only adjust first period if we have valid current conditions
        if (currentConditions && 
            currentConditions.waveHeight && 
            currentConditions.dominantWavePeriod && 
            currentConditions.meanWaveDirection) {
            
            if (forecast.days && forecast.days[0] && forecast.days[0].periods) {
                forecast.days[0].periods[0] = {
                    ...forecast.days[0].periods[0],
                    waveHeight: currentConditions.waveHeight,
                    wavePeriod: currentConditions.dominantWavePeriod,
                    waveDirection: currentConditions.meanWaveDirection,
                    windSpeed: currentConditions.windSpeed || forecast.days[0].periods[0].windSpeed,
                    windDirection: currentConditions.windDirection || forecast.days[0].periods[0].windDirection,
                    source: 'NDBC'
                };
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                buoy: {
                    id: station.id,
                    name: station.name,
                    location: station.location
                },
                currentConditions,
                forecast: forecast.days,
                summaries: forecast.summaries,
                units: forecast.units
            }
        });
    } catch (error) {
        logger.error('Error in getBuoyDetails:', error);
        next(error);
    }
};

module.exports = {
    getClosestBuoy,
    getBuoyDetails
}; 