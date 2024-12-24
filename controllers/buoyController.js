const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const ndbcService = require('../services/ndbcService');
const { getProcessedMarineConditions } = require('../services/waveConditionsService');

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

        // Get current conditions and trends
        const currentConditions = await ndbcService.fetchBuoyData(buoyId);
        if (!currentConditions) {
            throw new AppError(404, 'No current conditions available for this buoy');
        }

        // Get processed marine conditions including forecast
        const [lon, lat] = station.location.coordinates;
        const marineConditions = await getProcessedMarineConditions(lat, lon);

        // Merge current conditions with first forecast period if available
        if (marineConditions?.days?.[0]?.periods?.[0]) {
            marineConditions.days[0].periods[0] = {
                ...marineConditions.days[0].periods[0],
                waveHeight: currentConditions.waves.height,
                wavePeriod: currentConditions.waves.dominantPeriod,
                waveDirection: currentConditions.waves.direction,
                windSpeed: currentConditions.wind.speed || marineConditions.days[0].periods[0].windSpeed,
                windDirection: currentConditions.wind.direction || marineConditions.days[0].periods[0].windDirection,
                source: 'NDBC'
            };
        }

        res.status(200).json({
            status: 'success',
            data: {
                buoy: {
                    id: station.id,
                    name: station.name,
                    location: station.location
                },
                observations: {
                    time: currentConditions.time,
                    wind: currentConditions.wind,
                    waves: currentConditions.waves,
                    conditions: currentConditions.conditions,
                    trends: currentConditions.trends
                },
                forecast: {
                    days: marineConditions.days,
                    summaries: marineConditions.summaries,
                    units: marineConditions.units,
                    modelRun: marineConditions.modelRun
                }
            }
        });
    } catch (error) {
        logger.error('Error in getBuoyDetails:', error);
        next(error);
    }
};

module.exports = {
    getBuoyDetails
}; 