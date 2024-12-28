const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const ndbcService = require('../services/ndbcService');
const waveModelService = require('../services/waveModelService');
const waveConditionsService = require('../services/waveConditionsService');

/**
 * Get buoy data by ID
 */
const getBuoyData = async (req, res, next) => {
    try {
        const { buoyId } = req.params;
        
        // Fetch current observations and station info
        const [buoyData, stationInfo] = await Promise.all([
            ndbcService.fetchBuoyData(buoyId),
            ndbcService.getStationById(buoyId)
        ]);

        if (!buoyData) {
            throw new AppError(404, 'Buoy data not found');
        }

        // Structure station info
        const buoyInfo = stationInfo ? {
            id: buoyId,
            name: stationInfo.name,
            location: {
                type: "Point",
                coordinates: [stationInfo.lon, stationInfo.lat]
            }
        } : { id: buoyId };

        // Fetch forecast if we have location
        let forecast = null;
        
        if (stationInfo && stationInfo.location && stationInfo.location.coordinates) {
            try {
                // GeoJSON format is [longitude, latitude]
                const [lon, lat] = stationInfo.location.coordinates;
                logger.info(`Checking coordinates for buoy ${buoyId}: lat=${lat}, lon=${lon}`);
                
                if (typeof lat !== 'number' || typeof lon !== 'number') {
                    logger.warn(`Invalid coordinates for buoy ${buoyId}: lat=${lat}, lon=${lon}`);
                } else {
                    logger.info(`Fetching forecast for buoy ${buoyId} at lat=${lat}, lon=${lon}`);
                    forecast = await waveModelService.getPointForecast(lat, lon);
                    
                    if (forecast) {
                        logger.info(`Successfully fetched forecast for buoy ${buoyId}`);
                        forecast.summaries = waveConditionsService.generateSummaries(forecast, {
                            latitude: lat,
                            longitude: lon
                        });
                    } else {
                        logger.warn(`No forecast data returned for buoy ${buoyId}`);
                    }
                }
            } catch (forecastError) {
                logger.warn(`Failed to fetch forecast for buoy ${buoyId}: ${forecastError.message}`, { error: forecastError });
            }
        }

        const response = {
            status: 'success',
            data: {
                buoy: buoyInfo,
                observations: {
                    time: buoyData.time,
                    wind: buoyData.wind.speed ? {
                        direction: buoyData.wind.direction,
                        speed: buoyData.wind.speed,
                        gust: buoyData.wind.gust
                    } : undefined,
                    waves: buoyData.waves.height ? {
                        height: buoyData.waves.height,
                        dominantPeriod: buoyData.waves.dominantPeriod,
                        averagePeriod: buoyData.waves.averagePeriod,
                        direction: buoyData.waves.direction
                    } : undefined,
                    conditions: {
                        pressure: buoyData.conditions.pressure,
                        airTemp: buoyData.conditions.airTemp,
                        waterTemp: buoyData.conditions.waterTemp,
                        dewPoint: buoyData.conditions.dewPoint
                    },
                    trends: buoyData.trends
                },
                forecast: forecast ? {
                    modelRun: forecast.modelRun,
                    days: forecast.days.map(day => ({
                        date: day.date,
                        predictions: day.periods.map(period => ({
                            time: period.time,
                            waves: period.waveHeight ? {
                                height: period.waveHeight,
                                period: period.wavePeriod,
                                direction: period.waveDirection
                            } : undefined,
                            wind: period.windSpeed ? {
                                speed: period.windSpeed,
                                direction: period.windDirection
                            } : undefined
                        })),
                        summary: {
                            waves: day.summary.waveHeight ? {
                                min: day.summary.waveHeight.min,
                                max: day.summary.waveHeight.max,
                                avg: day.summary.waveHeight.avg
                            } : undefined,
                            wind: day.summary.windSpeed ? {
                                min: day.summary.windSpeed.min,
                                max: day.summary.windSpeed.max,
                                avg: day.summary.windSpeed.avg
                            } : undefined
                        }
                    })),
                    summaries: forecast.summaries,
                    units: {
                        waveHeight: 'ft',
                        wavePeriod: 'seconds',
                        waveDirection: 'degrees',
                        windSpeed: 'mph',
                        windDirection: 'degrees'
                    }
                } : null
            }
        };

        // Remove undefined values
        const cleanResponse = JSON.parse(JSON.stringify(response));
        res.status(200).json(cleanResponse);
    } catch (error) {
        logger.error('Error fetching buoy data:', error);
        next(error);
    }
};

module.exports = {
    getBuoyData
}; 